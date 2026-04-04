import express from "express";
import {
    getAllLogs,
    getMyLogs,
    filterLogs,
    deleteLogs,
} from "../controllers/log.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

/*
  ADMIN ROUTES
 */

// Get all logs
router.get("/", verifyJWT, isAdmin, getAllLogs);

// Filter logs (by action, user, date)
router.get("/filter", verifyJWT, isAdmin, filterLogs);

// Delete logs (olderThanDays required)
router.delete("/", verifyJWT, isAdmin, deleteLogs);


/**
 *  USER ROUTES
 */
// Get current user's logs
router.get("/me", verifyJWT, getMyLogs);

export default router;