import mongoose, { Schema } from "mongoose";

const visitorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please use a valid 10-digit phone number"],
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    checkInTime: {
      type: Date,
      required: true,
    },

    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

//  Ensure one active visit per visitor (optional but useful)
visitorSchema.index(
  { phone: 1, checkOutTime: 1 },
  {
    unique: true,
    partialFilterExpression: { checkOutTime: null },
  }
);

//  Index for faster queries
visitorSchema.index({ studentId: 1 });
visitorSchema.index({ visitDate: -1 });

export const Visitor = mongoose.model("Visitor", visitorSchema);