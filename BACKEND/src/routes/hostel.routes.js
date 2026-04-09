import express from "express";
import { getAllHostels } from "../controllers/hostel.controller.js";

const hostelRouter = express.Router();

hostelRouter.get("/", getAllHostels);

export default hostelRouter;