import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    occupiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field: available beds
roomSchema.virtual("availableBeds").get(function () {
  return this.capacity - this.occupiedCount;
});

// Include virtuals in response
roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

// ⚡ Prevent duplicate room numbers within same hostel
roomSchema.index({ roomNumber: 1, hostelId: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);