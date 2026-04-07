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
        let { fullName, email, password, phone, enrollmentNo, otp } = req.body;

        // ✅ 1. Validation
        if ([fullName, email, password, phone, enrollmentNo, otp].some(f => !f || f.trim() === "")) {
            throw new ApiError(400, "All fields including OTP are required");
        }

        // ✅ 2. Normalize
        email = email.toLowerCase().trim();
        fullName = fullName.trim();

        // ✅ 3. Email restriction
        if (!email.endsWith("@curaj.ac.in")) {
            throw new ApiError(400, "Use your college email");
        }

        // ✅ 4. Verify OTP
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw new ApiError(400, "OTP not found");
        }

        if (otpRecord.otp !== otp) {
            throw new ApiError(400, "Invalid OTP");
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new ApiError(400, "OTP expired");
        }

        // ✅ 5. Check existing user (inside transaction)
        const existedUser = await User.findOne({ email }).session(session);
        if (existedUser) {
            throw new ApiError(400, "User already exists with this email");
        }

        // ✅ 6. Create User
        const user = await User.create([{
            fullName,
            email,
            password,
            role: "student"
        }], { session });

        const createdUser = user[0];

        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }

        // ✅ 7. Create Student
        await Student.create([{
            userId: createdUser._id,
            phone,
            enrollmentNo
        }], { session });

        // ✅ 8. Delete OTP after successful verification
        await OTP.deleteMany({ email });

        // ✅ 9. Commit transaction
        await session.commitTransaction();
        session.endSession();

        // ✅ 10. Logging (outside transaction)
        await createLog(req, {
            action: "REGISTER",
            targetTable: "User",
            targetId: createdUser._id,
            newData: {
                email: createdUser.email,
                role: createdUser.role
            }
        });

        return res.status(201).json(
            new ApiResponse(201, createdUser, "Student registered successfully")
        );

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

        await createLog(req, {
            action: "LOGIN",
            targetTable: "User",
            newData: {
                email: normalizedEmail,
                status: "FAILED_USER_NOT_FOUND"
            }
        });
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    //check if password is working or not
    if (!isPasswordValid) {

        await createLog(req, {
            action: "LOGIN",
            targetTable: "User",
            targetId: user._id,
            newData: {
                status: "FAILED_WRONG_PASSWORD"
            }
        });

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

    await createLog(req, {
        userId: user._id,
        action: "LOGIN",
        targetTable: "User",
        targetId: user._id
    });

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

    await createLog(req, {
        userId: req.user._id,
        action: "LOGOUT",
        targetTable: "User",
        targetId: req.user._id
    });

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
                    { accessToken, refreshToken },
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

    await createLog(req, {
        userId: req.user._id,
        action: "UPDATE",
        targetTable: "User",
        targetId: req.user._id,
        newData: { type: "PASSWORD_CHANGED" }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;

    // ✅ 1. Validate input
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required");
    }

    // ✅ 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // ✅ 3. Always return same response (prevent user enumeration)
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If this email exists, a reset link has been sent")
        );
    }

    // ✅ 4. Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // ✅ 5. Save hashed token in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save({ validateBeforeSave: false });

    // ✅ 6. FIXED reset URL (IMPORTANT)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // ❌ Don't use backend localhost URL

    try {
        // ✅ 7. Send email
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `Reset your password using this link: ${resetUrl}`,
            html: `
                <h2>Password Reset</h2>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 10 minutes.</p>
            `
        });

        // ✅ 8. Logging
        await createLog(req, {
            action: "UPDATE",
            targetTable: "User",
            targetId: user._id,
            newData: {
                email: normalizedEmail,
                type: "PASSWORD_RESET_REQUEST"
            }
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Reset link sent to email")
        );

    } catch (error) {
        // ✅ 9. Cleanup if email fails (VERY IMPORTANT)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Email could not be sent");
    }
});

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

    const oldData = {
        isActive: user.isActive,
        role: user.role
    };

    await user.save({ validateBeforeSave: false });

    await createLog(req, {
        userId: req.user._id,
        action: "DELETE",
        targetTable: "User",
        targetId: user._id,
        oldData,
        newData: { isActive: false }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "User deactivated successfully")
    );
})

export { registerStudent, loginUser, logoutUser, getCurrentUser, refreshAccessToken, changeCurrentPassword, forgotPassword, deleteUser };