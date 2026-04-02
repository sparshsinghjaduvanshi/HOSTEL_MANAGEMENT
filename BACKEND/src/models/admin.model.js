import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    roleLevel: {
      type: Number,
      default: 1, // higher = more power
      min: 1,
    },

    permissions: [
      {
        type: String,
      },
    ],

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // handles createdAt & updatedAt
  }
);

export const Admin = mongoose.model("Admin", adminSchema);