import mongoose, {Schema} from "mongoose"
const complaintSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },

  title: String,
  description: String,

  category: {
    type: String,
    enum: ["electrical", "cleaning", "carpentry", "general"]
  },

  status: {
    type: String,
    enum: ["pending", "assigned", "resolved"],
    default: "pending"
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "Staff"
  }
}, { timestamps: true });



export const Complaint = mongoose.model("Complaint", complaintSchema);