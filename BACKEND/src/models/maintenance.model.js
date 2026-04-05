import mongoose, { Schema } from "mongoose";

const maintenanceSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "work-done", "resolved"],
      default: "pending",
    },

    resolvedAt: {
      type: Date,
    },
    category: {
      type: String,
      enum: ["cleaning", "electrical", "carpentry", "general"],
      required: true,
      index: true
    }
  },

  {
    timestamps: true, // gives createdAt automatically
  }
);

//  Indexes for performance
maintenanceSchema.index({ hostelId: 1 });
maintenanceSchema.index({ roomId: 1 });
maintenanceSchema.index({ status: 1 });

export const Maintenance = mongoose.model("Maintenance", maintenanceSchema);