import { Maintenance } from "../models/maintenance.model.js";
import { roleToCategoryMap } from "../utils/roleCategoryMap.js";

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

  return res.status(200).json({
    success: true,
    complaints
  });
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const staff = req.staff;

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
    status: { $in: ["active", "completed"] }
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

  //  SWAP CASE
  if (request.type === "swap") {
    if (!request.targetApproved) {
      throw new ApiError(400, "Both students must agree");
    }

    const appA = await Application.findOne({ studentId: request.requester });
    const appB = await Application.findOne({ studentId: request.targetStudent });

    const temp = appA.roomId;

    appA.roomId = appB.roomId;
    appB.roomId = temp;

    const oldData = {
      studentA: appA.roomId,
      studentB: appB.roomId
    };

    await appA.save();
    await appB.save();

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

  }

  //  SINGLE CASE
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

    //  Assign room
    app.roomId = newRoomId;
    await app.save();

    await createLog(req, {
      userId: req.user._id,
      action: "UPDATE",
      targetTable: "Room",
      targetId: app._id,
      oldData: { roomId: oldRoom },
      newData: { roomId: newRoomId }
    });
  }
});


export {
  getMyComplaints,
  updateComplaintStatus,
  getMyHostelStudents,
  decideRoomChange
}