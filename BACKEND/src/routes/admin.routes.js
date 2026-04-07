import express from "express";

import {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getAdminDashboard,
  toggleApplicationWindow,
  createStaff,
  updateStaff,
  updateStaffPhoto
} from "../controllers/admin.controller.js";
import { deleteUser } from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {requireAdmin } from "../middlewares/roles.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const adminRouter = express.Router();

/**
 *  ADMIN PROFILE
 */
adminRouter.get("/me", verifyJWT, requireAdmin, getAdminProfile);

/**
 *  DASHBOARD
 */
adminRouter.get("/dashboard", verifyJWT, requireAdmin, getAdminDashboard);

/**
 *  STUDENTS
 */
adminRouter.get("/students", verifyJWT, requireAdmin, getAllStudentsAdmin);

/**
 *  STAFF MANAGEMENT
 */
adminRouter.get("/staff", verifyJWT, requireAdmin, getAllStaff);
adminRouter.post("/staff", verifyJWT, requireAdmin, createStaff);
adminRouter.put("/staff/:id", verifyJWT, requireAdmin, updateStaff);
adminRouter.delete("/users/:id", verifyJWT, requireAdmin, deleteUser);
adminRouter.patch("/photo", verifyJWT, requireAdmin, upload.single("photo"), // field name must match frontend
  updateStaffPhoto
);

/**
 *  SYSTEM CONTROL
 */
adminRouter.post("/application-window", verifyJWT, requireAdmin, toggleApplicationWindow);

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
adminRouter.get("/applications", verifyJWT, requireAdmin, getAllApplications);

// Approve / Reject application
adminRouter.post("/applications/review", verifyJWT, requireAdmin, reviewApplication);

// Start allotment process
adminRouter.post("/allotment/start", verifyJWT, requireAdmin, startAllotment);

// Re-allot waitlisted students
adminRouter.post("/allotment/reallot", verifyJWT, requireAdmin, reAllotWaitlisted);

// View allotted students
adminRouter.get("/allotment/allotted", verifyJWT, requireAdmin, getAllottedStudents);


export default adminRouter;