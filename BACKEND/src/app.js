import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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
import userRoutes from "./routes/user.routes"


//Routes declaration
app.use("/api/v1/users", userRoutes);

export { app }