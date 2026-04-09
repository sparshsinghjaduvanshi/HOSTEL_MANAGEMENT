import mongoose, { Schema } from 'mongoose';

const applicationSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    cycleId: {
      type: Schema.Types.ObjectId,
      ref: "AllotmentCycle",
      required: true,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    priorityScore: {
      type: Number,
      default: 0,
      index: true,
    },

    preferences: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Hostel",
        }
      ],
      validate: [
        {
          validator: function (arr) {
            return arr.length > 0 && arr.length <= 3;
          },
          message: "Select between 1 to 3 preferences"
        }
      ]
    },

    // 🔥 Warden Review System
    wardenDecision: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        index: true
      },
      decidedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      decidedAt: Date,
      remarks: {
        type: String,
        maxlength: 500
      },
    },

    // 🔥 Allotment fields
    allottedHostel: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      default: null
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      default: null
    },

    isAllotted: {
      type: Boolean,
      default: false,
      index: true
    },
    allocationStatus: {
      type: String,
      enum: ["pending", "allotted", "waitlisted"],
      default: "pending",
      index: true
    }

  },
  { timestamps: true }
);

// ✅ Prevent duplicate application per cycle
applicationSchema.index(
  { studentId: 1, cycleId: 1 },
  { unique: true }
);

// ✅ Remove duplicate preferences
applicationSchema.pre("save", function () {
  if (this.preferences && Array.isArray(this.preferences)) {
    this.preferences = [
      ...new Set(this.preferences.map(id => id.toString()))
    ];
  }
});

export const Application = mongoose.model("Application", applicationSchema);