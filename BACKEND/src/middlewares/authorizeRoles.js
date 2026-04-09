import  {ApiError}  from "../utils/ApiError.js";

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log("USER ROLE:", req.user?.role);
      throw new ApiError(403, "Access denied");
    }
    next();
  };
};