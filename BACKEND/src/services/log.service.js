import { Log } from "../models/log.model.js";

export const createLog = async (req, logData) => {
  try {
    Log.create({
      ...logData,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch((error) => {
      console.error("Log Error:", error);
    });
  } catch (error) {
    console.error("Log Error:", error);
  }
};