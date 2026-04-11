import mongoose from "mongoose";
import Feedback from "../models/FeedbackModel.js";
import User from "../models/UserModel.js";
import { sendFeedbackNotificationEmail } from "../services/feedbackMailService.js";

const STUDENT_ROLE = process.env.STUDENT_ROLE || "user";
const TUTOR_ROLE = process.env.TUTOR_ROLE || "tutor";

/**
 * POST /api/feedbacks
 * student submits or updates feedback (rating+message) for a tutor
 * body: { tutorId, rating, message, sessionId? }
 */
export const submitFeedback = async (req, res) => {
  try {
    // only student/admin can submit
    if (req.user.role !== STUDENT_ROLE && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only students can submit feedback" });
    }

    const { tutorId, rating, message, sessionId } = req.body;

    if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Valid tutorId is required" });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    if (sessionId && !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    const tutor = await User.findById(tutorId).select("_id role fullName email");
    console.log('Tutor lookup result:', { id: tutorId, role: tutor?.role, fullName: tutor?.fullName });
    console.log('TUTOR_ROLE constant:', TUTOR_ROLE);
    
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // enforce "tutor" role if you want strictness:
    if (tutor.role !== TUTOR_ROLE && tutor.role !== "admin") {
      console.log('Role check failed - Expected:', TUTOR_ROLE, 'Got:', tutor.role);
      return res.status(400).json({ message: "Target user is not a tutor" });
    }

    const payload = {
      student: req.user._id,
      tutor: tutorId,
      session: sessionId || null,
      rating: numRating,
      message: (message || "").trim(),
    };

    // Create new feedback record (allows multiple feedbacks per student-tutor pair)
    const saved = await Feedback.create(payload);

    // Update tutor's rating in tutorProfile
    const allFeedback = await Feedback.find({ tutor: tutorId });
    if (allFeedback.length > 0) {
      const averageRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
      await User.findByIdAndUpdate(
        tutorId,
        {
          "tutorProfile.rating.average": parseFloat(averageRating.toFixed(1)),
          "tutorProfile.rating.count": allFeedback.length,
        },
        { returnDocument: 'after' }
      );
      console.log(`Updated tutor rating: avg=${averageRating.toFixed(1)}, count=${allFeedback.length}`);
    }

    // Send email asynchronously without blocking response
    Promise.resolve().then(() => {
      return sendFeedbackNotificationEmail({
        studentName: req.user.fullName || "Student",
        studentEmail: req.user.email || "unknown",
        tutorName: tutor.fullName,
        tutorEmail: tutor.email,
        rating: numRating,
        message: (message || "").trim(),
        sessionId: sessionId || null,
      });
    }).catch((e) => {
      // Silently catch email errors to prevent test timeouts
      if (process.env.NODE_ENV !== 'test') {
        console.error("Feedback notification email failed:", e.message);
      }
    });

    return res.status(201).json({ message: "Feedback saved", feedback: saved });
  } catch (err) {
    // Handle MongoDB duplicate key error from old unique index
    if (err.code === 11000) {
      // Drop the old index and retry
      try {
        await Feedback.collection.dropIndex('student_1_tutor_1_session_1');
        console.log('Dropped old unique index, retrying...');
        const payload = {
          student: req.user._id,
          tutor: tutorId,
          rating: numRating,
          message: (message || "").trim(),
          session: sessionId || null,
        };
        const saved = await Feedback.create(payload);
        return res.status(201).json({ message: "Feedback saved", feedback: saved });
      } catch (retryErr) {
        console.error('Retry failed:', retryErr.message);
        return res.status(500).json({ message: "Server error after index drop", error: retryErr.message });
      }
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/feedbacks/me
 * student sees their own submitted feedbacks
 */
export const getMyFeedbacks = async (req, res) => {
  try {
    const list = await Feedback.find({ student: req.user._id })
      .populate("tutor", "fullName email role")
      .sort({ createdAt: -1 });

    return res.json({ count: list.length, feedbacks: list });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/feedbacks/tutor/:tutorId
 * tutor/admin can view feedback messages list for a tutor
 */
export const getTutorFeedbacks = async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Invalid tutorId" });
    }

    const isAdmin = req.user.role === "admin";
    const isTutorSelf = req.user.role === TUTOR_ROLE && String(req.user._id) === String(tutorId);

    if (!isAdmin && !isTutorSelf) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const feedbacks = await Feedback.find({ tutor: tutorId })
      .populate("student", "fullName email role")
      .sort({ createdAt: -1 });

    return res.json({ count: feedbacks.length, feedbacks });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/feedbacks/tutor/:tutorId/ratings
 * anyone logged in can view rating stats (avg + breakdown)
 */
export const getTutorRatingStats = async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Invalid tutorId" });
    }

    const stats = await Feedback.aggregate([
      { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
      {
        $group: {
          _id: "$tutor",
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          tutorId: "$_id",
          avgRating: { $round: ["$avgRating", 2] },
          totalRatings: 1,
          breakdown: {
            1: "$r1",
            2: "$r2",
            3: "$r3",
            4: "$r4",
            5: "$r5",
          },
        },
      },
    ]);

    return res.json(
      stats[0] || {
        tutorId,
        avgRating: 0,
        totalRatings: 0,
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/feedbacks
 * admin can view all feedbacks
 */
export const getAllFeedbacks = async (req, res) => {
  try {
    // Only admins can view all feedbacks
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access all feedbacks" });
    }

    const feedbacks = await Feedback.find()
      .populate("student", "fullName email")
      .populate("tutor", "fullName email")
      .sort({ createdAt: -1 });

    return res.json({ 
      success: true,
      count: feedbacks.length, 
      feedbacks: feedbacks.map(fb => ({
        _id: fb._id,
        rating: fb.rating,
        message: fb.message,
        studentName: fb.student?.fullName || "Unknown",
        tutorId: fb.tutor?._id,
        tutorName: fb.tutor?.fullName,
        createdAt: fb.createdAt,
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * DELETE /api/feedbacks/:id
 * student deletes own feedback, tutor deletes feedback about themselves, admin deletes any
 */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback id" });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(feedback.student) === String(req.user._id);
    const isTutorRecipient = String(feedback.tutor) === String(req.user._id);

    if (!isAdmin && !isOwner && !isTutorRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Feedback.deleteOne({ _id: id });
    return res.json({ message: "Feedback deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * PUT /api/feedbacks/admin/:id
 * admin can update any feedback (rating, message)
 */
export const updateFeedbackAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, message } = req.body;

    // Only admin can update
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update feedbacks" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback id" });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    // Validate rating if provided
    if (rating) {
      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: "rating must be between 1 and 5" });
      }
      feedback.rating = numRating;
    }

    // Update message if provided
    if (message !== undefined) {
      feedback.message = (message || "").trim();
    }

    const updated = await feedback.save();

    // Recalculate tutor rating after update
    const allFeedback = await Feedback.find({ tutor: feedback.tutor });
    if (allFeedback.length > 0) {
      const averageRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
      await User.findByIdAndUpdate(
        feedback.tutor,
        {
          "tutorProfile.rating.average": parseFloat(averageRating.toFixed(1)),
          "tutorProfile.rating.count": allFeedback.length,
        },
        { returnDocument: 'after' }
      );
    }

    return res.json({ message: "Feedback updated", feedback: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * POST /api/feedbacks/admin/create
 * admin can create feedback on behalf of a student for any tutor
 */
export const createFeedbackAdmin = async (req, res) => {
  try {
    // Only admin can create feedback on behalf of others
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create feedback" });
    }

    const { studentId, tutorId, rating, message, sessionId } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Valid studentId is required" });
    }

    if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Valid tutorId is required" });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    if (sessionId && !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    // Verify student exists
    const student = await User.findById(studentId).select("_id fullName email role");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Verify tutor exists
    const tutor = await User.findById(tutorId).select("_id fullName email role");
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const payload = {
      student: studentId,
      tutor: tutorId,
      session: sessionId || null,
      rating: numRating,
      message: (message || "").trim(),
    };

    const saved = await Feedback.create(payload);

    // Update tutor's rating
    const allFeedback = await Feedback.find({ tutor: tutorId });
    if (allFeedback.length > 0) {
      const averageRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
      await User.findByIdAndUpdate(
        tutorId,
        {
          "tutorProfile.rating.average": parseFloat(averageRating.toFixed(1)),
          "tutorProfile.rating.count": allFeedback.length,
        },
        { returnDocument: 'after' }
      );
    }

    return res.status(201).json({ message: "Feedback created by admin", feedback: saved });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};