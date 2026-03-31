import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one user → one student
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },

        enrollmentNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        enrollmentDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);