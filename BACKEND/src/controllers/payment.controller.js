import { Fee } from "../models/fee.model.js";
import { Allotment } from "../models/allotement.model.js";
import { Student } from "../models/student.model.js";
import { Notification } from "../models/notification.model.js";
import { razorpay } from "../utils/razorpay.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ===============================
// GET MY PAYMENT DETAILS
// ===============================

const getMyPayment = asyncHandler(async (req, res) => {

  const student =
    await Student.findOne({
      userId: req.user._id
    });

  if (!student) {
    throw new ApiError(
      404,
      "Student not found"
    );
  }

  const allotment =
    await Allotment.findOne({

      studentId: student._id

    })
      .populate("hostelId")
      .populate("roomId")
      .sort({ createdAt: -1 });

  if (!allotment) {

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "No allotment found"
      )
    );
  }

  const fee =
    await Fee.findOne({

      allotmentId:
        allotment._id

    });

  return res.status(200).json(

    new ApiResponse(

      200,

      {
        allotment,
        fee
      },

      "Payment details fetched"
    )
  );
});


// ===============================
// UPLOAD PAYMENT RECEIPT
// ===============================

const uploadPaymentReceipt = asyncHandler(async (req, res) => {

    const {
      transactionId
    } = req.body;

    if (!req.file) {

      throw new ApiError(
        400,
        "Receipt file required"
      );
    }

    const student =
      await Student.findOne({
        userId: req.user._id
      });

    if (!student) {

      throw new ApiError(
        404,
        "Student not found"
      );
    }

    const allotment =
      await Allotment.findOne({

        studentId: student._id

      });

    if (!allotment) {

      throw new ApiError(
        404,
        "No allotment found"
      );
    }

    const fee =
      await Fee.findOne({

        allotmentId:
          allotment._id

      });

    if (!fee) {

      throw new ApiError(
        404,
        "Fee record not found"
      );
    }

    fee.receiptUrl =
      req.file.path;

    fee.transactionId =
      transactionId || "";

    fee.status =
      "pending";

    await fee.save();

    return res.status(200).json(

      new ApiResponse(

        200,

        fee,

        "Receipt uploaded successfully"
      )
    );
  });


// ===============================
// VERIFY PAYMENT
// ===============================

const verifyPayment = asyncHandler(async (req, res) => {

    const { feeId } =
      req.params;

    const fee =
      await Fee.findById(
        feeId
      );

    if (!fee) {

      throw new ApiError(
        404,
        "Fee record not found"
      );
    }

    fee.status = "paid";

    fee.paidDate =
      new Date();

    fee.verifiedBy =
      req.user._id;

    fee.verifiedAt =
      new Date();

    await fee.save();

    const allotment =
      await Allotment.findById(

        fee.allotmentId
      );

    allotment.paymentStatus =
      "paid";

    allotment.status =
      "confirmed";

    allotment.confirmedAt =
      new Date();

    await allotment.save();

    await Notification.create({

      userId:
        req.user._id,

      title:
        "Payment Verified",

      message:
        "Your hostel payment has been verified successfully.",

      type:
        "fee"
    });

    return res.status(200).json(

      new ApiResponse(

        200,

        {},

        "Payment verified successfully"
      )
    );
  });


// ===============================
// FREEZE EXPIRED ALLOTMENTS
// ===============================

const freezeExpiredAllotments = asyncHandler(async (req, res) => {

    const now = new Date();

    const expiredFees =
      await Fee.find({

        status: "pending",

        dueDate: {
          $lt: now
        }
      });

    for (const fee of expiredFees) {

      const allotment =
        await Allotment.findById(

          fee.allotmentId
        );

      if (
        allotment &&
        allotment.status !== "confirmed"
      ) {

        allotment.status =
          "frozen";

        await allotment.save();
      }

      fee.status =
        "overdue";

      await fee.save();
    }

    return res.status(200).json(

      new ApiResponse(

        200,

        {},

        "Expired allotments frozen"
      )
    );
  });

// ===============================
// PAYMENT CONTROLLER
// ===============================
  const createPaymentOrder = asyncHandler(async (req, res) => {

    const student =
      await Student.findOne({
        userId: req.user._id
      });

    if (!student) {

      throw new ApiError(
        404,
        "Student not found"
      );
    }

    const allotment =
      await Allotment.findOne({

        studentId: student._id

      });

    if (!allotment) {

      throw new ApiError(
        404,
        "No allotment found"
      );
    }

    const fee =
      await Fee.findOne({

        allotmentId:
          allotment._id
      });

    if (!fee) {

      throw new ApiError(
        404,
        "Fee not found"
      );
    }

    const options = {

      amount:
        100,

      currency:
        "INR",

      receipt:
        fee._id.toString()
    };

    const order =
      await razorpay.orders.create(
        options
      );

    return res.status(200).json(

      new ApiResponse(

        200,

        order,

        "Order created"
      )
    );
});

const getPendingPayments = asyncHandler(async (req, res) => {

    const fees =
      await Fee.find({
        status: "pending"
      })

      .populate({
        path: "allotmentId",

        populate: {
          path: "studentId",

          populate: {
            path: "userId"
          }
        }
      })

      .sort({
        createdAt: -1
      });

    return res.status(200).json(

      new ApiResponse(
        200,
        fees,
        "Pending payments fetched"
      )
    );
  });
export {
  getMyPayment,
  uploadPaymentReceipt,
  verifyPayment,
  freezeExpiredAllotments,
  createPaymentOrder,
  getPendingPayments
};