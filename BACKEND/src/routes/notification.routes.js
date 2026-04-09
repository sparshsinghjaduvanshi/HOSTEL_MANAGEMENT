import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

// 🔒 protected routes
notificationRouter.use(verifyJWT);

// GET all notifications
notificationRouter.get("/", getMyNotifications);

// PATCH mark as read
notificationRouter.patch("/:id/read", markNotificationRead);

export default notificationRouter;