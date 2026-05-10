import mongoose, { Schema } from "mongoose";

const allotmentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },

    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    cycleId: {
      type: Schema.Types.ObjectId,
      ref: "AllotmentCycle",
      required: true,
      index: true
    },

    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    // 🟡 Payment + confirmation lifecycle
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "frozen"],
      default: "pending_payment",
      index: true
    },

    // 💰 Payment tracking shortcut
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // ⏳ Deadline for payment
    paymentDeadline: {
      type: Date,
    },

    allottedAt: {
      type: Date,
      default: Date.now,
    },

    confirmedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },
    reportingDeadline: {
      type: Date
    },

    isFrozenByAdmin: {
      type: Boolean,
      default: false
    },

    freezeReason: String
  },
  { timestamps: true }
);

allotmentSchema.index(
  { studentId: 1, cycleId: 1 },
  { unique: true }
);

allotmentSchema.index(
  { hostelId: 1, roomId: 1, cycleId: 1 },
  { unique: false }
);

export const Allotment = mongoose.model("Allotment", allotmentSchema)