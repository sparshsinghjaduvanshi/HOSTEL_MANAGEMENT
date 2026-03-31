import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from "../utils/ApiResponse"
import { uploadCloudinary } from "../utils/cloudinary"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { User } from "../models/user.model";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import nodemailer from "nodemailer";
 

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(400, "Something went wrong while generating the refresh and access token.")
    }
}

const registerStudent = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let { fullName, email, password, phone, enrollmentNo } = req.body;

        // ✅ 1. Basic validation
        if ([fullName, email, password, phone, enrollmentNo].some(f => f?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // ✅ 2. Normalize data
        email = email.toLowerCase().trim();
        fullName = fullName.trim();

        // ✅ 3. Restrict to college email
        if (!email.endsWith("@curaj.ac.in")) {
            throw new ApiError(400, "Use your college email");
        }

        // ✅ 4. Check existing user
        const existedUser = await User.findOne({ email }).session(session);
        if (existedUser) {
            throw new ApiError(400, "User already exists with this email");
        }

        // ✅ 5. Create User (force role)
        const user = await User.create([{
            fullName,
            email,
            password,
            role: "student"
        }], { session });

        const createdUser = user[0];

        // Checking if user is created or not
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // ✅ 6. Create Student
        await Student.create([{
            userId: createdUser._id,
            phone,
            enrollmentNo
        }], { session });

        // ✅ 7. Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201)
            .json(new ApiResponse(201, createdUser, "Student registered successfully"));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const loginUser = asyncHandler(async (req, res) => {
    //fetch input data
    const { email, password } = req.body

    //check if email and password is entered or not
    if (!(password || email)) {
        throw new ApiError(400, "username or email is required")
    }

    //email normalization
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })

    //checking if user existed or not
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    //check if password is working or not
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //generating access and refresh Token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    //taking old and new password from the input
    const { oldPassword, newPassword } = req.body

    //checking password
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const forgotPassword = asyncHandler( async(req, res)=>{
    //getting the inputs
    const {email} = req.body
    const user = await User.findOne({email})

    //send the otp to the phone number and then take the input for new password
})

export { registerStudent, loginUser, refreshAccessToken, changeCurrentPassword };




