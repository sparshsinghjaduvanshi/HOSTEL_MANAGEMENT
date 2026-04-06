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

const router = Router();

//  All routes are protected
router.use(verifyJWT);


// ================= PROFILE =================

// Get profile
router.get("/profile", getMyProfile);

// Update profile
router.patch("/profile", updateProfile);


// ================= DOCUMENT =================

// Upload document (PDF only)
router.post(
  "/documents",
  upload.single("file"), // field name must match frontend
  uploadDocument
);


// ================= ROOM CHANGE =================

// Create request (swap / single)
router.post("/room-change", createRoomChangeRequest);

// Respond to swap request
router.patch("/room-change/:id/respond", respondToRoomChange);

// Get all my requests
router.get("/room-change", getMyRoomChangeRequests);


export default router;