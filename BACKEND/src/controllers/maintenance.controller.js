import mongoose from "mongoose";
import validator from "validator";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createLog } from "../services/log.service.js";
import {Student} from "../models/student.model.js"

import { Complaint } from "../models/maintenance.model.js";

const getOrCreateStudent = async (user) => {
  let student = await Student.findOne({ userId: user._id });

  if (!student) {
    throw new ApiError(404, "Student profile not found. Please complete profile.");
  }

  return student;
};

// create complaint
const createComplaint = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const { title, description, category } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields required");
  }

  const complaint = await Complaint.create({
    studentId: student._id,
    title,
    description,
    category
  });
  createLog(req, {
    userId: req.user._id,
    action: "CREATE",
    targetTable: "Complaint",
    newData: {
      complaintId: complaint._id,
      title
    }
  }).catch(() => { });

  return res.json(new ApiResponse(201, complaint, "Complaint submitted"));
});

// get my complaints
const getMyComplaints = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const complaints = await Complaint.find({ studentId: student._id });

  createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Complaint",
    newData: { count: complaints.length }
  }).catch(() => {});


  return res.json(new ApiResponse(200, complaints));
});

const deleteComplaint = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);
  const { id } = req.params;

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Ownership check
  if (complaint.studentId.toString() !== student._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  // Only pending allowed
  if (complaint.status !== "pending") {
    throw new ApiError(400, "Cannot delete after processing");
  }

  // Store old data before delete (important 🔥)
  const oldData = {
    complaintId: complaint._id,
    title: complaint.title,
    status: complaint.status
  };

  await complaint.deleteOne();

  // ✅ Log deletion
  createLog(req, {
    userId: req.user._id,
    action: "DELETE",
    targetTable: "Complaint",
    oldData
  }).catch(() => {});

  return res.json(new ApiResponse(200, null, "Deleted successfully"));
});

export { createComplaint, getMyComplaints, deleteComplaint }