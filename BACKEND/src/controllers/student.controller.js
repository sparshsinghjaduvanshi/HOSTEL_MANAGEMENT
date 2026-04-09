// import fs from "fs";
// import { asyncHandler } from "../utils/asyncHandler.js"
// import { ApiError } from '../utils/ApiError.js'
// import { ApiResponse } from "../utils/ApiResponse.js"
// import { uploadOnCLoudinary } from "../utils/cloudinary.js";
// import { createLog } from "../services/log.service.js";

// import { User } from "../models/user.model.js";
// import { Student } from "../models/student.model.js";
// import { Document } from "../models/document.model.js";
// import { RoomChangeRequest } from "../models/roomChangeRequest.model.js";

// const getMyProfile = asyncHandler(async (req, res) => {
//     const user = req.user
//     if (!user) {
//         throw new ApiError(400, "error working with data in student controller!")
//     }

//     //Get the data
//     const student = await Student.findOne({ userId: user._id })
//     if (!student) {
//         throw new ApiError(400, "error fetching student data in student controller")
//     }
//     await createLog(req, {
//         userId: req.user._id,
//         action: "VIEW",
//         targetTable: "Student",
//         newData: { type: "MY_PROFILE" }
//     });

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     user: {
//                         fullName: user.fullName,
//                         email: user.email,
//                         photo: user.photo,
//                         role: user.role
//                     },
//                     student: {
//                         phone: student.phone,
//                         enrollmentId: student.enrollmentNo,
//                     }
//                 },
//                 "Profile fetched successfully!"
//             )
//         )
// })

// const updateProfile = asyncHandler(async (req, res) => {
//     const { fullName, enrollmentNo, phone } = req.body;
//     const user = await User.findById(req.user._id);


//     if (!fullName && !enrollmentNo && !phone) {
//         throw new ApiError(400, "At least one field is required to update");
//     }

//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     if (fullName) user.fullName = fullName;
//     await user.save();

//     // 1. Build update object dynamically
//     const updateFields = {};

//     if (enrollmentNo) updateFields.enrollmentNo = enrollmentNo;
//     if (phone) updateFields.phone = phone;


//     const studentDoc = await Student.findOne({ userId: req.user._id });

//     if (!studentDoc) {
//         throw new ApiError(404, "Student not found");
//     }



//     const oldStudent = studentDoc.toObject();
//     // 3. Update
//     const student = await Student.findByIdAndUpdate(
//         studentDoc._id,
//         { $set: updateFields },
//         { new: true, runValidators: true }
//     );

//     await createLog(req, {
//         userId: req.user._id,
//         action: "UPDATE_PROFILE",
//         targetTable: "Student",
//         targetId: student._id,
//         oldData: {
//             student: oldStudent,
//             user: { fullName: req.user.fullName }
//         },
//         newData: {
//             student: student.toObject(),
//             user: { fullName }
//         }
//     });

//     return res.status(200).json(
//         new ApiResponse(200, student, "Account details updated successfully")
//     );
// });

// const uploadDocument = asyncHandler(async (req, res) => {
//     const user = req.user;

//     if (!user) {
//         throw new ApiError(401, "Unauthorized request");
//     }

//     const student = await Student.findOne({ userId: user._id });

//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     if (!student.isDocumentUploadAllowed) {
//         throw new ApiError(403, "Document upload not allowed yet");
//     }

//     let { types, addresses } = req.body;
//     const files = req.files;

//     // ✅ Ensure arrays
//     if (!Array.isArray(types)) {
//         types = types ? [types] : [];
//     }

//     if (!Array.isArray(addresses)) {
//         addresses = addresses ? [addresses] : [];
//     }

//     // ✅ Basic validations
//     if (!files || files.length === 0) {
//         throw new ApiError(400, "No files uploaded");
//     }

//     if (files.length > 3) {
//         throw new ApiError(400, "Maximum 3 documents allowed");
//     }

//     if (!types || types.length !== files.length) {
//         throw new ApiError(400, "Each file must have a corresponding type");
//     }

//     const allowedTypes = ["aadhaar", "address_proof", "id_card"];

//     const uploadedDocs = [];

//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const type = types[i];

//         // ✅ validate type
//         if (!allowedTypes.includes(type)) {
//             throw new ApiError(400, `Invalid type: ${type}`);
//         }

//         // ✅ validate PDF
//         if (file.mimetype !== "application/pdf") {
//             throw new ApiError(400, "Only PDF allowed");
//         }

//         // ✅ address handling
//         const address =
//             type === "address_proof"
//                 ? addresses[i]
//                 : undefined;

//         if (type === "address_proof" && !address) {
//             throw new ApiError(400, "Address is required for address proof");
//         }

//         // ❌ prevent duplicate type
//         const existingDoc = await Document.findOne({
//             studentId: student._id,
//             type
//         });

//         if (existingDoc) {
//             throw new ApiError(400, `${type} already uploaded`);
//         }

//         // ✅ upload to cloud
//         const uploaded = await uploadOnCLoudinary(file.path);

//         if (!uploaded?.secure_url) {
//             throw new ApiError(500, "File upload failed");
//         }

//         const document = await Document.create({
//             studentId: student._id,
//             type,
//             fileUrl: uploaded.secure_url,
//             address
//         });

//         uploadedDocs.push(document);

//         await createLog(req, {
//             userId: req.user._id,
//             action: "CREATE",
//             targetTable: "Document",
//             targetId: document._id,
//             newData: {
//                 type: document.type
//             }
//         });
//     }

//     return res.status(201).json(
//         new ApiResponse(201, uploadedDocs, "Documents uploaded successfully")
//     );
// });

// const getDocuments = asyncHandler(async (req, res) => {
//     const student = await Student.findOne({ userId: req.user._id });

//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     const documents = await Document.find({ studentId: student._id });

//     return res.status(200).json({
//         success: true,
//         documents
//     });
// });

// const createRoomChangeRequest = asyncHandler(async (req, res) => {
//     const { targetStudentId, reason } = req.body;

//     if (targetStudentId) {
//         const target = await Student.findById(targetStudentId);
//         if (!target) {
//             throw new ApiError(404, "Target student not found");
//         }
//     }

//     const student = await Student.findOne({ userId: req.user._id });

//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     const existing = await RoomChangeRequest.findOne({
//         requester: student._id,
//         status: "pending"
//     });

//     if (existing) {
//         throw new ApiError(400, "You already have a pending request");
//     }

//     const type = targetStudentId ? "swap" : "single";

//     const request = await RoomChangeRequest.create({
//         requester: student._id,
//         targetStudent: targetStudentId || null,
//         type,
//         reason
//     });

//     await createLog(req, {
//         userId: req.user._id,
//         action: "CREATE",
//         targetTable: "RoomChangeRequest",
//         targetId: request._id,
//         newData: {
//             type: request.type,
//             targetStudent: request.targetStudent || null
//         }
//     });

//     return res.status(201).json({
//         success: true,
//         request
//     });
// });

// const respondToRoomChange = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     const student = await Student.findOne({ userId: req.user._id });
//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     const request = await RoomChangeRequest.findById(id);

//     if (!request) throw new ApiError(404, "Request not found");

//     if (request.type !== "swap") {
//         throw new ApiError(400, "Not a swap request");
//     }

//     if (request.targetStudent.toString() !== student._id.toString()) {
//         throw new ApiError(403, "Not authorized");
//     }

//     request.targetApproved = true;
//     await request.save();

//     await createLog(req, {
//         userId: req.user._id,
//         action: "UPDATE",
//         targetTable: "RoomChangeRequest",
//         targetId: request._id,
//         newData: {
//             targetApproved: true
//         }
//     });

//     return res.status(200).json({
//         success: true,
//         request
//     });
// });

// const getMyRoomChangeRequests = asyncHandler(async (req, res) => {
//     const student = await Student.findOne({ userId: req.user._id });

//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     const requests = await RoomChangeRequest.find({
//         $or: [
//             { requester: student._id },
//             { targetStudent: student._id }
//         ]
//     })
//         .populate({
//             path: "requester",
//             populate: {
//                 path: "userId",
//                 select: "fullName email"
//             }
//         })
//         .populate({
//             path: "targetStudent",
//             populate: {
//                 path: "userId",
//                 select: "fullName email"
//             }
//         })
//         .sort({ createdAt: -1 });

//     await createLog(req, {
//         userId: req.user._id,
//         action: "VIEW",
//         targetTable: "RoomChangeRequest",
//         newData: { type: "MY_REQUESTS" }
//     });

//     return res.status(200).json({
//         success: true,
//         total: requests.length,
//         requests
//     });
// });

// const cancelRoomChange = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     const request = await RoomChangeRequest.findById(id);

//     if (!request) {
//         throw new ApiError(404, "Request not found");
//     }

//     const student = await Student.findOne({ userId: req.user._id });

//     if (!student) {
//         throw new ApiError(404, "Student not found");
//     }

//     // 🔥 FIXED HERE
//     if (String(request.requester) !== String(student._id)) {
//         throw new ApiError(403, "Not allowed");
//     }

//     if (request.status !== "pending") {
//         throw new ApiError(400, "Cannot cancel processed request");
//     }

//     await request.deleteOne();

//     return res.status(200).json({
//         success: true,
//         message: "Request cancelled",
//     });
// });

// export {
//     getMyProfile,
//     uploadDocument,
//     getDocuments,
//     createRoomChangeRequest,
//     respondToRoomChange,
//     getMyRoomChangeRequests,
//     updateProfile,
//     cancelRoomChange

// }


import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { createLog } from "../services/log.service.js";

import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Document } from "../models/document.model.js";
import { RoomChangeRequest } from "../models/roomChangeRequest.model.js";


