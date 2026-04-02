import mongoose, { Schema } from "mongoose";

const feeSchema = new Schema(
  {
    allotmentId: {
      type: Schema.Types.ObjectId,
      ref: "Allotment",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paidDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

//  Index for faster queries (important for dashboards)
feeSchema.index({ allotmentId: 1 });
feeSchema.index({ status: 1 });

export const Fee = mongoose.model("Fee", feeSchema);