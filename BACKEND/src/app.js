// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import mongoSanitize from "express-mongo-sanitize";
// import rateLimit from "express-rate-limit";
// import xss from "xss-clean";
// import helmet from "helmet";

// const app = express();

// app.set("trust proxy", 1);

// //  Security headers
// app.use(helmet());

// //  CORS
// app.use(cors({
//   origin: [process.env.CORS_ORIGIN,
//     "http://localhost"
//   ],
//   credentials: true
// }));

// //  Body parser
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// //  SECURITY MIDDLEWARES (IMPORTANT ORDER)
// app.use(mongoSanitize()); // NoSQL injection protection
// app.use(xss());           // XSS protection

// app.use(cookieParser());
// app.use(express.static("public"));


// Rate limiter(auth)
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

// //  Routes
// import userRouter from "./routes/user.routes.js";
// import adminRouter from "./routes/admin.routes.js";
// import applicationRouter from "./routes/application.routes.js";
// import studentRouter from "./routes/student.routes.js";
// import logRouter from "./routes/log.routes.js";
// import hostelRoutes from "./routes/hostel.routes.js";
// import notificationRouter from "./routes/notification.routes.js";
// import staffRouter from "./routes/staff.routes.js";
// import paymentRouter
//   from "./routes/payment.routes.js";
// app.use("/api/v1/users", authLimiter);
// app.use("/api/v1/users/send-otp", authLimiter);

// app.use((req, res, next) => {
//   console.log(
//     `Handled by PID:
//      ${process.pid}`
//   );
//   next();
// });
// // Routes
// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/admin", adminRouter);
// app.use("/api/v1/applications", applicationRouter);
// app.use("/api/v1/students", studentRouter);
// app.use("/api/v1/logs", logRouter);
// app.use("/api/v1/hostels", hostelRoutes);
// app.use("/api/v1/notifications", notificationRouter);
// app.use("/api/v1/staff", staffRouter);
// app.use("/api/v1/payments", paymentRouter);


// app.get("/", (req, res) => {
//   res.send("ROOT WORKING");
// });

// export { app };


import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import helmet from "helmet";

const app = express();

app.set("trust proxy", 1);

// ================= SECURITY HEADERS =================

app.use(helmet());

// ================= CORS =================

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    "http://localhost",
    "http://localhost:5173"
  ],
  credentials: true
}));

// ================= BODY PARSER =================

app.use(express.json({
  limit: "50mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "50mb"
}));

// ================= SECURITY MIDDLEWARES =================

app.use(mongoSanitize()); // NoSQL Injection Protection

app.use(xss()); // XSS Protection

app.use(cookieParser());

app.use(express.static("public"));

// ================= RATE LIMITER =================

const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 1000, // max 10 requests

  message: {

    success: false,

    message:
      "Too many requests, try again later."
  },

  standardHeaders: true,

  legacyHeaders: false
});

// ================= ROUTES IMPORT =================

import userRouter from "./routes/user.routes.js";

import adminRouter from "./routes/admin.routes.js";

import applicationRouter
  from "./routes/application.routes.js";

import studentRouter
  from "./routes/student.routes.js";

import logRouter
  from "./routes/log.routes.js";

import hostelRoutes
  from "./routes/hostel.routes.js";

import notificationRouter
  from "./routes/notification.routes.js";

import staffRouter
  from "./routes/staff.routes.js";

import paymentRouter
  from "./routes/payment.routes.js";

// ================= RATE LIMITED ROUTES =================

app.use(
  "/api/v1/users/login",
  authLimiter
);

app.use(
  "/api/v1/users/send-otp",
  authLimiter
);

app.use(
  "/api/v1/users/register",
  authLimiter
);

// ================= DEBUG =================

app.use((req, res, next) => {

  console.log(
    `Handled by PID: ${process.pid}`
  );

  next();
});

// ================= MAIN ROUTES =================

app.use("/api/v1/users", userRouter);

app.use("/api/v1/admin", adminRouter);

app.use("/api/v1/applications", applicationRouter);

app.use("/api/v1/students", studentRouter);

app.use("/api/v1/logs", logRouter);

app.use("/api/v1/hostels",hostelRoutes);

app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/staff", staffRouter);

app.use("/api/v1/payments", paymentRouter);

// ================= ROOT =================

app.get("/", (req, res) => { res.send("ROOT WORKING");});

export { app };