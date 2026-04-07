import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Student } from "../models/student.model.js";
import { Hostel } from "../models/hostel.model.js";
import { Document } from "../models/document.model.js";
import { Staff } from "../models/staff.model.js";

import { calculateDistanceForStudent } from "../utils/distance.util.js";
import { assignRoomToStudent } from "../services/room.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Apply for hostels

const applyForHostel = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  //  1. Get active cycle
  const cycle = await AllotmentCycle.findOne({
    status: "active",
    applicationOpen: true
  });


  if (!cycle) {
    throw new ApiError(400, "No active allotment cycle");
  }

  //  2. Get student
  const student = await Student.findById(req.user._id);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  //  3. Validate preferences count
  if (!preferences || preferences.length === 0 || preferences.length > 3) {
    throw new ApiError(400, "Select between 1 to 3 hostels");
  }

  //  4. Fetch hostels
  const hostels = await Hostel.find({ _id: { $in: preferences } });

  if (hostels.length !== preferences.length) {
    throw new ApiError(400, "Invalid hostel IDs");
  }

  //  5. Gender validation
  const requiredType = student.gender === "male" ? "boys" : "girls";

  for (let hostel of hostels) {
    if (hostel.type !== requiredType) {
      throw new ApiError(
        400,
        "Invalid hostel selection: gender mismatch"
      );
    }
  }

  //  6. Prevent duplicate application
  const existing = await Application.findOne({
    studentId: student._id,
    cycleId: cycle._id
  });

  if (existing) {
    throw new ApiError(400, "You have already applied in this cycle");
  }

  //  7. Fetch student documents (ONLY for validation)
  const documents = await Document.find({ studentId: student._id });

  if (!documents || documents.length === 0) {
    throw new ApiError(400, "Please upload required documents first");
  }

  // ✅ Ensure address proof exists
  const addressDoc = documents.find(doc => doc.type === "address_proof");

  if (!addressDoc) {
    throw new ApiError(400, "Address proof is required");
  }

  //  8. Calculate distance (NEW CLEAN APPROACH)
  let distance;

  try {
    distance = await calculateDistanceForStudent(student._id);
    distance = Math.round(distance);
  } catch (err) {
    throw new ApiError(400, err.message);
  }

  //  9. Priority logic
  const priorityScore = distance;

  //  10. Create application
  const application = await Application.create({
    studentId: student._id,
    cycleId: cycle._id,
    distance,
    preferences,
    priorityScore
  });

  //  11. Response
  return res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    application
  });
});

// 2. Start allotment (Admin)
const startAllotment = asyncHandler(async (req, res) => {
  const { cycleId } = req.body;

  //  Validate cycle
  const cycle = await AllotmentCycle.findById(cycleId);

  if (!cycle) {
    throw new ApiError(404, "Allotment cycle not found");
  }

  //  Get all applications sorted by priority
  const applications = await Application.find({
    cycleId,
    "wardenDecision.status": "approved", // ✅ only approved
    isAllotted: false
  })
    .sort({ priorityScore: -1 })
    .populate("studentId"); //  optimization

  if (applications.length === 0) {
    throw new ApiError(400, "No applications found for this cycle");
  }

  // Loop through applications
  for (let app of applications) {

    let allotted = false;

    //  no extra DB call (already populated)
    const student = app.studentId;
    const requiredType = student.gender === "male" ? "boys" : "girls";

    // Check preferences
    for (let hostelId of app.preferences) {
      const hostel = await Hostel.findById(hostelId);

      if (!hostel) continue;

      //  Gender validation
      if (hostel.type !== requiredType) continue;

      //  Seat check
      if (hostel.availableSeats > 0) {
        try {
          // 🔥 Assign hostel
          app.allottedHostel = hostel._id;

          // Reduce seat
          hostel.availableSeats -= 1;

          await hostel.save();
          await app.save();

          // 🔥 Assign room
          await assignRoomToStudent(app);

          // ✅ Mark as allotted
          app.isAllotted = true;
          await app.save();

          allotted = true;
          break;

        } catch (err) {
          // Room allocation failed → try next hostel
          continue;
        }
      }
    }

    //  DO NOT reject here (important design choice)
    if (!allotted) {
      app.allocationStatus = "waitlisted";
      await app.save();
    }
  }

  // Mark cycle as completed
  cycle.status = "completed";
  await cycle.save();

  return res.status(200).json({
    success: true,
    message: "Hostel and room allotment completed successfully"
  });
})

