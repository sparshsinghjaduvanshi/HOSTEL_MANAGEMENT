import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/user.model.js";
import { Admin } from "../src/models/admin.model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("❌ Admin already exists");
      process.exit();
    }

    // Create User
    const user = await User.create({
      fullName: "Admin User",
      email: "admin@curaj.ac.in",
      password: "admin123",
      role: "admin",
    });

    // Create Admin Profile
    await Admin.create({
      userId: user._id,
    });

    console.log("✅ Admin created successfully");
    console.log("Email: admin@curaj.ac.in");
    console.log("Password: admin123");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();