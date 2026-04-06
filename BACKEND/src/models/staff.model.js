import mongoose, { Schema } from 'mongoose'

const staffSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, "Please use a valid 10-digit phone number"],
    },
    role: {
        type: String,
        enum: ["Cleaner", "Carpenter", "Electrician", "CareTaker", "Warden"],
        required: true
    },
    photo: {
      type: String, // URL (Cloudinary/S3)
    },
    assignedHostelId: {
        type: Schema.Types.ObjectId,
        ref: "Hostel",
        required: true
    },
    hiredAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

export const Staff = mongoose.model("Staff", staffSchema)