const getApplicationsForWarden = asyncHandler(async (req, res) => {
  const staffId = req.user._id;

  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new ApiError(404, "Staff not found");
  }

  const hostelType = staff.hostelType;

  const hostels = await Hostel.find({ type: hostelType });
  const hostelIds = hostels.map(h => h._id);

  const applications = await Application.find({
    preferences: { $in: hostelIds },
    "wardenDecision.status": "pending"
  })
    .populate("studentId")
    .populate("preferences")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    applications
  });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const { applicationId, action, remarks } = req.body;

  const staffId = req.user._id;

  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.wardenDecision.status !== "pending" && req.user.role !== "admin") {
    throw new ApiError(400, "Application already reviewed");
  }

  //  Update decision
  application.wardenDecision.status =
    action === "approve" ? "approved" : "rejected";

  application.wardenDecision.decidedBy = req.user._id;
  application.wardenDecision.decidedAt = new Date();
  application.wardenDecision.remarks = remarks || "";

  await application.save();

  return res.status(200).json({
    success: true,
    message: `Application ${application.wardenDecision.status} successfully`
  });
});

const getMyApplication = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const application = await Application.findOne({ studentId })
    .populate("preferences")
    .populate("allottedHostel")
    .populate("roomId");

  if (!application) {
    throw new ApiError(404, "No application found");
  }

  return res.status(200).json({
    success: true,
    application
  });
});

const getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate("studentId")
    .populate("preferences")
    .populate("allottedHostel")
    .populate("roomId")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    applications
  });
});

const getAllottedStudents = asyncHandler(async (req, res) => {
  const applications = await Application.find({
    isAllotted: true
  })
    .populate("studentId")
    .populate("allottedHostel")
    .populate("roomId");

  return res.status(200).json({
    success: true,
    applications
  });
});

const cancelApplication = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const application = await Application.findOne({ studentId });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.isAllotted) {
    throw new ApiError(400, "Cannot cancel after allotment");
  }

  await application.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Application cancelled successfully"
  });
});

const reAllotWaitlisted = asyncHandler(async (req, res) => {
  const { cycleId } = req.body;

  const applications = await Application.find({
    cycleId,
    allocationStatus: "waitlisted"
  })
    .sort({ priorityScore: -1 })
    .populate("studentId");

  for (let app of applications) {
    let allotted = false;

    const student = app.studentId;
    const requiredType = student.gender === "male" ? "boys" : "girls";

    for (let hostelId of app.preferences) {
      const hostel = await Hostel.findById(hostelId);

      if (!hostel) continue;
      if (hostel.type !== requiredType) continue;

      if (hostel.availableSeats > 0) {
        try {
          app.allottedHostel = hostel._id;

          hostel.availableSeats -= 1;
          await hostel.save();

          await app.save();

          await assignRoomToStudent(app);

          app.isAllotted = true;
          app.allocationStatus = "allotted";

          await app.save();

          allotted = true;
          break;

        } catch (err) {
          continue;
        }
      }
    }

    if (!allotted) continue;
  }

  return res.status(200).json({
    success: true,
    message: "Re-allotment completed"
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const total = await Application.countDocuments();

  const approved = await Application.countDocuments({
    "wardenDecision.status": "approved"
  });

  const rejected = await Application.countDocuments({
    "wardenDecision.status": "rejected"
  });

  const pending = await Application.countDocuments({
    "wardenDecision.status": "pending"
  });

  const allotted = await Application.countDocuments({
    isAllotted: true
  });

  const waitlisted = await Application.countDocuments({
    allocationStatus: "waitlisted"
  });

  return res.status(200).json({
    success: true,
    stats: {
      total,
      approved,
      rejected,
      pending,
      allotted,
      waitlisted
    }
  });
});

export {
  applyForHostel,
  startAllotment,
  reviewApplication,
  getApplicationsForWarden,
  getAllApplications,
  getMyApplication,
  getAllottedStudents,
  cancelApplication,
  reAllotWaitlisted,
  getDashboardStats,
  
} 