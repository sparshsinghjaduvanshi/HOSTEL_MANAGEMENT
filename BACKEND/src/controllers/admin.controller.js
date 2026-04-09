import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Staff } from "../models/staff.model.js";
import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Admin } from "../models/admin.model.js";
import mongoose from "mongoose";
import { createLog } from "../services/log.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";

const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ userId: req.user._id })
    .populate("userId", "fullName email");

  if (!admin) {
    throw new ApiError(403, "Not an admin");
  }

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Admin",
    targetId: admin._id
  });

  return res.status(200).json(
    new ApiResponse(200, admin, "Admin profile fetched")
  );
});

const getAllStudentsAdmin = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .populate("userId", "fullName email");
  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Student",
    newData: { type: "ALL_STUDENTS" }
  });
  return res.status(200).json(
    new ApiResponse(200, students, "All students fetched")
  );
});

const getAllStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find()
    .populate("userId", "fullName email")
    .populate("assignedHostelId");

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Staff",
    newData: { type: "ALL_STAFF" }
  });

  return res.status(200).json(
    new ApiResponse(200, staff, "All staff fetched")
  );
});

const getAllApplicationsAdmin = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate("studentId")
    .populate("preferences")
    .populate("allottedHostel")
    .sort({ createdAt: -1 });
  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Application",
    newData: { type: "ALL_APPLICATIONS" }
  });
  return res.status(200).json(
    new ApiResponse(200, applications, "All applications fetched")
  );
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const totalStaff = await Staff.countDocuments();
  const totalApplications = await Application.countDocuments();

  const approved = await Application.countDocuments({
    "wardenDecision.status": "approved",
  });

  const pending = await Application.countDocuments({
    "wardenDecision.status": "pending",
  });

  const allotted = await Application.countDocuments({
    isAllotted: true,
  });

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Dashboard",
    newData: { type: "ADMIN_DASHBOARD" }
  });

  return res.status(200).json(
    new ApiResponse(200, {
      totalStudents,
      totalStaff,
      totalApplications,
      approved,
      pending,
      allotted,
    }, "Dashboard stats fetched")
  );
});


