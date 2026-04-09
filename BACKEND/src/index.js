import dotenv from "dotenv";
import mongoose from "mongoose";
import {app} from "./app.js";
import "./cron/reallotment.cron.js";

// Load environment variables
dotenv.config();

// Port
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Start server ONLY after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();