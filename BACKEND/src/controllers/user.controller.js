import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Admin } from "../models/admin.model.js";
import crypto from "crypto"; //built in node.js module used to generate secure random tokens
import { sendEmail } from "../utils/sendEmail.js";



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

        //  1. Basic validation
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

    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated");
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

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1// this remove the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "Error fetching user data")
    }

    let roleData = null;
    //fetching role based data
    if (user.role === "student") {
        roleData = await Student.findOne({ userId: user._id })
    }
    if (user.role === "admin") {
        roleData = await Admin.findOne({ userId: user._id })
    }
    //for staff too
    if (!roleData) {
        throw new ApiError(404, "Role data not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {
            user,
            roleData
        },
            "User fetched successfully."))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken

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

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken},
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

const forgotPassword = asyncHandler(async (req, res) => {
    //getting the inputs
    const { email } = req.body
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
        return res.status(200)
            .json(new ApiResponse(200, {}, "If this email existes, a reset link has been sent"))
    }
    //generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:${process.env.PORT}/reset-password/${resetToken}`;

    //send email
    await sendEmail({
        to: user.email,
        subject: "Password Reset Tequest",
        text: `Reset you password using this link: ${resetUrl}`,
        html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>`
    })
    return res.status(200).json(
        new ApiResponse(200, {}, "Reset link sent to email")
    );
})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(400, "Data is not received properly")
    }

    if (user.role === "admin") {
        throw new ApiError(403, "Cannot delete admin");
    }

    // ✅ soft delete
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "User deactivated successfully")
    );
})

export { registerStudent, loginUser, logoutUser, getCurrentUser, refreshAccessToken, changeCurrentPassword, forgotPassword, deleteUser };