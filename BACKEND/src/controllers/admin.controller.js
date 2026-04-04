import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Staff } from "../models/staff.model.js";
import { Application } from "../models/application.model.js";
import { Admin } from "../models/admin.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ userId: req.user._id })
    .populate("userId", "fullName email");

  if (!admin) {
    throw new ApiError(403, "Not an admin");
  }

  return res.status(200).json(
    new ApiResponse(200, admin, "Admin profile fetched")
  );
});

const getAllStudentsAdmin = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .populate("userId", "fullName email");

  return res.status(200).json(
    new ApiResponse(200, students, "All students fetched")
  );
});

const getAllStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find()
    .populate("userId", "fullName email")
    .populate("assignedHostelId");

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

const toggleApplicationWindow = asyncHandler(async (req, res) => {
  const { cycleId, allow } = req.body;

  const cycle = await AllotmentCycle.findById(cycleId);

  if (!cycle) {
    throw new ApiError(404, "Cycle not found");
  }

  cycle.applicationOpen = allow;
  await cycle.save();

  return res.status(200).json({
    success: true,
    message: `Application window ${allow ? "opened" : "closed"}`
  });
});

const createStaff = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, phone, role, assignedHostelId, hostelType } = req.body;

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
      hostelType
    }], { session });

    await session.commitTransaction();
    session.endSession();

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
    hostelType
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
    if (hostelType) staff.hostelType = hostelType;

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
      newData: { staff, user }
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


export {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getAdminDashboard,
  toggleApplicationWindow,
  createStaff,
  updateStaff
};