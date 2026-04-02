import mongoose, { Schema } from "mongoose";

const allotmentSchema = new Schema(
    {
        hostelId: {
            type: Schema.Types.ObjectId,
            ref: "Hostel",
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        applicationId: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            unique: true, // one application → one allotment
        },

        startDate: {
            type: Date,
            default: Date.now,
        },

        endDate: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["confirmed", "cancelled", "completed"],
            default: "confirmed",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent multiple active allotments for same student
allotmentSchema.index(
    { studentId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "confirmed" },
    }
);

export const Allotment = mongoose.model("Allotment", allotmentSchema);