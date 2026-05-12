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
  forceCloseCycle,
  deleteStaff,
  getStudentDocuments,
  getStudentDetails,
  getApplicationDetails,
  getAllComplaints,
  getAllRoomChanges
} from "../controllers/admin.controller.js";

// import {
//   getMyComplaints,
//   getRoomChangeRequests
// } from "../controllers/staff.controller.js";

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
import {authorizeRoles} from "../middlewares/authorizeRoles.js"

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
adminRouter.delete("/users/:id", authorizeRoles("admin"), deleteUser);

adminRouter.get("/staff", getAllStaff);
adminRouter.post("/staff", createStaff);
adminRouter.put("/staff/:id", updateStaff);
adminRouter.delete("/staff/:id", deleteStaff);
adminRouter.patch("/staff/:id/photo", upload.single("photo"), updateStaffPhoto);
adminRouter.get("/students/:id/documents", getStudentDocuments);
adminRouter.get("/students/:id", getStudentDetails);
/**
 * APPLICATION MANAGEMENT
 */
adminRouter.get("/applications", getAllApplicationsAdmin);
adminRouter.post("/applications/review", reviewApplication);
adminRouter.get("/applications/:id", getApplicationDetails);

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



adminRouter.get("/complaints", getAllComplaints);
adminRouter.get( "/room-changes", getAllRoomChanges);

export default adminRouter;