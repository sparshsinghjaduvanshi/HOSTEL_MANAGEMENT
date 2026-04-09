import { Notification } from "../models/notification.model.js";
import{ asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";

// 🔥 Get all notifications for logged-in user
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    notifications,
  });
});

// 🔥 Mark notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // 🔐 ensure user owns notification
  if (String(notification.userId) !== String(req.user._id)) {
    throw new ApiError(403, "Not allowed");
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json({
    success: true,
    message: "Marked as read",
  });
});