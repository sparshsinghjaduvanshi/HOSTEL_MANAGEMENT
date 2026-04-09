import dotenv from "dotenv";
dotenv.config();
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


//Routes Importing
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import applicationRouter from "./routes/application.routes.js";
import studentRouter from "./routes/student.routes.js";
import logRouter from "./routes/log.routes.js";
import hostelRoutes from "./routes/hostel.routes.js";
import notificationRouter from "./routes/notification.routes.js";


const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public")) // if we want to store some assets to my server i can use this to save in folder public
app.use(cookieParser())
console.log("CORS ORIGIN:", process.env.CORS_ORIGIN);


// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/logs", logRouter);
app.use("/api/v1/hostels", hostelRoutes);
app.use("/api/v1/notifications", notificationRouter);
console.log("User routes loaded");

console.log("APP IS LOADED");

app.get("/", (req, res) => {
  res.send("ROOT WORKING");
});

export { app }
