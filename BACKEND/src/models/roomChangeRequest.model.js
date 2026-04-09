import mongoose, { Schema } from "mongoose"

const roomChangeSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    // 🔥 Optional second student
    targetStudent: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null
    },

    type: {
      type: String,
      enum: ["swap", "single"],
      required: true
    },

    reason: {
      type: String,
      trim: true
    },

    requesterApproved: {
      type: Boolean,
      default: true
    },

    targetApproved: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
  

    decidedAt: Date
  },
  { timestamps: true }
);

export const RoomChangeRequest = mongoose.model("RoomChangeRequest", roomChangeSchema)