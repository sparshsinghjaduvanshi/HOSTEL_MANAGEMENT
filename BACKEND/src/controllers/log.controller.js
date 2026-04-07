import { Log } from "../models/log.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1. Get all logs (Admin)
const getAllLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: logs.length,
        logs,
    });
});

// 2. Get logs of current user
const getMyLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        logs,
    });
});

// 3. Filter logs (powerful)
const filterLogs = asyncHandler(async (req, res) => {
    const { action, userId, startDate, endDate } = req.query;

    let filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await Log.find(filter)
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        logs,
    });
});

// 4. Delete logs (optional cleanup)
const deleteLogs = asyncHandler(async (req, res) => {
    const { olderThanDays } = req.query;
    let filter = {};

    if (olderThanDays) {
        const days = parseInt(olderThanDays);
        const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        filter.createdAt = { $lt: date };
    }

    // 🔹 Count before delete (for logging)
    const logsToDelete = await Log.countDocuments(filter);

    const result = await Log.deleteMany(filter);

    // 🔐 Logging
    await createLog(req, {
        userId: req.user?._id,
        action: "DELETE",
        targetTable: "Log",
        oldData: { deletedCount: logsToDelete, filter },
        newData: { deletedCount: result.deletedCount }
    });

    res.status(200).json({
        success: true,
        message: "Logs deleted successfully",
        deletedCount: result.deletedCount,
    });
});

export {
    getAllLogs,
    getMyLogs,
    filterLogs,
    deleteLogs
}