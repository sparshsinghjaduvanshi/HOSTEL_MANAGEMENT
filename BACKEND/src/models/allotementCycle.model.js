import mongoose, { Schema } from "mongoose";

const allotmentCycleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
      // Example: "Round 1", "Round 2", "Spot Round"
    },

    academicYear: {
      type: String,
      required: true
      // Example: "2025-2026"
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "closed"],
      default: "upcoming",
      index: true
    },

    // 🔥 optional but VERY useful
    maxApplicationsPerStudent: {
      type: Number,
      default: 1
    }

  },
  { timestamps: true }
);

// 🚀 Prevent duplicate cycles like "Round 1 - 2025"
allotmentCycleSchema.index(
  { name: 1, academicYear: 1 },
  { unique: true }
);

export const AllotmentCycle = mongoose.model(
  "AllotmentCycle",
  allotmentCycleSchema
);