import validator from "validator";
import { OTP } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";


// ================= HELPERS =================

const sanitize = (val) => {
  if (typeof val !== "string") return "";
  return validator.escape(val.trim());
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// ================= SEND OTP =================

const sendOTP = asyncHandler(async (req, res) => {
  let { email } = req.body;

  //  Sanitize
  email = sanitize(email).toLowerCase();

  //  Validate email
  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  //  Restrict domain
  if (!email.endsWith("@curaj.ac.in")) {
    throw new ApiError(400, "Use your college email");
  }

  //  Prevent spam (cooldown)
  const recentOTP = await OTP.findOne({ email: { $eq: email } })
    .sort({ createdAt: -1 });

  if (recentOTP && Date.now() - new Date(recentOTP.createdAt).getTime() < 60 * 1000) {
    throw new ApiError(429, "Wait 1 minute before requesting OTP again");
  }

  //  Generate OTP
  const otp = generateOTP();

  //  Delete old OTPs
  await OTP.deleteMany({ email: { $eq: email } });

  //  Save new OTP
  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min expiry
  });

  //  Send email
  await sendEmail({
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is: ${otp}`,
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "OTP sent successfully")
  );
});

export { sendOTP };