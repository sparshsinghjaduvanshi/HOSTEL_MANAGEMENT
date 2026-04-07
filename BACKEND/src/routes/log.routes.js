import express from "express";
import {
    getAllLogs,
    getMyLogs,
    filterLogs,
    deleteLogs,
} from "../controllers/log.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const logRouter = express.Router();

/*
  ADMIN ROUTES
 */

// Get all logs
logRouter.get("/", verifyJWT, requireAdmin, getAllLogs);

// Filter logs (by action, user, date)
logRouter.get("/filter", verifyJWT, requireAdmin, filterLogs);

// Delete logs (olderThanDays required)
logRouter.delete("/", verifyJWT, requireAdmin, deleteLogs);


/**
 *  USER ROUTES
 */
// Get current user's logs
logRouter.get("/me", verifyJWT, getMyLogs);

export default logRouter;