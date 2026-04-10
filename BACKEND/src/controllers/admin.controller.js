import mongoose from "mongoose";
import validator from "validator";

import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Staff } from "../models/staff.model.js";
import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Admin } from "../models/admin.model.js";

import { createLog } from "../services/log.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";


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

const requireAdmin = (req) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
};


// ================= ADMIN PROFILE =================

const getAdminProfile = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const admin = await Admin.findOne({ userId: req.user._id })
    .populate("userId", "fullName email");

  if (!admin) throw new ApiError(403, "Not an admin");

  return res.status(200).json(
    new ApiResponse(200, admin, "Admin profile fetched")
  );
});


// ================= STUDENTS =================

const getAllStudentsAdmin = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const students = await Student.find()
    .populate("userId", "fullName email")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, students, "All students fetched")
  );
});


// ================= STAFF =================

const getAllStaff = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const staff = await Staff.find()
    .populate("userId", "fullName email")
    .populate("assignedHostelId")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, staff, "All staff fetched")
  );
});


// ================= APPLICATIONS =================

const getAllApplicationsAdmin = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const applications = await Application.find()
    .populate("studentId")
    .populate("preferences")
    .populate("allottedHostel")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, applications, "All applications fetched")
  );
});


// ================= DASHBOARD =================

const getAdminDashboard = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const totalStudents = await Student.countDocuments();
  const totalStaff = await Staff.countDocuments();
  const totalApplications = await Application.countDocuments();

  const approved = await Application.countDocuments({
    "wardenDecision.status": "approved"
  });

  const pending = await Application.countDocuments({
    "wardenDecision.status": "pending"
  });

  const allotted = await Application.countDocuments({
    isAllotted: true
  });

  return res.status(200).json(
    new ApiResponse(200, {
      totalStudents,
      totalStaff,
      totalApplications,
      approved,
      pending,
      allotted
    }, "Dashboard fetched")
  );
});


// ================= CREATE STAFF =================

const createStaff = asyncHandler(async (req, res) => {
  requireAdmin(req);

  let { fullName, email, password, phone, role, assignedHostelId } = req.body;

  fullName = sanitize(fullName);
  email = sanitize(email)?.toLowerCase();
  phone = sanitize(phone);

  if (!validator.isEmail(email)) throw new ApiError(400, "Invalid email");
  if (!validator.isMobilePhone(phone, "en-IN")) throw new ApiError(400, "Invalid phone");

  validateObjectId(assignedHostelId);

  const allowedRoles = ["Cleaner", "Carpenter", "Electrician", "CareTaker", "Warden"];
  if (!allowedRoles.includes(role)) throw new ApiError(400, "Invalid role");

  const existingUser = await User.findOne({ email: { $eq: email } });
  if (existingUser) throw new ApiError(400, "User exists");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      fullName,
      email,
      password,
      role: "staff"
    }], { session });

    const staff = await Staff.create([{
      userId: user[0]._id,
      phone,
      role,
      assignedHostelId
    }], { session });

    await session.commitTransaction();

    return res.status(201).json(
      new ApiResponse(201, staff[0], "Staff created")
    );

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});


// ================= UPDATE STAFF =================

const updateStaff = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const { id } = req.params;
  validateObjectId(id);

  let { fullName, email, phone, role, assignedHostelId } = req.body;

  fullName = sanitize(fullName);
  email = sanitize(email)?.toLowerCase();
  phone = sanitize(phone);

  if (email && !validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  const staff = await Staff.findById(id);
  if (!staff) throw new ApiError(404, "Staff not found");

  const user = await User.findById(staff.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (email) {
    const existing = await User.findOne({ email: { $eq: email } });
    if (existing && existing._id.toString() !== user._id.toString()) {
      throw new ApiError(400, "Email already used");
    }
    user.email = email;
  }

  if (fullName) user.fullName = fullName;
  await user.save();

  if (phone) staff.phone = phone;
  if (role) staff.role = role;
  if (assignedHostelId) {
    validateObjectId(assignedHostelId);
    staff.assignedHostelId = assignedHostelId;
  }

  await staff.save();

  return res.status(200).json(
    new ApiResponse(200, { staff, user }, "Staff updated")
  );
});


// ================= UPDATE PHOTO =================

const updateStaffPhoto = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const { id } = req.params;
  validateObjectId(id);

  if (!req.file) throw new ApiError(400, "File missing");

  if (!req.file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "Only image allowed");
  }

  if (req.file.size > 2 * 1024 * 1024) {
    throw new ApiError(400, "Max 2MB allowed");
  }

  const uploaded = await uploadOnCLoudinary(req.file.path);

  const staff = await Staff.findByIdAndUpdate(
    id,
    { $set: { photo: uploaded.url } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, staff, "Photo updated")
  );
});


// ================= CYCLE MANAGEMENT =================

const createCycle = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const academicYear = new Date().getFullYear();

  const existing = await AllotmentCycle.findOne({ academicYear });
  if (existing) throw new ApiError(400, "Cycle already exists");

  const cycle = await AllotmentCycle.create({
    name: `Cycle ${academicYear}`,
    academicYear,
    status: "open",   // ✅ YOUR REQUIREMENT
    applicationOpen: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  });

  return res.status(201).json(
    new ApiResponse(201, cycle, "Cycle created")
  );
});


const getActiveCycle = asyncHandler(async (req, res) => {
  const cycle = await AllotmentCycle.findOne({
    status: "open"
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, cycle || null, "Active cycle fetched")
  );
});


const toggleApplicationWindow = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const cycle = await AllotmentCycle.findOne({ status: "open" });
  if (!cycle) throw new ApiError(404, "No active cycle");

  cycle.applicationOpen = !cycle.applicationOpen;
  await cycle.save();

  await Student.updateMany({}, {
    $set: { isDocumentUploadAllowed: cycle.applicationOpen }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { applicationOpen: cycle.applicationOpen },
      "Toggled"
    )
  );
});


const closeCycle = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const cycle = await AllotmentCycle.findOne({ status: "open" });
  if (!cycle) throw new ApiError(404, "No active cycle");

  cycle.status = "closed";
  cycle.applicationOpen = false;

  await cycle.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Cycle closed")
  );
});


const forceCloseCycle = asyncHandler(async (req, res) => {
  requireAdmin(req);

  const cycle = await AllotmentCycle.findOne({ status: "open" });
  if (!cycle) throw new ApiError(404, "No active cycle");

  cycle.status = "closed";
  cycle.applicationOpen = false;
  cycle.reAllotmentOpen = false;

  await cycle.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Cycle force closed")
  );
});


// ================= EXPORT =================

export {
  getAdminProfile,
  getAllStudentsAdmin,
  getAllStaff,
  getAllApplicationsAdmin,
  getAdminDashboard,
  createStaff,
  updateStaff,
  updateStaffPhoto,
  createCycle,
  getActiveCycle,
  toggleApplicationWindow,
  closeCycle,
  forceCloseCycle
};