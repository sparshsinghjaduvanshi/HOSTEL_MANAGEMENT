import mongoose from "mongoose";
import dotenv from "dotenv";
import { Hostel } from "../src/models/hostel.model.js";

dotenv.config();

const seedHostels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("DB connected");

    const hostels = [
      { name: "B1", totalRooms: 100, gender: "female" },
      { name: "B2", totalRooms: 100, gender: "female" },
      { name: "B3", totalRooms: 100, gender: "female" },
      { name: "B4", totalRooms: 100, gender: "female" },
      { name: "B5", totalRooms: 100, gender: "male" },
      { name: "B6", totalRooms: 100, gender: "male" },
      { name: "B7", totalRooms: 100, gender: "male" },
      { name: "B8", totalRooms: 100, gender: "male" },
    ];

    // 🔥 optional: clear old data
    await Hostel.deleteMany();

    // 🔥 insert new
    await Hostel.insertMany(hostels);

    console.log("Hostels seeded successfully ✅");
    process.exit();

  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

seedHostels();