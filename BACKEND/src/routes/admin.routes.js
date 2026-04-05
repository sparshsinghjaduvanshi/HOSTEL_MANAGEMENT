import express from "express";

import {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getAdminDashboard,
  toggleApplicationWindow,
  createStaff,
  updateStaff
} from "../controllers/admin.controller.js";
import { deleteUser } from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import requireAdmin  from "../middlewares/roles.middleware.js"

const router = express.Router();

/**
 *  ADMIN PROFILE
 */
router.get("/me", verifyJWT, requireAdmin, getAdminProfile);

/**
 *  DASHBOARD
 */
router.get("/dashboard", verifyJWT, requireAdmin, getAdminDashboard);

/**
 *  STUDENTS
 */
router.get("/students", verifyJWT, requireAdmin, getAllStudentsAdmin);

/**
 *  STAFF MANAGEMENT
 */
router.get("/staff", verifyJWT, requireAdmin, getAllStaff);
router.post("/staff", verifyJWT, requireAdmin, createStaff);
router.put("/staff/:id", verifyJWT, requireAdmin, updateStaff);
router.delete("/users/:id", verifyJWT, requireAdmin, deleteUser);

/**
 *  APPLICATIONS
 */
router.get("/applications", verifyJWT, requireAdmin, getAllApplicationsAdmin);

/**
 *  SYSTEM CONTROL
 */
router.post("/application-window", verifyJWT, requireAdmin, toggleApplicationWindow);

import {
  getAllApplications,
  reviewApplication,
  startAllotment,
  reAllotWaitlisted,
  getAllottedStudentsAdmin
} from "../controllers/application.controller.js";

/**
 *  APPLICATION MANAGEMENT (ADMIN)
 */

// View all applications
router.get("/applications", verifyJWT, requireAdmin, getAllApplications);

// Approve / Reject application
router.post("/applications/review", verifyJWT, requireAdmin, reviewApplication);

// Start allotment process
router.post("/allotment/start", verifyJWT, requireAdmin, startAllotment);

// Re-allot waitlisted students
router.post("/allotment/reallot", verifyJWT, requireAdmin, reAllotWaitlisted);

// View allotted students
router.get("/allotment/allotted", verifyJWT, requireAdmin, getAllottedStudentsAdmin
);


export default router;