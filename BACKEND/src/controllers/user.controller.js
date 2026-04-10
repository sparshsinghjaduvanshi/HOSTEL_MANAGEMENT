import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";

import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import { Admin } from "../models/admin.model.js";
import { OTP } from "../models/otp.model.js";

import { sendEmail } from "../utils/sendEmail.js";
import { createLog } from "../services/log.service.js";


// ================= HELPERS =================

const sanitizeString = (value) => {
    if (typeof value !== "string") return "";
    return validator.escape(value.trim());
};

const validatePassword = (password) => {
    if (!validator.isStrongPassword(password, {
        minLength: 6,
        minNumbers: 1,
        minUppercase: 1,
    })) {
        throw new ApiError(400, "Weak password (min 6 chars, 1 number, 1 uppercase)");
    }
};

const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};


// ================= REGISTER =================

const registerStudent = asyncHandler(async (req, res) => {
    let { fullName, email, gender, password, phone, enrollmentNo, otp } = req.body;

    // Sanitize inputs
    fullName = sanitizeString(fullName);
    email = sanitizeString(email).toLowerCase();
    gender = sanitizeString(gender);
    phone = sanitizeString(phone);
    enrollmentNo = sanitizeString(enrollmentNo);
    otp = String(otp).trim();

    // Validate required
    if (!fullName || !email || !password || !gender || !phone || !enrollmentNo || !otp) {
        throw new ApiError(400, "All fields are required");
    }

    // Email validation
    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (!email.endsWith("@curaj.ac.in")) {
        throw new ApiError(400, "Use college email only");
    }

    // Password validation
    validatePassword(password);

    // Phone validation
    if (!validator.isMobilePhone(phone, "en-IN")) {
        throw new ApiError(400, "Invalid phone number");
    }

    // OTP validation
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Check existing user (safe query)
    const existedUser = await User.findOne({ email: { $eq: email } });
    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

    // Create user
    const user = await User.create({
        fullName,
        email,
        password,
        role: "student",
    });

    await Student.create({
        userId: user._id,
        phone,
        enrollmentNo,
        gender,
    });

    await OTP.deleteMany({ email });

    await createLog(req, {
        action: "REGISTER",
        targetTable: "User",
        targetId: user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, user, "Student registered successfully")
    );
});


// ================= LOGIN =================

const loginUser = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    email = sanitizeString(email).toLowerCase();

    if (!email || !password) {
        throw new ApiError(400, "Email & password required");
    }

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email");
    }

    const user = await User.findOne({ email: { $eq: email } });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account deactivated");
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    await createLog(req, {
        userId: user._id,
        action: "LOGIN",
        targetId: user._id,
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: safeUser }, "Login successful"));
});


// ================= LOGOUT =================

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
    });

    const options = { httpOnly: true, secure: true };

    await createLog(req, {
        userId: req.user._id,
        action: "LOGOUT",
    });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out"));
});


// ================= CURRENT USER =================

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;

    let roleData = null;

    if (user.role === "student") {
        roleData = await Student.findOne({ userId: user._id });
    }

    if (user.role === "admin") {
        roleData = await Admin.findOne({ userId: user._id });
    }

    return res.status(200).json(
        new ApiResponse(200, { user, roleData }, "User fetched")
    );
});


// ================= REFRESH TOKEN =================

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incoming) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== incoming) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed")
    );
});


// ================= CHANGE PASSWORD =================

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    validatePassword(newPassword);

    const user = await User.findById(req.user._id);

    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Wrong old password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated")
    );
});


// ================= FORGOT PASSWORD =================

const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;

    email = sanitizeString(email).toLowerCase();

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email");
    }

    const user = await User.findOne({ email: { $eq: email } });

    if (!user) {
        return res.json(new ApiResponse(200, {}, "If exists, email sent"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Reset Password",
        text: resetUrl,
    });

    return res.json(new ApiResponse(200, {}, "Reset link sent"));
});


// ================= DELETE USER =================

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID");
    }

    const user = await User.findById(id);

    if (!user) throw new ApiError(404, "User not found");

    if (user.role === "admin") {
        throw new ApiError(403, "Cannot delete admin");
    }

    user.isActive = false;
    await user.save();

    return res.json(new ApiResponse(200, {}, "User deactivated"));
});


// ================= EXPORT =================

export {
    registerStudent,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPassword,
    deleteUser,
};