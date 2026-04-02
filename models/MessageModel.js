import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },

  title: {
      type: String,
      required: [true, "Please provide title"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [50, "Title cannot exceed 50 characters"],
    },

  message: {
    type: String,
    required: [true, "Please provide message"],
    trim: true,
    minlength: [10, "Message must be at least 10 characters long"],
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },

   category: {
      type: String,
      required: [true, "Please provide category"],
      enum: [
        "Mathematics",
        "Science",
        "IT & Programming",
        "English",
        "History",
        "Geography",
        "Physics",
        "Chemistry",
        "Other"
      ],
    },
    
    language: {
      type: String,
      required: [true, "Please provide language"],
      enum: [
           "English",
            "Sinhala",
            "Tamil",
            "French",
            "German",
            "Spanish",
            "Chinese",
            "Arabic",
            "Japanese"
      ],
    },

  // Flag to indicate if translation was performed
  requiresTranslation: {
    type: Boolean,
    default: false
  },

  // Sender ID (for external sender identification)
  senderId: {
    type: String,
    trim: true,
    maxlength: [100, "Sender ID cannot exceed 100 characters"]
  },

  image: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        // Validate URL or file path format
        return /^(https?:\/\/.*|uploads\/.*\.(jpg|jpeg|png|gif|webp))$/i.test(v);
      },
      message: "Please provide a valid image URL or path"
    }
  },

  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }

},
{ timestamps: true}
);

export default mongoose.model("Message", messageSchema);
