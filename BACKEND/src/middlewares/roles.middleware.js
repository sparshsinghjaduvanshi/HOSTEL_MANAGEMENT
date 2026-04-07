import { Staff } from "../models/staff.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Adminn access required")
  }
  next()
})

const requireStudent = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    throw new ApiError(403, "Student access required");
  }
  next();
})

const requireStaff = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "staff") {
    throw new ApiError(403, "Staff access required");
  }

  const staff = await Staff.findOne({ userId: req.user._id });

  if (!staff) {
    throw new ApiError(403, "Staff record not found");
  }

  req.staff = staff;
  next();
});

export {
  requireAdmin,
  requireStudent,
  requireStaff
}