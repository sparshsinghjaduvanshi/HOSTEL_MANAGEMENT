import mongoose, { Schema } from 'mongoose'

const documentSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    applicationId: {
        type: Schema.Types.ObjectId,
        ref: "Application",
        required: false
    },
    fileUrl: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["aadhaar", "address_proof", "id_card"],
        required: true
    }
}, { timestamps: true })


const Document = mongoose.model("Document", documentSchema)

export { Document }