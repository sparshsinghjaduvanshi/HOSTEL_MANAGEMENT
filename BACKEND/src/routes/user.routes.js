import { Router } from "express";
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

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


//  PUBLIC ROUTES
router.route("/register").post(registerStudent);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);


// PROTECTED ROUTES
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);


//  ADMIN / SPECIAL (Protected)
router.route("/delete/:id").delete(verifyJWT, deleteUser);


export default userRouter;