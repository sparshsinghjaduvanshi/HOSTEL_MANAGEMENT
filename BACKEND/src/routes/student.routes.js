import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  getMyProfile,
  updateProfile,
  uploadDocument,
  createRoomChangeRequest,
  respondToRoomChange,
  getMyRoomChangeRequests
} from "../controllers/student.controller.js";

const studentRouter = Router();

//  All routes are protected
studentRouter.use(verifyJWT);


// ================= PROFILE =================

// Get profile
studentRouter.get("/profile", getMyProfile);

// Update profile
studentRouter.patch("/profile", updateProfile);


// ================= DOCUMENT =================

// Upload document (PDF only)
studentRouter.post(
  "/documents",
  upload.single("file"), // field name must match frontend
  uploadDocument
);


// ================= ROOM CHANGE =================

// Create request (swap / single)
studentRouter.post("/room-change", createRoomChangeRequest);

// Respond to swap request
studentRouter.patch("/room-change/:id/respond", respondToRoomChange);

// Get all my requests
studentRouter.get("/room-change", getMyRoomChangeRequests);


export default studentRouter;