//  HELPER: GET OR CREATE STUDENT
const getOrCreateStudent = async (user) => {
  let student = await Student.findOne({ userId: user._id });

  if (!student) {
    console.log("⚠️ Auto-creating student profile");

    student = await Student.create({
      userId: user._id,
      phone: "0000000000",
      enrollmentNo: `TEMP-${Date.now()}`,
      gender: "male",
      isDocumentUploadAllowed: true
    });
  }

  return student;
};


// ---------------- GET PROFILE ----------------
const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const student = await getOrCreateStudent(user);

  await createLog(req, {
    userId: user._id,
    action: "VIEW",
    targetTable: "Student",
    newData: { type: "MY_PROFILE" }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
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
      },
      "Profile fetched successfully!"
    )
  );
});


// ---------------- UPDATE PROFILE ----------------
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, enrollmentNo, phone } = req.body;

  if (!fullName && !enrollmentNo && !phone) {
    throw new ApiError(400, "At least one field is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (fullName) user.fullName = fullName;
  await user.save();

  const student = await getOrCreateStudent(req.user);

  const oldStudent = student.toObject();

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
    action: "UPDATE_PROFILE",
    targetTable: "Student",
    targetId: student._id,
    oldData: oldStudent,
    newData: updatedStudent.toObject()
  });

  return res.status(200).json(
    new ApiResponse(200, updatedStudent, "Profile updated")
  );
});


