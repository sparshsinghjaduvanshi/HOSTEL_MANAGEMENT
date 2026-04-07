import { OTP } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

const sendOTP = asyncHandler(async (req, res) => {

  
  console.log("SEND OTP HIT"); 


  let { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  email = email.toLowerCase().trim();

  //  Restrict to college email
  if (!email.endsWith("@curaj.ac.in")) {
    throw new ApiError(400, "Use your college email");
  }

  //  Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //  Save OTP (delete old ones first)
  await OTP.deleteMany({ email });
 console.log("otp sent is : -------- ",otp)
  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
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

export {sendOTP}