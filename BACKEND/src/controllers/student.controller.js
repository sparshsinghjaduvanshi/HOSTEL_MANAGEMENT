import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from "../utils/ApiResponse"

import { User } from "../models/user.model";
import { Student } from "../models/student.model";

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

const uploadDocuments = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(400, "error working with data in student controller!")
    }

    const student = await Student.findOne({ userId: user._id })
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    if (!student.isDocumentUploadAllowed) {
        throw new ApiError(403, "Document upload not allowed yet");
    }

    const { type } = req.body;

    if (!type) {
        throw new ApiError(400, "Document type is required");
    }

    //  prevent duplicate document type
    const existingDoc = await Document.findOne({
        studentId: student._id,
        type
    });

    if (existingDoc) {
        throw new ApiError(400, "Document of this type already uploaded");
    }

    //  get file from multer
    const fileLocalPath = req.file?.path;

    if (!fileLocalPath) {
        throw new ApiError(400, "File is required");
    }

    //  upload to cloudinary
    const uploaded = await uploadOnCLoudinary(fileLocalPath);

    if (!uploaded) {
        throw new ApiError(500, "File upload failed");
    }

    // save document in DB
    const document = await Document.create({
        studentId: student._id,
        type,
        fileUrl: uploaded.secure_url
    });

    return res.status(201).json(
        new ApiResponse(201, document, "Document uploaded successfully")
    );

})

export { getMyProfile, uploadDocuments }