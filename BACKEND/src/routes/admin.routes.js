import express from "express";

import {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getActiveCycle,
  getAdminDashboard,
  toggleApplicationWindow,
  createStaff,
  updateStaff,
  updateStaffPhoto,
  forceCloseCycle
} from "../controllers/admin.controller.js";

import {
  reviewApplication,
  startAllotment,
  reAllotWaitlisted,
  getAllottedStudents,
  runAllotment
} from "../controllers/application.controller.js";

import { deleteUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const adminRouter = express.Router();

adminRouter.get("/cycle/active", getActiveCycle);

// 🔒 Apply middleware ONCE
adminRouter.use(verifyJWT, requireAdmin);

/**
 * PROFILE + DASHBOARD
 */
adminRouter.get("/me", getAdminProfile);
adminRouter.get("/dashboard", getAdminDashboard);

/**
 * STUDENTS + STAFF
 */
adminRouter.get("/students", getAllStudentsAdmin);

adminRouter.get("/staff", getAllStaff);
adminRouter.post("/staff", createStaff);
adminRouter.put("/staff/:id", updateStaff);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.patch("/photo", upload.single("photo"), updateStaffPhoto);

/**
 * APPLICATION MANAGEMENT
 */
adminRouter.get("/applications", getAllApplicationsAdmin);
adminRouter.post("/applications/review", reviewApplication);

/**
 * ALLOTMENT
 */
adminRouter.post("/allotment/start", startAllotment);
adminRouter.post("/allotment/run", runAllotment);
adminRouter.post("/allotment/reallot", reAllotWaitlisted);
adminRouter.get("/allotment/allotted", getAllottedStudents);

/**
 * CYCLE CONTROL (🔥 IMPORTANT)
 */
adminRouter.patch("/cycle/toggle-application", toggleApplicationWindow);
adminRouter.patch("/cycle/force-close", forceCloseCycle);

export default adminRouter;