import express from "express";

import {
  getMyComplaints,
  updateComplaintStatus,
  getMyHostelStudents,
  decideRoomChange,
  getRoomChangeRequests
} from "../controllers/staff.controller.js";

import {
  verifyJWT
} from "../middlewares/auth.middleware.js";

import {
  requireStaff
} from "../middlewares/roles.middleware.js";

const staffRouter = express.Router();

// Apply middleware globally
staffRouter.use(
  verifyJWT,
  requireStaff
);

// ================= DASHBOARD =================

// later we can create dashboard stats route

// ================= COMPLAINTS =================

staffRouter.get(
  "/complaints",
  getMyComplaints
);

staffRouter.patch(
  "/complaints/:id",
  updateComplaintStatus
);

// ================= STUDENTS =================

staffRouter.get(
  "/students",
  getMyHostelStudents
);

// ================= ROOM CHANGES =================

staffRouter.get(
  "/room-changes",
  getRoomChangeRequests
);

staffRouter.patch(
  "/room-changes/:id",
  decideRoomChange
);

export default staffRouter;