const createStaff = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, phone, role, assignedHostelId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const allowedRoles = ["Cleaner", "Carpenter", "Electrician", "CareTaker", "Warden"];
    if (!allowedRoles.includes(role)) {
      throw new ApiError(400, "Invalid staff role");
    }

    // 1. Create User
    const user = await User.create([{
      fullName,
      email,
      password,
      role: "staff"
    }], { session });

    // 2. Create Staff
    const staff = await Staff.create([{
      userId: user[0]._id,
      phone,
      role,
      assignedHostelId,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    await createLog(req, {
      userId: req.user._id,
      action: "CREATE",
      targetTable: "Staff",
      targetId: staff[0]._id,
      newData: {
        staff: staff[0],
        user: user[0]
      }
    });

    return res.status(201).json({
      success: true,
      staff
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    fullName,
    email,
    phone,
    role,
    assignedHostelId,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get staff
    const staff = await Staff.findById(id).session(session);
    if (!staff) {
      throw new ApiError(404, "Staff not found");
    }

    // 2. Get linked user
    const user = await User.findById(staff.userId).session(session);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const oldData = {
      staff: staff.toObject(),
      user: user.toObject()
    };

    // 3. Update USER fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    await user.save({ session, validateBeforeSave: false });


    // 4. Update STAFF fields
    if (phone) staff.phone = phone;
    if (role) staff.role = role;
    if (assignedHostelId) staff.assignedHostelId = assignedHostelId;


    await staff.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 🔐 Logging (important)
    await createLog(req, {
      userId: req.user._id,
      action: "UPDATE",
      targetTable: "Staff",
      targetId: staff._id,
      oldData,
      newData: {
        staff: staff.toObject(),
        user: user.toObject()
      }
    });

    return res.status(200).json(
      new ApiResponse(200, { staff, user }, "Staff updated successfully")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const updateStaffPhoto = asyncHandler(async (req, res) => {
  const photoLocalPath = req.file?.path
  const { id } = req.params;
  if (!photoLocalPath) {
    throw new ApiError(400, "Photo file is missing")
  }

  const photo = await uploadOnCLoudinary(photoLocalPath)
  if (!photo.url) {
    throw new ApiError
      (400, "Error while uploading on avatar")
  }

  const staff = await Staff.findByIdAndUpdate(
    id,
    {
      $set: {
        photo: photo.url
      }
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, staff, "Photo is updated successfully")
    )
})

const getAllottedStudentsAdmin = asyncHandler(async (req, res) => {
  // 1. Get active or latest completed cycle
  const cycle = await AllotmentCycle.findOne({
    status: { $in: ["active", "closed"] }
  }).sort({ createdAt: -1 });

  if (!cycle) {
    throw new ApiError(404, "No allotment cycle found");
  }

  // 2. Fetch allotted students for that cycle
  const applications = await Application.find({
    cycleId: cycle._id,
    isAllotted: true
  })
    .populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "fullName email"
      }
    })
    .populate("allottedHostel")
    .populate("roomId")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, {
      cycleId: cycle._id,
      total: applications.length,
      students: applications
    }, "Allotted students fetched successfully")
  );
});

const createCycle = asyncHandler(async (req, res) => {

  const academicYear = getAcademicYear();

  // 🔥 prevent duplicate
  const existing = await AllotmentCycle.findOne({ academicYear });

  if (existing) {
    throw new ApiError(400, "Cycle already exists for this year");
  }

  const cycle = await AllotmentCycle.create({
    name: `Cycle ${academicYear}`,
    academicYear,
    status: "active",
    applicationOpen: true,  // 🔥 OPEN for students
    startDate: new Date(),
    endDate: new Date(
      Date.now() + 180 * 24 * 60 * 60 * 1000
    )
  });

  return res.status(201).json({
    success: true,
    message: "Cycle created. Students can now apply.",
    data: cycle
  });
});

const closeApplicationWindow = asyncHandler(async (req, res) => {

  const cycle = await AllotmentCycle.findOne({
    status: "active"
  }).sort({ createdAt: -1 });

  if (!cycle) {
    throw new ApiError(404, "No active cycle found");
  }

  if (!cycle.applicationOpen) {
    throw new ApiError(400, "Application already closed");
  }

  cycle.applicationOpen = false;

  await cycle.save();

  return res.status(200).json({
    success: true,
    message: "Application window closed"
  });
});

const closeCycle = asyncHandler(async (req, res) => {

  const cycle = await AllotmentCycle.findOne({
    status: "active"
  });

  if (!cycle) {
    throw new ApiError(404, "No active cycle");
  }

  cycle.status = "closed";
  cycle.applicationOpen = false;

  await cycle.save();

  return res.status(200).json({
    success: true,
    message: "Cycle closed"
  });
});

// 🔥 GET ACTIVE CYCLE
const getActiveCycle = asyncHandler(async (req, res) => {
  const cycle = await AllotmentCycle.findOne({
    status: "open"
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: cycle || null
  });
});

// 🔥 TOGGLE APPLICATION WINDOW
const toggleApplicationWindow = asyncHandler(async (req, res) => {
  const cycle = await AllotmentCycle.findOne({ status: "open" });

  if (!cycle) {
    throw new ApiError(404, "No active cycle found");
  }

  cycle.applicationOpen = !cycle.applicationOpen;
  await cycle.save();
  await Student.updateMany(
    {},
    { $set: { isDocumentUploadAllowed: cycle.applicationOpen } }
  );

  return res.status(200).json({
    success: true,
    applicationOpen: cycle.applicationOpen,
    message: cycle.applicationOpen
      ? "Applications opened"
      : "Applications closed"
  });
});

// 🔥 FORCE CLOSE (STOP EVERYTHING)
const forceCloseCycle = asyncHandler(async (req, res) => {
  const cycle = await AllotmentCycle.findOne({ status: "open" });

  if (!cycle) {
    throw new ApiError(404, "No active cycle found");
  }

  cycle.status = "closed";
  cycle.applicationOpen = false;
  cycle.reAllotmentOpen = false;

  await cycle.save();

  return res.status(200).json({
    success: true,
    message: "Cycle forcefully closed"
  });
});

export {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getAdminDashboard,
  toggleApplicationWindow,
  createStaff,
  updateStaff,
  updateStaffPhoto,
  getAllottedStudentsAdmin,
  getActiveCycle,
  forceCloseCycle,
  createCycle,
  closeApplicationWindow,
  closeCycle
};