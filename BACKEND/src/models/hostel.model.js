import mongoose, { Schema } from "mongoose";

const hostelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    occupiedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// ✅ Virtual field for empty rooms
hostelSchema.virtual("emptyRooms").get(function () {
  return this.totalRooms - this.occupiedRooms;
});

// ✅ Include virtuals in response
hostelSchema.set("toJSON", { virtuals: true });
hostelSchema.set("toObject", { virtuals: true });

export const Hostel = mongoose.model("Hostel", hostelSchema);