// import dotenv from "dotenv";

// // Load environment variables
// dotenv.config({
//   path: "./.env"
// });
// import "./cron/reallotment.cron.js";
// import mongoose from "mongoose";
// import {app} from "./app.js";

// // Port
// const PORT = process.env.PORT || 8000;

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI);

//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

//     // Start server ONLY after DB connects
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });

//   } catch (error) {
//     console.error("❌ Database connection failed:", error.message);
//     process.exit(1);
//   }
// };

// console.log(
//   `Server running:
//    ${process.pid}`
// );

// connectDB();

import dotenv from "dotenv";

// ================= LOAD ENV FIRST =================

dotenv.config({
  path: "./.env"
});

// ================= IMPORTS =================

import "./cron/reallotment.cron.js";

import mongoose from "mongoose";

// ================= PORT =================

const PORT =
  process.env.PORT || 8000;

// ================= START SERVER =================

const startServer =
  async () => {

    try {

      // IMPORTANT:
      // Import app ONLY after dotenv loads

      const { app } =
        await import("./app.js");

      // Connect MongoDB

      const conn =
        await mongoose.connect(
          process.env.MONGODB_URI
        );

      console.log(
        `✅ MongoDB Connected: ${conn.connection.host}`
      );

      // Start server

      app.listen(
        PORT,
        () => {

          console.log(
            `🚀 Server running on port ${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        "❌ Startup failed:",
        error
      );

      process.exit(1);
    }
  };

// ================= DEBUG =================

console.log(
  `Server PID: ${process.pid}`
);

// ================= RUN =================

startServer();