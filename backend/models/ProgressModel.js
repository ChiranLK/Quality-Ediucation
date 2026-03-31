import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Optional link to a tutoring session
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutoringSession",
      default: null,
      index: true,
    },

    topic: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    completionPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates per tutor+student+topic (so we can "upsert" updates)
ProgressSchema.index({ student: 1, tutor: 1, topic: 1 }, { unique: true });

export default mongoose.model("Progress", ProgressSchema);