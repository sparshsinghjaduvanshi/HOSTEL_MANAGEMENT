import express from "express";

const paymentRouter =
  express.Router();

import {
  getMyPayment,
  uploadPaymentReceipt,
  verifyPayment,
  freezeExpiredAllotments,
  createPaymentOrder
} from "../controllers/payment.controller.js";

import {
  verifyJWT
} from "../middlewares/auth.middleware.js";

import {
  authorizeRoles
} from "../middlewares/authorizeRoles.js";

import {
  upload
} from "../middlewares/multer.middleware.js";


// ===============================
// STUDENT
// ===============================

paymentRouter.get(

  "/me",

  verifyJWT,

  authorizeRoles("student"),

  getMyPayment
);

paymentRouter.post(

  "/receipt",

  verifyJWT,

  authorizeRoles("student"),

  upload.single("receipt"),

  uploadPaymentReceipt
);


// ===============================
// ADMIN / WARDEN
// ===============================

paymentRouter.patch(

  "/verify/:feeId",

  verifyJWT,

  authorizeRoles(
    "admin",
    "staff"
  ),

  verifyPayment
);

paymentRouter.patch(

  "/freeze-expired",

  verifyJWT,

  authorizeRoles("admin"),

  freezeExpiredAllotments
);

paymentRouter.post(

  "/create-order",

  verifyJWT,

  authorizeRoles("student"),

  createPaymentOrder
);

export default paymentRouter;