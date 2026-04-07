import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public")) // if we want to store some assets to my server i can use this to save in folder public
app.use(cookieParser())

//Importing Routes
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"

//Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

export { app }