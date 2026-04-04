// routes/application.routes.js

import express from "express";
const router = express.Router();

// controllers
import {
  applyForHostel,
  startAllotment,
  reviewApplication,
  getApplicationsForWarden,
  getMyApplication,
  getAllApplications,
  getAllottedStudents,
  cancelApplication,
  reAllotWaitlisted,
  getDashboardStats
} from "../controllers/application.controller.js";

// (Assuming you have auth middleware)
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";


// ================= STUDENT ROUTES =================

// Apply
router.post("/apply", verifyJWT, authorizeRoles("student"), applyForHostel);

// View own application
router.get("/me", verifyJWT, authorizeRoles("student"), getMyApplication);

// Cancel application
router.delete("/cancel", verifyJWT, authorizeRoles("student"), cancelApplication);


// ================= WARDEN ROUTES =================

// Get applications to review
router.get("/warden", verifyJWT, authorizeRoles("warden"), getApplicationsForWarden);

// Review application
router.post("/review", verifyJWT, authorizeRoles("warden"), reviewApplication);


// ================= ADMIN ROUTES =================

// Start allotment
router.post("/allotment/start", verifyJWT, authorizeRoles("admin"), startAllotment);

// Re-allot waitlisted
router.post("/allotment/retry", verifyJWT, authorizeRoles("admin"), reAllotWaitlisted);

// Get all applications
router.get("/all", verifyJWT, authorizeRoles("admin"), getAllApplications);

// Get allotted students
router.get("/allotted", verifyJWT, authorizeRoles("admin"), getAllottedStudents);

// Dashboard stats
router.get("/stats", verifyJWT, authorizeRoles("admin"), getDashboardStats);


export default router;