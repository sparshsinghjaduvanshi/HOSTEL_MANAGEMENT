import { Maintenance } from "../models/maintenance.model.js";
import { roleToCategoryMap } from "../utils/roleCategoryMap.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/user.model.js"
import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Room } from "../models/room.model.js";
import { RoomChangeRequest } from "../models/roomChangeRequest.model.js";
import { createLog } from "../services/log.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

//General methods
const getMyComplaints = asyncHandler(async (req, res) => {
  const staff = req.staff;

  if (!staff) {
    throw new ApiError(403, "Staff not found");
  }

  const category = roleToCategoryMap[staff.role];

  if (!category) {
    throw new ApiError(403, "Invalid staff role");
  }

  let filter = {
    hostelId: staff.assignedHostelId,
  };

  // Caretaker can see all complaints
  if (staff.role !== "CareTaker") {
    filter.category = category;
  }

  const complaints = await Maintenance.find(filter)
    .populate("roomId")
    .populate({
      path: "reportedBy",
      populate: {
        path: "userId",
        select: "fullName email"
      }
    })
    .sort({ createdAt: -1 });

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Maintenance",
    newData: { type: "MY_COMPLAINTS" }
  });

  return res.status(200).json({
    success: true,
    complaints
  });
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "in-progress", "work-done", "resolved"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const staff = req.staff;
  if (!staff) {
    throw new ApiError(403, "Staff not found");
  }

  const complaint = await Maintenance.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Same hostel check
  if (complaint.hostelId.toString() !== staff.assignedHostelId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const category = roleToCategoryMap[staff.role];

  // Role-based category check
  if (staff.role !== "CareTaker" && complaint.category !== category) {
    throw new ApiError(403, "Not allowed");
  }

  // 🔥 Worker restrictions
  if (staff.role !== "CareTaker") {
    if (!["in-progress", "work-done"].includes(status)) {
      throw new ApiError(403, "Invalid status update");
    }

    complaint.status = status;
    complaint.handledBy = staff._id;
  }

  // Caretaker/Admin logic
  if (staff.role === "CareTaker") {
    if (status === "resolved") {
      complaint.status = "resolved";
      complaint.resolvedAt = new Date();
    }
  }
  const oldStatus = complaint.status;
  await complaint.save();

  await createLog(req, {
    userId: req.user?._id,
    action: "UPDATE",
    targetTable: "Maintenance",
    targetId: complaint._id,
    oldData: { status: oldStatus },
    newData: {
      status: complaint.status,
      handledBy: staff._id
    }
  });

  if (complaint.status === "resolved") {
    const studentDoc = await Student.findById(complaint.reportedBy);
    const user = await User.findById(studentDoc.userId);

    sendEmail({
      to: user.email,
      subject: "Complaint Resolved",
      html: `
      <p>Your complaint has been resolved.</p>
      <p>Status: ${complaint.status}</p>
    `
    });
  }

  return res.status(200).json({
    success: true,
    message: "Status updated",
    complaint
  });
});

//CareTaker and Warden
const getMyHostelStudents = asyncHandler(async (req, res) => {
  const staff = req.staff;

  // Only allow CareTaker & Warden
  if (!["CareTaker", "Warden"].includes(staff.role)) {
    throw new ApiError(403, "Access denied");
  }

  // Get current cycle
  const cycle = await AllotmentCycle.findOne({
    status: { $in: ["active", "closed"] }
  }).sort({ createdAt: -1 });

  if (!cycle) {
    throw new ApiError(404, "No allotment cycle found");
  }

  // Fetch students in this hostel
  const applications = await Application.find({
    cycleId: cycle._id,
    isAllotted: true,
    allottedHostel: staff.assignedHostelId
  })
    .populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "fullName email"
      }
    })
    .populate("roomId")
    .sort({ createdAt: -1 });

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Application",
    newData: { type: "HOSTEL_STUDENTS" }
  });

  return res.status(200).json({
    success: true,
    total: applications.length,
    students: applications
  });
});

