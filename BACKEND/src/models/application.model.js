import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    priorityScore: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming admin is also a user
    },

    status: {
      type: String,
      enum: ["pending", "selected", "allotted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Application = mongoose.model("Application", applicationSchema);