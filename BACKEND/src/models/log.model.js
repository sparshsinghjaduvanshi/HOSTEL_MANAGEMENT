import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "UPDATE_PROFILE",
        "DELETE_DOC",
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW"
      ],
    },

    targetTable: {
      type: String,
      required: false,
    },

    targetId: {
      type: Schema.Types.ObjectId,
    },

    oldData: {
      type: Schema.Types.Mixed,
    },

    newData: {
      type: Schema.Types.Mixed,
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt automatically
  }
);

// ⚡ Indexes for fast filtering
logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });
logSchema.index({ createdAt: -1 });

export const Log = mongoose.model("Log", logSchema);