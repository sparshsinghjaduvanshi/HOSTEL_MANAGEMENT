import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ================= HELPERS =================

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ID");
  }
};


// ================= GET NOTIFICATIONS =================

export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const notifications = await Notification.find({
    userId: { $eq: userId }   // ✅ NoSQL safe
  })
    .sort({ createdAt: -1 })
    .lean(); // ✅ performance optimization

  return res.status(200).json(
    new ApiResponse(200, notifications, "Notifications fetched")
  );
});


// ================= MARK AS READ =================

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  validateObjectId(id);

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // 🔐 Ownership check (VERY IMPORTANT)
  if (notification.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  // ✅ Avoid unnecessary DB writes
  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Marked as read")
  );
});