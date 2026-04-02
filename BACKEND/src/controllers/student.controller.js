import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from "../utils/ApiResponse"
import { uploadOnCLoudinary } from "../utils/cloudinary";

import { User } from "../models/user.model";
import { Student } from "../models/student.model";
import { Document } from "../models/document.model";

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
                        enrollmentId: Student.enrollmentNo,
                    }
                },
                "Profile fetched successfully!"
            )
        )
})

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

    return res.status(201).json(
        new ApiResponse(201, document, "Document uploaded successfully")
    );
});

export { getMyProfile, uploadDocument }