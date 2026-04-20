import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
// import rateLimit from "express-rate-limit";
// import xss from "xss-clean";
import helmet from "helmet";

const app = express();

app.set("trust proxy", 1);

//  Security headers
app.use(helmet());

//  CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

//  Body parser
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//  SECURITY MIDDLEWARES (IMPORTANT ORDER)
app.use(mongoSanitize()); // NoSQL injection protection
// app.use(xss());           // XSS protection

app.use(cookieParser());
app.use(express.static("public"));


//  Rate limiter (auth)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: {
//     success: false,
//     message: "Too many requests, try again later."
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

//  Routes
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import applicationRouter from "./routes/application.routes.js";
import studentRouter from "./routes/student.routes.js";
import logRouter from "./routes/log.routes.js";
import hostelRoutes from "./routes/hostel.routes.js";
import notificationRouter from "./routes/notification.routes.js";

// app.use("/api/v1/users", authLimiter);
// app.use("/api/v1/users/send-otp", authLimiter);


// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/logs", logRouter);
app.use("/api/v1/hostels", hostelRoutes);
app.use("/api/v1/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("ROOT WORKING");
});

export { app };