import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAdmin = asyncHandler( async (req, res, next)=>{
    if(!req.user || req.user.role !== "admin"){
        throw new ApiError(403, "Adminn access required")
    }
    next()
})

export const requireStudent = asyncHandler( async (req, res, next) => {
    if (!req.user || req.user.role !== "student") {
        throw new ApiError(403, "Student access required");
    }
    next();
})