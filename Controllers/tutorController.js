import User from "../models/UserModel.js";
import Feedback from "../models/FeedbackModel.js";
import { StatusCodes } from "http-status-codes";

// Get all tutors with optional filtering and pagination
export const getAllTutors = async (req, res) => {
  try {
    const { subject, page = 1, limit = 10 } = req.query;
    
    const query = { role: "tutor" };
    if (subject) query["tutorProfile.subjects"] = subject.toLowerCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tutors = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpiry")
      .skip(skip)
      .limit(parseInt(limit))
      .sort("-createdAt");

    const total = await User.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      tutors,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to fetch tutors",
      error: error.message,
    });
  }
};

// Get tutors by specific subject
export const getTutorsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    
    const tutors = await User.find({
      role: "tutor",
      "tutorProfile.subjects": subject.toLowerCase(),
    })
      .select("-password -resetPasswordToken -resetPasswordExpiry")
      .sort({ "tutorProfile.rating.average": -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      subject,
      count: tutors.length,
      tutors,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to fetch tutors",
      error: error.message,
    });
  }
};

// Get available subjects
export const getAvailableSubjects = async (req, res) => {
  try {
    const subjects = await User.aggregate([
      { $match: { role: "tutor" } },
      { $unwind: "$tutorProfile.subjects" },
      { $group: { _id: "$tutorProfile.subjects", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, subject: "$_id", count: 1 } },
    ]);

    res.status(StatusCodes.OK).json({ success: true, subjects });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// Get tutor by ID
export const getTutorById = async (req, res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: "tutor" })
      .select("-password -resetPasswordToken -resetPasswordExpiry");

    if (!tutor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: "Tutor not found",
      });
    }

    res.status(StatusCodes.OK).json({ success: true, tutor });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to fetch tutor",
      error: error.message,
    });
  }
};

// Get students for a tutor
export const getTutorStudents = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    // Only tutors can view their own students, admins can view any tutor's students
    if (req.user.role === 'tutor' && String(req.user._id) !== String(tutorId)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: 'You can only view your own students',
      });
    }

    // Get unique students who have given feedback to this tutor
    const feedbacks = await Feedback.find({ tutor: tutorId }).distinct('student');
    
    // Fetch student details
    const students = await User.find({ 
      _id: { $in: feedbacks },
      role: 'user'
    }).select('-password -resetPasswordToken -resetPasswordExpiry').sort({ fullName: 1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: students.length,
      students: students.map(student => ({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        location: student.location,
        avatar: student.avatar,
        createdAt: student.createdAt,
      })),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to fetch students',
      error: error.message,
    });
  }
};

// Get all available students (for tutors to add progress)
export const getAllStudents = async (req, res) => {
  try {
    // Only tutors and admins can fetch students
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: 'Only tutors and admins can access this resource',
      });
    }

    const { search } = req.query;
    let query = { role: 'user' }; // Fetch users with role 'user' (students)

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('_id fullName name email phoneNumber location avatar')
      .sort({ fullName: 1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to fetch students',
      error: error.message,
    });
  }
};
