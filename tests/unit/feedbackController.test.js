/**
 * UNIT TESTS - Controllers/feedbackController.js
 * Tests each feedback controller function in isolation using mocked dependencies.
 * Covers all feedback functions.
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

jest.mock("../../models/FeedbackModel.js");
jest.mock("../../models/UserModel.js");
jest.mock("../../services/feedbackMailService.js", () => ({
  sendFeedbackNotificationEmail: jest.fn().mockResolvedValue(true),
}));

import Feedback from "../../models/FeedbackModel.js";
import User from "../../models/UserModel.js";
import { sendFeedbackNotificationEmail } from "../../services/feedbackMailService.js";

import {
  submitFeedback,
  getMyFeedbacks,
  getTutorFeedbacks,
  getTutorRatingStats,
  getAllFeedbacks,
  deleteFeedback,
  updateFeedbackAdmin,
  createFeedbackAdmin,
} from "../../Controllers/feedbackController.js";

// Helper functions
const buildMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildUser = (role = "user", overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  fullName: "Test User",
  email: "test@example.com",
  role,
  ...overrides,
});

const buildFeedback = (studentId, tutorId, overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  student: studentId,
  tutor: tutorId,
  rating: 5,
  message: "Great tutor!",
  session: null,
  createdAt: new Date(),
  ...overrides,
});

describe("submitFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock Mongoose findById query chain
  const mockFindByIdQuery = (returnValue) => {
    return {
      select: jest.fn().mockResolvedValue(returnValue),
    };
  };

  test("should submit feedback with valid rating", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student._id, tutor._id);

    const req = {
      user: student,
      body: {
        tutorId: tutor._id.toString(),
        rating: 4,
        message: "Excellent teaching",
        sessionId: null,
      },
    };
    const res = buildMockRes();

    User.findById = jest.fn().mockReturnValue(mockFindByIdQuery(tutor));
    Feedback.create = jest.fn().mockResolvedValue(feedback);
    Feedback.find = jest.fn().mockResolvedValue([feedback]);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(tutor);

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  test("should reject feedback from non-student", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      body: { tutorId: "123", rating: 5, message: "test" },
    };
    const res = buildMockRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should reject feedback with invalid tutorId", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      body: { tutorId: "invalid-id", rating: 5, message: "test" },
    };
    const res = buildMockRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });

  test("should reject feedback with rating less than 1", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const req = {
      user: student,
      body: {
        tutorId: tutor._id.toString(),
        rating: 0,
        message: "test",
      },
    };
    const res = buildMockRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });

  test("should reject feedback with rating greater than 5", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const req = {
      user: student,
      body: {
        tutorId: tutor._id.toString(),
        rating: 6,
        message: "test",
      },
    };
    const res = buildMockRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });

  test("should return 404 when tutor does not exist", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      body: {
        tutorId: new mongoose.Types.ObjectId().toString(),
        rating: 5,
        message: "test",
      },
    };
    const res = buildMockRes();

    User.findById = jest.fn().mockReturnValue(mockFindByIdQuery(null));

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
  });

  test("should allow admin to submit feedback", async () => {
    const admin = buildUser("admin");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(admin._id, tutor._id);

    const req = {
      user: admin,
      body: {
        tutorId: tutor._id.toString(),
        rating: 5,
        message: "Good job",
      },
    };
    const res = buildMockRes();

    User.findById = jest.fn().mockReturnValue(mockFindByIdQuery(tutor));
    Feedback.create = jest.fn().mockResolvedValue(feedback);
    Feedback.find = jest.fn().mockResolvedValue([feedback]);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(tutor);

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  test("should allow feedback submission with sessionId", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const sessionId = new mongoose.Types.ObjectId();
    const feedback = buildFeedback(student._id, tutor._id, { session: sessionId });

    const req = {
      user: student,
      body: {
        tutorId: tutor._id.toString(),
        rating: 4,
        message: "Great session",
        sessionId: sessionId.toString(),
      },
    };
    const res = buildMockRes();

    User.findById = jest.fn().mockReturnValue(mockFindByIdQuery(tutor));
    Feedback.create = jest.fn().mockResolvedValue(feedback);
    Feedback.find = jest.fn().mockResolvedValue([feedback]);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(tutor);

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });
});

describe("getMyFeedbacks", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return student feedbacks", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedbacks = [buildFeedback(student._id, tutor._id)];

    const req = { user: student };
    const res = buildMockRes();

    Feedback.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(feedbacks),
      }),
    });

    await getMyFeedbacks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 1,
      feedbacks,
    });
  });

  test("should return empty array when no feedbacks", async () => {
    const student = buildUser("user");
    const req = { user: student };
    const res = buildMockRes();

    Feedback.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
    });

    await getMyFeedbacks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 0,
      feedbacks: [],
    });
  });
});

describe("getTutorFeedbacks", () => {
  beforeEach(() => jest.clearAllMocks());

  test("tutor should view own feedbacks", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const feedbacks = [buildFeedback(student._id, tutor._id)];

    const req = {
      user: tutor,
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Feedback.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(feedbacks),
      }),
    });

    await getTutorFeedbacks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 1,
      feedbacks,
    });
  });

  test("admin should view any tutor feedbacks", async () => {
    const admin = buildUser("admin");
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const feedbacks = [buildFeedback(student._id, tutor._id)];

    const req = {
      user: admin,
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Feedback.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(feedbacks),
      }),
    });

    await getTutorFeedbacks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 1,
      feedbacks,
    });
  });

  test("other tutor should not view another tutor feedbacks", async () => {
    const tutor1 = buildUser("tutor");
    const tutor2 = buildUser("tutor");

    const req = {
      user: tutor1,
      params: { tutorId: tutor2._id.toString() },
    };
    const res = buildMockRes();

    await getTutorFeedbacks(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should return 400 for invalid tutorId", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      params: { tutorId: "invalid-id" },
    };
    const res = buildMockRes();

    await getTutorFeedbacks(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

describe("getTutorRatingStats", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return aggregated rating stats", async () => {
    const tutor = buildUser("tutor");
    const stats = {
      tutorId: tutor._id,
      avgRating: 4.5,
      totalRatings: 10,
    };

    const req = {
      user: buildUser("user"),
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Feedback.aggregate = jest.fn().mockResolvedValue([stats]);

    await getTutorRatingStats(req, res);

    expect(res.json).toHaveBeenCalledWith(stats);
  });

  test("should return zero stats when no feedbacks", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: buildUser("user"),
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Feedback.aggregate = jest.fn().mockResolvedValue([]);

    await getTutorRatingStats(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("should return 400 for invalid tutorId", async () => {
    const req = {
      user: buildUser("user"),
      params: { tutorId: "invalid-id" },
    };
    const res = buildMockRes();

    await getTutorRatingStats(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

describe("getAllFeedbacks", () => {
  beforeEach(() => jest.clearAllMocks());

  test("admin should view all feedbacks", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedbacks = [buildFeedback(student._id, tutor._id)];

    const req = { user: admin };
    const res = buildMockRes();

    Feedback.find = jest.fn().mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(feedbacks),
          }),
        }),
    });

    await getAllFeedbacks(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("non-admin should not view all feedbacks", async () => {
    const tutor = buildUser("tutor");
    const req = { user: tutor };
    const res = buildMockRes();

    await getAllFeedbacks(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });
});

describe("deleteFeedback", () => {
  beforeEach(() => jest.clearAllMocks());

  test("student should delete own feedback", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback =buildFeedback(student._id, tutor._id);

    const req = {
      user: student,
      params: { id: feedback._id.toString() },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(feedback);
    Feedback.deleteOne = jest.fn().mockResolvedValue({});

    await deleteFeedback(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("tutor should delete feedback about themselves", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student._id, tutor._id);

    const req = {
      user: tutor,
      params: { id: feedback._id.toString() },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(feedback);
    Feedback.deleteOne = jest.fn().mockResolvedValue({});

    await deleteFeedback(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("admin should delete any feedback", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student._id, tutor._id);

    const req = {
      user: admin,
      params: { id: feedback._id.toString() },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(feedback);
    Feedback.deleteOne = jest.fn().mockResolvedValue({});

    await deleteFeedback(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("unrelated student should not delete other feedback", async () => {
    const student1 = buildUser("user");
    const student2 = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student1._id, tutor._id);

    const req = {
      user: student2,
      params: { id: feedback._id.toString() },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(feedback);

    await deleteFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should return 404 for non-existent feedback", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      params: { id: new mongoose.Types.ObjectId().toString() },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(null);

    await deleteFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
  });

  test("should return 400 for invalid feedback id", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      params: { id: "invalid-id" },
    };
    const res = buildMockRes();

    await deleteFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

describe("updateFeedbackAdmin", () => {
  beforeEach(() => jest.clearAllMocks());

  test("admin should update feedback rating and message", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student._id, tutor._id, { rating: 3 });
    const updatedFeedback = { ...feedback, rating: 5, save: jest.fn().mockResolvedValue() };

    const req = {
      user: admin,
      params: { id: feedback._id.toString() },
      body: { rating: 5, message: "Updated message" },
    };
    const res = buildMockRes();

    Feedback.findById = jest.fn().mockResolvedValue(updatedFeedback);
    Feedback.find = jest.fn().mockResolvedValue([updatedFeedback]);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(tutor);

    await updateFeedbackAdmin(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("non-admin should not update feedback", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { rating: 5 },
    };
    const res = buildMockRes();

    await updateFeedbackAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should reject invalid rating", async () => {
    const admin = buildUser("admin");
    const req = {
      user: admin,
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { rating: 6 },
    };
    const res = buildMockRes();

    const feedback = buildFeedback(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId());
    Feedback.findById = jest.fn().mockResolvedValue(feedback);

    await updateFeedbackAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

describe("createFeedbackAdmin", () => {
  beforeEach(() => jest.clearAllMocks());

  // Helper to mock Mongoose findById query chain
  const mockFindByIdQuery = (returnValue) => {
    return {
      select: jest.fn().mockResolvedValue(returnValue),
    };
  };

  test("admin should create feedback on behalf of student", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const feedback = buildFeedback(student._id, tutor._id);

    const req = {
      user: admin,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        rating: 5,
        message: "Admin feedback",
      },
    };
    const res = buildMockRes();

    User.findById = jest
      .fn()
      .mockReturnValueOnce(mockFindByIdQuery(student))
      .mockReturnValueOnce(mockFindByIdQuery(tutor));
    Feedback.create = jest.fn().mockResolvedValue(feedback);
    Feedback.find = jest.fn().mockResolvedValue([feedback]);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(tutor);

    await createFeedbackAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  test("non-admin should not create feedback", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      body: {
        studentId: new mongoose.Types.ObjectId().toString(),
        tutorId: new mongoose.Types.ObjectId().toString(),
        rating: 5,
      },
    };
    const res = buildMockRes();

    await createFeedbackAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should validate studentId and tutorId", async () => {
    const admin = buildUser("admin");
    const req = {
      user: admin,
      body: {
        studentId: "invalid",
        tutorId: new mongoose.Types.ObjectId().toString(),
        rating: 5,
      },
    };
    const res = buildMockRes();

    await createFeedbackAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});
