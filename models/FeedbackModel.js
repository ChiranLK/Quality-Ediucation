import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional link to a tutoring session (you already have tutoringsessions collection)
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutoringSession",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries (removed unique constraint to allow multiple feedbacks per student-tutor pair)
FeedbackSchema.index({ student: 1, tutor: 1 });
FeedbackSchema.index({ student: 1 });
FeedbackSchema.index({ tutor: 1 });
FeedbackSchema.index({ session: 1 });

export default mongoose.model("Feedback", FeedbackSchema);