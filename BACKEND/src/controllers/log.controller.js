import mongoose from "mongoose";
import validator from "validator";

import { Log } from "../models/log.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createLog } from "../services/log.service.js";


// ================= HELPERS =================

const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID");
    }
};

const sanitize = (val) => {
    if (typeof val !== "string") return val;
    return validator.escape(val.trim());
};


// ================= GET ALL LOGS (ADMIN ONLY) =================

const getAllLogs = asyncHandler(async (req, res) => {
    // 🔐 Ensure admin
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied");
    }

    const logs = await Log.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(200, {
            count: logs.length,
            logs
        }, "All logs fetched")
    );
});


// ================= GET MY LOGS =================

const getMyLogs = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const logs = await Log.find({
        userId: { $eq: userId }
    })
        .sort({ createdAt: -1 })
        .lean();

    await createLog(req, {
        userId,
        action: "VIEW",
        targetTable: "Log",
        newData: { type: "MY_LOGS" }
    });

    return res.status(200).json(
        new ApiResponse(200, logs, "My logs fetched")
    );
});


// ================= FILTER LOGS (ADMIN ONLY) =================

const filterLogs = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied");
    }

    let { action, userId, startDate, endDate } = req.query;

    action = sanitize(action);

    // ✅ Validate ObjectId
    if (userId) {
        validateObjectId(userId);
    }

    // ✅ Validate dates
    if (startDate && isNaN(Date.parse(startDate))) {
        throw new ApiError(400, "Invalid start date");
    }

    if (endDate && isNaN(Date.parse(endDate))) {
        throw new ApiError(400, "Invalid end date");
    }

    let filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = { $eq: userId };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await Log.find(filter)
        .sort({ createdAt: -1 })
        .lean();

    await createLog(req, {
        userId: req.user._id,
        action: "VIEW",
        targetTable: "Log",
        newData: {
            type: "FILTER",
            filters: { action, userId, startDate, endDate }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, logs, "Filtered logs fetched")
    );
});


// ================= DELETE LOGS (ADMIN ONLY) =================

const deleteLogs = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied");
    }

    let { olderThanDays } = req.query;

    if (olderThanDays && isNaN(parseInt(olderThanDays))) {
        throw new ApiError(400, "Invalid number of days");
    }

    let filter = {};

    if (olderThanDays) {
        const days = parseInt(olderThanDays);
        const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        filter.createdAt = { $lt: date };
    }

    const countBefore = await Log.countDocuments(filter);

    const result = await Log.deleteMany(filter);

    await createLog(req, {
        userId: req.user._id,
        action: "DELETE",
        targetTable: "Log",
        oldData: { deletedCount: countBefore },
        newData: { deletedCount: result.deletedCount }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            deletedCount: result.deletedCount
        }, "Logs deleted")
    );
});


// ================= EXPORT =================

export {
    getAllLogs,
    getMyLogs,
    filterLogs,
    deleteLogs
};