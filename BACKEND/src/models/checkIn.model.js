import mongoose, { Schema } from "mongoose";

const checkinSchema = new Schema(
  {
    allotmentId: {
      type: Schema.Types.ObjectId,
      ref: "Allotment",
      required: true,
    },

    checkInDate: {
      type: Date,
      default: Date.now,
    },

    checkOutDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Ensure only one active check-in per allotment
checkinSchema.index(
  { allotmentId: 1, checkOutDate: 1 },
  {
    unique: true,
    partialFilterExpression: { checkOutDate: null },
  }
);

export const CheckIn = mongoose.model("CheckIn", checkinSchema);