import fs from "fs";
import mongoose from "mongoose";
import validator from "validator";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { createLog } from "../services/log.service.js";

import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Document } from "../models/document.model.js";
import { RoomChangeRequest } from "../models/roomChangeRequest.model.js";

import { fileTypeFromFile } from "file-type";


// ================= HELPERS =================

const sanitize = (val) => {
  if (typeof val !== "string") return "";
  return validator.escape(val.trim());
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ID");
  }
};

const getOrCreateStudent = async (user) => {
  let student = await Student.findOne({ userId: user._id });

  if (!student) {
    throw new ApiError(404, "Student profile not found. Please complete profile.");
  }

  return student;
};


// ================= PROFILE =================

const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const student = await getOrCreateStudent(user);

  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        role: user.role
      },
      student: {
        phone: student.phone,
        enrollmentId: student.enrollmentNo
      }
    }, "Profile fetched")
  );
});


const updateProfile = asyncHandler(async (req, res) => {
  let { fullName, enrollmentNo, phone } = req.body;

  fullName = sanitize(fullName);
  enrollmentNo = sanitize(enrollmentNo);
  phone = sanitize(phone);

  if (!fullName && !enrollmentNo && !phone) {
    throw new ApiError(400, "At least one field required");
  }

  if (phone && !validator.isMobilePhone(phone, "en-IN")) {
    throw new ApiError(400, "Invalid phone number");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (fullName) user.fullName = fullName;
  await user.save();

  const student = await getOrCreateStudent(req.user);

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $set: {
        ...(enrollmentNo && { enrollmentNo }),
        ...(phone && { phone })
      }
    },
    { new: true, runValidators: true }
  );

  await createLog(req, {
    userId: req.user._id,
    action: "UPDATE",
    targetTable: "Student",
    newData: { fullName, enrollmentNo, phone }
  }).catch(() => { });

  return res.status(200).json(
    new ApiResponse(200, updatedStudent, "Profile updated")
  );
});


// ================= DOCUMENT =================

const uploadDocument = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  if (!student.isDocumentUploadAllowed) {
    throw new ApiError(403, "Upload not allowed");
  }

  let { types, addresses } = req.body;
  const files = req.files;

  if (!Array.isArray(types)) types = types ? [types] : [];
  if (!Array.isArray(addresses)) addresses = addresses ? [addresses] : [];

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  const allowedTypes = ["aadhaar", "address_proof", "id_card"];
  const uploadedDocs = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const docType = sanitize(types[i]);

    //  Validate document type
    if (!allowedTypes.includes(docType)) {
      throw new ApiError(400, `Invalid type: ${docType}`);
    }

    //  Validate file signature
    const fileInfo = await fileTypeFromFile(file.path);

    if (!fileInfo || fileInfo.mime !== "application/pdf") {
      fs.unlinkSync(file.path); // cleanup
      throw new ApiError(400, "Invalid file type (only PDF allowed)");
    }

    //  File size check
    if (file.size > 2 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      throw new ApiError(400, "File too large (max 2MB)");
    }

    //  Address validation
    const address =
      docType === "address_proof"
        ? sanitize(addresses[i])
        : undefined;

    if (docType === "address_proof" && !address) {
      fs.unlinkSync(file.path);
      throw new ApiError(400, "Address required");
    }

    //  Prevent duplicate upload
    const existing = await Document.findOne({
      studentId: student._id,
      type: docType
    });

    if (existing) {
      fs.unlinkSync(file.path);
      throw new ApiError(400, `${docType} already uploaded`);
    }

    //  Upload to Cloudinary
    const uploaded = await uploadOnCLoudinary(file.path);

    // (Cloudinary already deletes file, but safe to ensure)
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const document = await Document.create({
      studentId: student._id,
      type: docType,
      fileUrl: uploaded.secure_url,
      address
    });

    uploadedDocs.push(document);
  }

  await createLog(req, {
    userId: req.user._id,
    action: "UPLOAD",
    targetTable: "Document",
    newData: { count: uploadedDocs.length }
  }).catch(() => { });

  return res.status(201).json(
    new ApiResponse(201, uploadedDocs, "Documents uploaded")
  );
});


const getDocuments = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const documents = await Document.find({ studentId: student._id });

  return res.status(200).json(
    new ApiResponse(200, documents, "Documents fetched")
  );
});


// ================= ROOM CHANGE =================

const createRoomChangeRequest = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const existing = await RoomChangeRequest.findOne({
    requester: student._id,
    status: "pending"
  });

  if (existing) {
    throw new ApiError(400, "Pending request already exists");
  }

  const request = await RoomChangeRequest.create({
    requester: student._id,
    type: "single"
  });

  await createLog(req, {
    userId: req.user._id,
    action: "CREATE",
    targetTable: "RoomChangeRequest",
    newData: { requestId: request._id }
  }).catch(() => { });

  return res.status(201).json(
    new ApiResponse(201, request, "Request created")
  );
});


const cancelRoomChange = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id);

  const request = await RoomChangeRequest.findById(id);
  if (!request) throw new ApiError(404, "Request not found");

  const student = await Student.findOne({ userId: req.user._id });

  if (String(request.requester) !== String(student._id)) {
    throw new ApiError(403, "Not allowed");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Cannot cancel processed request");
  }

  await request.deleteOne();

  await createLog(req, {
    userId: req.user._id,
    action: "DELETE",
    targetTable: "RoomChangeRequest",
    oldData: { requestId: request._id }
  }).catch(() => { });

  return res.status(200).json(
    new ApiResponse(200, {}, "Request cancelled")
  );
});


const getMyRoomChangeRequests = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });

  const requests = await RoomChangeRequest.find({
    $or: [
      { requester: student._id },
      { targetStudent: student._id }
    ]
  })
    .populate("requester", "userId")
    .populate("targetStudent", "userId")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, "Requests fetched")
  );
});


const respondToRoomChange = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id);

  const student = await Student.findOne({ userId: req.user._id });

  const request = await RoomChangeRequest.findById(id);

  if (!request) throw new ApiError(404, "Request not found");

  if (request.type !== "swap") {
    throw new ApiError(400, "Not a swap request");
  }

  if (request.targetStudent.toString() !== student._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  request.targetApproved = true;
  await request.save();

  await createLog(req, {
    userId: req.user._id,
    action: "UPDATE",
    targetTable: "RoomChangeRequest",
    newData: { requestId: request._id, status: "approved" }
  }).catch(() => { });

  return res.status(200).json(
    new ApiResponse(200, request, "Approved")
  );
});

const createComplaint = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const { description } = req.body;

  if (!description) {
    throw new ApiError(400, "Description required");
  }

  const complaint = await Complaint.create({
    studentId: student._id,
    description
  });

  return res.json(new ApiResponse(201, complaint, "Created"));
});

// GET
const getMyComplaints = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const complaints = await Complaint.find({
    studentId: student._id
  });

  return res.json(new ApiResponse(200, complaints));
});

// ================= EXPORT =================

export {
  getMyProfile,
  updateProfile,
  uploadDocument,
  getDocuments,
  createRoomChangeRequest,
  cancelRoomChange,
  getMyRoomChangeRequests,
  respondToRoomChange,
  createComplaint,
  getMyComplaints
};