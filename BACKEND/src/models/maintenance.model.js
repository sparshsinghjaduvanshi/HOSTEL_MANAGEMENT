import mongoose, { Schema } from "mongoose"
const complaintSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student"
  },

  hostelId: {
    type: Schema.Types.ObjectId,
    ref: "Hostel"
  },

  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room"
  },

  title: String,

  description: String,

  category: {
    type: String,
    enum: [
      "electrical",
      "cleaning",
      "carpentry",
      "general"
    ]
  },

  status: {
    type: String,
    enum: [
      "pending",
      "in-progress",
      "work-done",
      "resolved"
    ],
    default: "pending"
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "Staff"
  },

  handledBy: {
    type: Schema.Types.ObjectId,
    ref: "Staff"
  },

  resolvedAt: Date

}, { timestamps: true });



export const Complaint = mongoose.model("Complaint", complaintSchema);