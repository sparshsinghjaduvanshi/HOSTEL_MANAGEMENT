// routes/application.routes.js

import express from "express";
const applicationRouter = express.Router();

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
applicationRouter.post("/apply", verifyJWT, authorizeRoles("student"), applyForHostel);

// View own application
applicationRouter.get("/me", verifyJWT, authorizeRoles("student"), getMyApplication);

// Cancel application
applicationRouter.delete("/cancel", verifyJWT, authorizeRoles("student"), cancelApplication);


// ================= WARDEN ROUTES =================

import { requireStaff } from "../middlewares/roles.middleware.js";

applicationRouter.get("/warden", verifyJWT, requireStaff, getApplicationsForWarden);
applicationRouter.post("/review", verifyJWT, requireStaff, reviewApplication);


// ================= ADMIN ROUTES =================

// Start allotment
applicationRouter.post("/allotment/start", verifyJWT, authorizeRoles("admin"), startAllotment);

// Re-allot waitlisted
applicationRouter.post("/allotment/retry", verifyJWT, authorizeRoles("admin"), reAllotWaitlisted);

// Get all applications
applicationRouter.get("/all", verifyJWT, authorizeRoles("admin"), getAllApplications);

// Get allotted students
applicationRouter.get("/allotted", verifyJWT, authorizeRoles("admin"), getAllottedStudents);

// Dashboard stats
applicationRouter.get("/stats", verifyJWT, authorizeRoles("admin"), getDashboardStats);


export default applicationRouter;