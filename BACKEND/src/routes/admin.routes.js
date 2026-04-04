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
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

/**
 *  ADMIN PROFILE
 */
router.get("/me", verifyJWT, isAdmin, getAdminProfile);

/**
 *  DASHBOARD
 */
router.get("/dashboard", verifyJWT, isAdmin, getAdminDashboard);

/**
 *  STUDENTS
 */
router.get("/students", verifyJWT, isAdmin, getAllStudentsAdmin);

/**
 *  STAFF MANAGEMENT
 */
router.get("/staff", verifyJWT, isAdmin, getAllStaff);
router.post("/staff", verifyJWT, isAdmin, createStaff);
router.put("/staff/:id", verifyJWT, isAdmin, updateStaff);
router.delete("/users/:id", verifyJWT, isAdmin, deleteUser);

/**
 *  APPLICATIONS
 */
router.get("/applications", verifyJWT, isAdmin, getAllApplicationsAdmin);

/**
 *  SYSTEM CONTROL
 */
router.post("/application-window", verifyJWT, isAdmin, toggleApplicationWindow);

import {
  getAllApplications,
  reviewApplication,
  startAllotment,
  reAllotWaitlisted,
  getAllottedStudents
} from "../controllers/application.controller.js";

/**
 *  APPLICATION MANAGEMENT (ADMIN)
 */

// View all applications
router.get("/applications", verifyJWT, isAdmin, getAllApplications);

// Approve / Reject application
router.post("/applications/review", verifyJWT, isAdmin, reviewApplication);

// Start allotment process
router.post("/allotment/start", verifyJWT, isAdmin, startAllotment);

// Re-allot waitlisted students
router.post("/allotment/reallot", verifyJWT, isAdmin, reAllotWaitlisted);

// View allotted students
router.get("/allotment/allotted", verifyJWT, isAdmin, getAllottedStudents);


export default router;