// ---------------- UPLOAD DOCUMENT ----------------
const uploadDocument = asyncHandler(async (req, res) => {
  const user = req.user;
  const student = await getOrCreateStudent(user);

  if (!student.isDocumentUploadAllowed) {
    throw new ApiError(403, "Document upload not allowed yet");
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
    const type = types[i];

    if (!allowedTypes.includes(type)) {
      throw new ApiError(400, `Invalid type: ${type}`);
    }

    if (file.mimetype !== "application/pdf") {
      throw new ApiError(400, "Only PDF allowed");
    }

    const address = type === "address_proof" ? addresses[i] : undefined;

    if (type === "address_proof" && !address) {
      throw new ApiError(400, "Address required");
    }

    const existing = await Document.findOne({
      studentId: student._id,
      type
    });

    if (existing) {
      throw new ApiError(400, `${type} already uploaded`);
    }

    const uploaded = await uploadOnCLoudinary(file.path);

    const document = await Document.create({
      studentId: student._id,
      type,
      fileUrl: uploaded.secure_url,
      address
    });

    uploadedDocs.push(document);
  }

  return res.status(201).json(
    new ApiResponse(201, uploadedDocs, "Documents uploaded")
  );
});


// ---------------- GET DOCUMENTS ----------------
const getDocuments = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const documents = await Document.find({ studentId: student._id });

  return res.status(200).json({
    success: true,
    documents
  });
});


// ---------------- ROOM CHANGE ----------------
const createRoomChangeRequest = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudent(req.user);

  const existing = await RoomChangeRequest.findOne({
    requester: student._id,
    status: "pending"
  });

  if (existing) {
    throw new ApiError(400, "Already have pending request");
  }

  const request = await RoomChangeRequest.create({
    requester: student._id,
    type: "single"
  });

  return res.status(201).json({
    success: true,
    request
  });
});

const cancelRoomChange = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await RoomChangeRequest.findById(id);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // 🔥 FIXED HERE
    if (String(request.requester) !== String(student._id)) {
        throw new ApiError(403, "Not allowed");
    }

    if (request.status !== "pending") {
        throw new ApiError(400, "Cannot cancel processed request");
    }

    await request.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Request cancelled",
    });
});

const getMyRoomChangeRequests = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const requests = await RoomChangeRequest.find({
        $or: [
            { requester: student._id },
            { targetStudent: student._id }
        ]
    })
        .populate({
            path: "requester",
            populate: {
                path: "userId",
                select: "fullName email"
            }
        })
        .populate({
            path: "targetStudent",
            populate: {
                path: "userId",
                select: "fullName email"
            }
        })
        .sort({ createdAt: -1 });

    await createLog(req, {
        userId: req.user._id,
        action: "VIEW",
        targetTable: "RoomChangeRequest",
        newData: { type: "MY_REQUESTS" }
    });

    return res.status(200).json({
        success: true,
        total: requests.length,
        requests
    });
});

const respondToRoomChange = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

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
        targetId: request._id,
        newData: {
            targetApproved: true
        }
    });

    return res.status(200).json({
        success: true,
        request
    });
});

// ---------------- EXPORT ----------------
export {
  getMyProfile,
  uploadDocument,
  getDocuments,
  createRoomChangeRequest,
  updateProfile,
  cancelRoomChange,
  getMyRoomChangeRequests,
  respondToRoomChange
};