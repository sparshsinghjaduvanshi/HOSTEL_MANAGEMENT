import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { createLog } from "../services/log.service.js";

import { User } from "../models/user.model";
import { Student } from "../models/student.model";
import { Document } from "../models/document.model";
import { RoomChangeRequest } from "../models/roomChangeRequest.model";

const getMyProfile = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(400, "error working with data in student controller!")
    }

    //Get the data
    const student = await Student.findOne({ userId: user._id })
    if (!student) {
        throw new ApiError(400, "error fetching student data in student controller")
    }
    await createLog(req, {
        userId: req.user._id,
        action: "VIEW",
        targetTable: "Student",
        newData: { type: "MY_PROFILE" }
    });

    return res
        .status(200)
        .json(
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
                        enrollmentId: student.enrollmentNo,
                    }
                },
                "Profile fetched successfully!"
            )
        )
})

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, enrollmentNo, phone } = req.body;
    const user = await User.findById(req.user._id);


    if (!fullName && !enrollmentNo && !phone) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (fullName) user.fullName = fullName;
    await user.save();

    // 1. Build update object dynamically
    const updateFields = {};

    if (enrollmentNo) updateFields.enrollmentNo = enrollmentNo;
    if (phone) updateFields.phone = phone;


    const studentDoc = await Student.findOne({ userId: req.user._id });

    if (!studentDoc) {
        throw new ApiError(404, "Student not found");
    }



    const oldStudent = studentDoc.toObject();
    // 3. Update
    const student = await Student.findByIdAndUpdate(
        studentDoc._id,
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    await createLog(req, {
        userId: req.user._id,
        action: "UPDATE_PROFILE",
        targetTable: "Student",
        targetId: student._id,
        oldData: {
            student: oldStudent,
            user: { fullName: req.user.fullName }
        },
        newData: {
            student: student.toObject(),
            user: { fullName }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, student, "Account details updated successfully")
    );
});

const uploadDocument = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const student = await Student.findOne({ userId: user._id });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    if (!student.isDocumentUploadAllowed) {
        throw new ApiError(403, "Document upload not allowed yet");
    }

    const { applicationId, type } = req.body;

    if (!type) {
        throw new ApiError(400, "Document type is required");
    }

    if (applicationId) {
        const app = await Application.findById(applicationId);
        if (!app) {
            throw new ApiError(404, "Invalid application ID");
        }
    }

    const allowedTypes = ["aadhaar", "address_proof", "id_card"];

    if (!allowedTypes.includes(type)) {
        throw new ApiError(400, "Invalid document type");
    }

    if (!req.file) {
        throw new ApiError(400, "File is required");
    }

    if (req.file.mimetype !== "application/pdf") {
        throw new ApiError(400, "Only PDF allowed");
    }

    const existingDoc = await Document.findOne({
        studentId: student._id,
        type
    });

    if (existingDoc) {
        throw new ApiError(400, "Document of this type already uploaded");
    }

    const uploaded = await uploadOnCLoudinary(req.file.path);

    if (!uploaded?.secure_url) {
        throw new ApiError(500, "File upload failed");
    }
    const documentData = {
        studentId: student._id,
        type,
        fileUrl: uploaded.secure_url
    };

    // only add if provided
    if (applicationId) {
        documentData.applicationId = applicationId;
    }

    const document = await Document.create(documentData);

    await createLog(req, {
        userId: req.user._id,
        action: "CREATE",
        targetTable: "Document",
        targetId: document._id,
        newData: {
            type: document.type,
            applicationId: document.applicationId || null
        }
    });

    return res.status(201).json(
        new ApiResponse(201, document, "Document uploaded successfully")
    );
});

const createRoomChangeRequest = asyncHandler(async (req, res) => {
    const { targetStudentId, reason } = req.body;

    if (targetStudentId) {
        const target = await Student.findById(targetStudentId);
        if (!target) {
            throw new ApiError(404, "Target student not found");
        }
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const type = targetStudentId ? "swap" : "single";

    const request = await RoomChangeRequest.create({
        requester: student._id,
        targetStudent: targetStudentId || null,
        type,
        reason
    });

    await createLog(req, {
        userId: req.user._id,
        action: "CREATE",
        targetTable: "RoomChangeRequest",
        targetId: request._id,
        newData: {
            type: request.type,
            targetStudent: request.targetStudent || null
        }
    });

    return res.status(201).json({
        success: true,
        request
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

export {
    getMyProfile,
    uploadDocument,
    createRoomChangeRequest,
    respondToRoomChange,
    getMyRoomChangeRequests,
    updateProfile
}