import mongoose, { Schema } from 'mongoose'

const documentSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    applicationId: {
        type: Schema.Types.ObjectId,
        ref: "Application",
        default: null
    },
    fileUrl: {
        type: String,
        required: true,
        match: [/^https?:\/\/.+/, "Please use a valid URL"]
    },
    type: {
        type: String,
        enum: ["aadhaar", "address_proof", "id_card"],
        required: true
    },
    address: {
        type: String,
        required: function () {
            return this.type === "address_proof";
        }
    },
    latitude: Number,
    longitude: Number
}, { timestamps: true })

// Indexes
documentSchema.index({ studentId: 1 })
documentSchema.index({ applicationId: 1 })
documentSchema.index({ studentId: 1, type: 1 }, { unique: true })

const Document = mongoose.model("Document", documentSchema)

export { Document }