import mongoose, {Schema} from "mongoose";

const adminSchema = new Schema({
    userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one user → one student
        }
},{timestamps: true})

export const Admin = mongoose.model("Admin", adminSchema);