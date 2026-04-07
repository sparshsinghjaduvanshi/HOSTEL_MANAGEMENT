import express  from "express";
import {
    registerStudent,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPassword,
    deleteUser
} from "../controllers/user.controller.js";
import {sendOTP} from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();


//  PUBLIC ROUTES
userRouter.route("/register").post(registerStudent);
userRouter.route("/login").post(loginUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/forgot-password").post(forgotPassword);
router.post("/send-otp", sendOTP);

// PROTECTED ROUTES
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/me").get(verifyJWT, getCurrentUser);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);


//  ADMIN / SPECIAL (Protected)
userRouter.route("/delete/:id").delete(verifyJWT, deleteUser);


export default userRouter;