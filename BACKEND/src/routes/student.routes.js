import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import {
  getMyProfile,
  updateProfile,
  uploadDocument,
  getDocuments,
  createRoomChangeRequest,
  respondToRoomChange,
  getMyRoomChangeRequests,
  cancelRoomChange,
  updateProfilePhoto
} from "../controllers/student.controller.js";

import { createComplaint, getMyComplaints, deleteComplaint } from "../controllers/maintenance.controller.js";

const studentRouter = Router();

//  All routes are protected
studentRouter.use(verifyJWT);


// ================= PROFILE =================

// Get profile
studentRouter.get("/profile", getMyProfile);

// Update profile
studentRouter.patch("/profile", updateProfile);
studentRouter.patch("/photo",  authorizeRoles("student"), upload.single("photo"), updateProfilePhoto);


// ================= DOCUMENT =================

// Upload document (PDF only)
studentRouter.post(
  "/documents",
  upload.array("files", 3), // max 3 files, // field name must match frontend
  uploadDocument
);
studentRouter.get("/documents", getDocuments);


// ================= ROOM CHANGE =================

// Create request (swap / single)
studentRouter.post("/room-change", createRoomChangeRequest);

// Respond to swap request
studentRouter.patch("/room-change/:id/respond", respondToRoomChange);

// Get all my requests
studentRouter.get("/room-change", getMyRoomChangeRequests);

studentRouter.delete("/room-change/:id", cancelRoomChange);

// Complaints
studentRouter.post("/complaints", createComplaint);
studentRouter.get("/complaints", getMyComplaints);
studentRouter.delete("/complaints/:id", deleteComplaint);

export default studentRouter;