import mongoose from "mongoose";
import validator from "validator";

import { Maintenance } from "../models/maintenance.model.js";
import { roleToCategoryMap } from "../utils/roleCategoryMap.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Room } from "../models/room.model.js";
import { RoomChangeRequest } from "../models/roomChangeRequest.model.js";
import { Student } from "../models/student.model.js";
import { Notification } from "../models/notification.model.js";

import { createLog } from "../services/log.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


// ================= HELPERS =================

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ID");
  }
};

const sanitize = (val) => {
  if (typeof val !== "string") return val;
  return validator.escape(val.trim());
};


// ================= COMPLAINTS =================

const getMyComplaints = asyncHandler(async (req, res) => {
  const staff = req.staff;
  if (!staff) throw new ApiError(403, "Staff not found");

  const category = roleToCategoryMap[staff.role];
  if (!category && staff.role !== "CareTaker") {
    throw new ApiError(403, "Invalid role");
  }

  let filter = { hostelId: staff.assignedHostelId };

  if (staff.role !== "CareTaker") {
    filter.category = category;
  }

  const complaints = await Maintenance.find(filter)
    .populate("roomId")
    .populate({
      path: "reportedBy",
      populate: { path: "userId", select: "fullName email" }
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, complaints });
});


// ================= UPDATE STATUS =================

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;

  validateObjectId(id);
  status = sanitize(status);

  const allowed = ["pending", "in-progress", "work-done", "resolved"];
  if (!allowed.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const staff = req.staff;
  if (!staff) throw new ApiError(403, "Staff not found");

  const complaint = await Maintenance.findById(id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (complaint.hostelId.toString() !== staff.assignedHostelId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const category = roleToCategoryMap[staff.role];

  if (staff.role !== "CareTaker" && complaint.category !== category) {
    throw new ApiError(403, "Not allowed");
  }

  const oldStatus = complaint.status;

  if (staff.role !== "CareTaker") {
    if (!["in-progress", "work-done"].includes(status)) {
      throw new ApiError(403, "Invalid update");
    }
    complaint.status = status;
    complaint.handledBy = staff._id;
  }

  if (staff.role === "CareTaker" && status === "resolved") {
    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  await createLog(req, {
    userId: req.user?._id,
    action: "UPDATE",
    targetTable: "Maintenance",
    targetId: complaint._id,
    oldData: { status: oldStatus },
    newData: { status: complaint.status }
  });

  return res.status(200).json({
    success: true,
    message: "Status updated",
    complaint
  });
});


// ================= HOSTEL STUDENTS =================

const getMyHostelStudents = asyncHandler(async (req, res) => {
  const staff = req.staff;

  if (!["CareTaker", "Warden"].includes(staff.role)) {
    throw new ApiError(403, "Access denied");
  }

  const cycle = await AllotmentCycle.findOne({
    status: { $in: ["active", "closed"] }
  }).sort({ createdAt: -1 });

  if (!cycle) throw new ApiError(404, "No cycle found");

  const applications = await Application.find({
    cycleId: cycle._id,
    isAllotted: true,
    allottedHostel: staff.assignedHostelId
  })
    .populate({
      path: "studentId",
      populate: { path: "userId", select: "fullName email" }
    })
    .populate("roomId");

  return res.status(200).json({
    success: true,
    total: applications.length,
    students: applications
  });
});


// ================= ROOM CHANGE =================

const decideRoomChange = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { action, newRoomId } = req.body;

  validateObjectId(id);
  if (newRoomId) validateObjectId(newRoomId);

  action = sanitize(action);

  const request = await RoomChangeRequest.findById(id);
  if (!request) throw new ApiError(404, "Request not found");

  // ========= REJECT =========
  if (action === "reject") {
    request.status = "rejected";
    await request.save();

    return res.json({ success: true, request });
  }

  // ========= SWAP =========
  if (request.type === "swap") {
    if (!request.targetApproved) {
      throw new ApiError(400, "Both must agree");
    }

    const appA = await Application.findOne({ studentId: request.requester, isAllotted: true });
    const appB = await Application.findOne({ studentId: request.targetStudent, isAllotted: true });

    if (!appA || !appB) throw new ApiError(404, "Applications not found");

    const temp = appA.roomId;
    appA.roomId = appB.roomId;
    appB.roomId = temp;

    await appA.save();
    await appB.save();

    request.status = "approved";
    await request.save();

    return res.json({ success: true, message: "Rooms swapped", appA, appB });
  }

  // ========= SINGLE =========
  if (request.type === "single") {
    if (!newRoomId) throw new ApiError(400, "Room required");

    const app = await Application.findOne({
      studentId: request.requester,
      isAllotted: true
    });

    if (!app) throw new ApiError(404, "Application not found");

    if (newRoomId.toString() === app.roomId.toString()) {
      throw new ApiError(400, "Already in same room");
    }

    const room = await Room.findById(newRoomId);
    if (!room) throw new ApiError(404, "Room not found");

    if (room.occupiedCount >= room.capacity) {
      throw new ApiError(400, "Room full");
    }

    const oldRoom = app.roomId;

    if (oldRoom) {
      await Room.findByIdAndUpdate(oldRoom, { $inc: { occupiedCount: -1 } });
    }

    await Room.findByIdAndUpdate(newRoomId, { $inc: { occupiedCount: 1 } });

    app.roomId = newRoomId;
    await app.save();

    request.status = "approved";
    await request.save();

    return res.json({
      success: true,
      message: "Room updated",
      app
    });
  }

  throw new ApiError(400, "Invalid request type");
});


// ================= EXPORT =================

export {
  getMyComplaints,
  updateComplaintStatus,
  getMyHostelStudents,
  decideRoomChange
};