const decideRoomChange = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, newRoomId } = req.body;

  const request = await RoomChangeRequest.findById(id);

  if (!request) throw new ApiError(404, "Request not found");

  // ================= REJECT =================
  if (action === "reject") {
    request.status = "rejected";
    await request.save();

    await createLog(req, {
      userId: req.user._id,
      action: "REJECT",
      targetTable: "RoomChangeRequest",
      targetId: request._id,
      newData: { status: "rejected" }
    });

    return res.json({ success: true, request });
  }

  // ================= SWAP CASE =================
  if (request.type === "swap") {
    if (!request.targetApproved) {
      throw new ApiError(400, "Both students must agree");
    }

    const appA = await Application.findOne({
      studentId: request.requester,
      isAllotted: true
    });

    const appB = await Application.findOne({
      studentId: request.targetStudent,
      isAllotted: true
    });

    if (!appA || !appB) {
      throw new ApiError(404, "Applications not found");
    }

    // 🔥 store old data BEFORE swap
    const oldData = {
      studentA: appA.roomId,
      studentB: appB.roomId
    };

    // 🔁 swap rooms
    const temp = appA.roomId;
    appA.roomId = appB.roomId;
    appB.roomId = temp;

    await appA.save();
    await appB.save();

    request.status = "approved";
    request.decidedBy = req.user._id;
    request.decidedAt = new Date();
    await request.save();

    await createLog(req, {
      userId: req.user._id,
      action: "UPDATE",
      targetTable: "Room",
      newData: {
        type: "SWAP",
        studentA: appA.studentId,
        studentB: appB.studentId,
        newRoomA: appA.roomId,
        newRoomB: appB.roomId
      },
      oldData
    });

    const studentA = await Student.findById(appA.studentId);
    const studentB = await Student.findById(appB.studentId);

    const userA = await User.findById(studentA.userId);
    const userB = await User.findById(studentB.userId);

    // 🔥 send emails (non-blocking)
    sendEmail({
      to: userA.email,
      subject: "Room Swap Successful",
      html: `
    <h3>Your room has been swapped</h3>
    <p>New Room: ${appA.roomId}</p>
  `
    }).catch(err => console.error(err));

    sendEmail({
      to: userB.email,
      subject: "Room Swap Successful",
      html: `
    <h3>Your room has been swapped</h3>
    <p>New Room: ${appB.roomId}</p>
  `
    }).catch(err => console.error(err));

    await Notification.create({
      userId: studentA.userId,
      title: "Room Swapped",
      message: `Your new room is ${appA.roomId}`,
      type: "room_change"
    });

    await Notification.create({
      userId: studentB.userId,
      title: "Room Swapped",
      message: `Your new room is ${appB.roomId}`,
      type: "room_change"
    });

    return res.status(200).json({
      success: true,
      message: "Rooms swapped successfully",
      appA,
      appB
    });
  }

  // ================= SINGLE CASE =================
  if (request.type === "single") {
    if (!newRoomId) {
      throw new ApiError(400, "Room ID required");
    }



    const app = await Application.findOne({
      studentId: request.requester,
      isAllotted: true
    });

    if (!app) {
      throw new ApiError(404, "Application not found");
    }

    if (newRoomId.toString() === app.roomId.toString()) {
      throw new ApiError(400, "Already in this room");
    }

    const room = await Room.findById(newRoomId);

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    // Same hostel check
    if (room.hostelId.toString() !== app.allottedHostel.toString()) {
      throw new ApiError(400, "Room must belong to same hostel");
    }

    // Vacancy check
    if (room.occupiedCount >= room.capacity) {
      throw new ApiError(400, "Room is full");
    }

    const oldRoom = app.roomId;

    // 🔽 decrease old room count (SAFE now)
    if (oldRoom) {
      await Room.findByIdAndUpdate(oldRoom, {
        $inc: { occupiedCount: -1 }
      });
    }

    // 🔼 increase new room count
    await Room.findByIdAndUpdate(newRoomId, {
      $inc: { occupiedCount: 1 }
    });

    // assign new room
    app.roomId = newRoomId;
    await app.save();

    request.status = "approved";
    request.decidedBy = req.user._id;
    request.decidedAt = new Date();
    await request.save();

    await createLog(req, {
      userId: req.user._id,
      action: "UPDATE",
      targetTable: "Room",
      targetId: app._id,
      oldData: { roomId: oldRoom },
      newData: { roomId: newRoomId }
    });

    const studentDoc = await Student.findById(app.studentId);
    const user = await User.findById(studentDoc.userId);

    sendEmail({
      to: user.email,
      subject: "Room Change Approved",
      html: `
    <h3>Your room has been updated</h3>
    <p>New Room: ${newRoomId}</p>
  `
    });

    await Notification.create({
      userId: studentDoc.userId,
      title: "Room Changed",
      message: `Your room has been changed to ${newRoomId}`,
      type: "room_change"
    });

    return res.status(200).json({
      success: true,
      message: "Room changed successfully",
      app
    });
  }

  throw new ApiError(400, "Invalid request type");
});

export {
  getMyComplaints,
  updateComplaintStatus,
  getMyHostelStudents,
  decideRoomChange
}