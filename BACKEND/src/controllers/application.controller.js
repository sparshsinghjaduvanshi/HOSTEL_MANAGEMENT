import { Application } from "../models/application.model.js";
import { AllotmentCycle } from "../models/allotementCycle.model.js";
import { Student } from "../models/student.model.js";
import { Hostel } from "../models/hostel.model.js";
import { Document } from "../models/document.model.js";
import { Staff } from "../models/staff.model.js";
import { Allotment } from "../models/allotement.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createLog } from "../services/log.service.js";
import { assignRoomToStudent } from "../services/room.service.js";
import { Notification } from "../models/notification.model.js";
import { calculateDistanceForStudent } from "../utils/distance.util.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { getAcademicYear } from "../utils/academicYear.js";
import { Room } from "../models/room.model.js"
import { createNotification } from "../utils/createNotification.js";
import { Fee } from "../models/fee.model.js";


// 1. Apply for hostels

const applyForHostel = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  //  1. Get active cycle
  const cycle = await AllotmentCycle.findOne({
    status: "open",
    applicationOpen: true
  });

  if (!cycle) {
    throw new ApiError(
      400,
      "Applications are currently closed. Please wait for admin to start a new cycle."
    );
  }

  //  2. Get student
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  //  3. Validate preferences count
  if (!preferences || preferences.length === 0 || preferences.length > 3) {
    throw new ApiError(400, "Select between 1 to 3 hostels");
  }

  //  4. Fetch hostels
  const hostels = await Hostel.find({ _id: { $in: preferences } });

  if (hostels.length !== preferences.length) {
    throw new ApiError(400, "Invalid hostel IDs");
  }

  //  5. Gender validation
  const requiredType = student.gender;
  for (let hostel of hostels) {

    if (hostel.gender !== requiredType) {
      throw new ApiError(400, "Invalid hostel selection: gender mismatch");
    }
  }

  //  6. Prevent duplicate application
  const existing = await Application.findOne({

    studentId: student._id,

    cycleId: cycle._id,

    allocationStatus: {
      $nin: ["cancelled"]
    },

    "wardenDecision.status": {
      $ne: "rejected"
    }
  });

  if (existing) {

    await createLog(req, {

      userId: req.user._id,

      action: "CREATE",

      targetTable: "Application",

      newData: {
        status: "DUPLICATE_ATTEMPT"
      }
    });

    throw new ApiError(
      400,
      "You have already applied in this cycle"
    );
  }

  //  7. Fetch student documents (ONLY for validation)
  const documents = await Document.find({ studentId: student._id });

  if (!documents || documents.length === 0) {
    throw new ApiError(400, "Please upload required documents first");
  }

  // ✅ Ensure address proof exists
  const addressDoc = documents.find(doc => doc.type === "address_proof");

  if (!addressDoc) {
    throw new ApiError(400, "Address proof is required");
  }

  //  8. Calculate distance (NEW CLEAN APPROACH)
  let distance = 0; // default fallback

  try {
    const calculated = await calculateDistanceForStudent(student._id);

    if (calculated !== null && calculated !== undefined) {
      distance = Math.round(calculated);
    }

  } catch (err) {
    console.log("Distance calculation failed, continuing...", err.message);
  }

  //  9. Priority logic
  const priorityScore = distance;

  //  10. Create application
  const application = await Application.create({
    studentId: student._id,
    cycleId: cycle._id,
    distance,
    preferences,
    priorityScore
  });
  //logging
  await createLog(req, {
    userId: req.user._id,
    action: "CREATE",
    targetTable: "Application",
    targetId: application._id,
    newData: {
      preferences,
      cycleId: cycle._id,
      distance,
      priorityScore
    }
  });

  //  11. Response
  return res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    application
  });
});

// 2. Start allotment (Admin)
const startAllotment = asyncHandler(async (req, res) => {

  const academicYear = getAcademicYear();
  console.log(" START ALLOTMENT HIT");

  //  prevent multiple active cycles
  const activeCycle = await AllotmentCycle.findOne({
    status: "open"
  });
  console.log("ACTIVE CYCLE:", activeCycle);

  if (activeCycle) {
    throw new ApiError(400, "Another cycle is already active");
  }

  //  find last cycle
  const lastCycle = await AllotmentCycle.findOne({ academicYear })
    .sort({ cycleNumber: -1 });

  const nextCycleNumber = lastCycle?.cycleNumber
    ? lastCycle.cycleNumber + 1
    : 1;

  const count = await AllotmentCycle.countDocuments({ academicYear });

  const cycleNumber = count + 1;

  const cycle = await AllotmentCycle.create({
    name: `Cycle ${academicYear} - ${cycleNumber}`,
    academicYear,
    cycleNumber,
    status: "open",
    applicationOpen: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  });

  try {
    const result = await Student.updateMany(
      {}, // empty filter = all students
      { $set: { isDocumentUploadAllowed: true } }
    );

  } catch (error) {
    throw new ApiError(400, "Student permission not changed");
  }

  return res.status(201).json({
    success: true,
    message: "Cycle started. Students can now apply.",
    data: cycle
  });
});

const runAllotment = asyncHandler(async (req, res) => {

  const cycle = await AllotmentCycle.findOne({
    status: "open"
  });

  if (!cycle) {
    throw new ApiError(
      404,
      "No active cycle found"
    );
  }

  if (cycle.applicationOpen) {
    throw new ApiError(
      400,
      "Close application window before running allotment"
    );
  }

  const applications =
    await Application.find({

      cycleId: cycle._id,

      "wardenDecision.status":
        "approved",

      allocationStatus: {
        $in: ["pending", "waitlisted"]
      }

    })
      .populate("preferences")
      .sort({ priorityScore: -1 });

  if (applications.length === 0) {
    return res.status(200).json({

      success: true,

      message:
        "No pending approved applications left for allotment"
    });
  }

  for (const app of applications) {

    let allocated = false;

    for (const hostel of app.preferences) {
      console.log(
        "HOSTEL ID:",
        hostel._id
      );

      console.log(
        "HOSTEL TYPE:",
        typeof hostel._id
      );
      const room =
        await Room.findOne({

          hostelId: hostel._id,

          $expr: {
            $lt: [
              "$occupiedCount",
              "$capacity"
            ]
          }
        });

      if (room) {

        room.occupiedCount += 1;

        await room.save();

        app.isAllotted = true;

        app.allottedHostel =
          hostel._id;

        app.roomId = room._id;

        app.allocationStatus =
          "allotted";

        await app.save();
        console.log(
          "FOUND ROOM:",
          room
        );
        const allotment = await Allotment.create({

          studentId: app.studentId,

          applicationId: app._id,

          cycleId: cycle._id,

          hostelId: hostel._id,

          roomId: room._id,

          paymentDeadline:
            new Date(
              Date.now() +
              7 * 24 * 60 * 60 * 1000
            )
        });

        await Fee.create({

          allotmentId:
            allotment._id,

          amount: 42000,

          dueDate:
            allotment.paymentDeadline,

          status: "pending"
        });

        const student =
          await Student.findById(
            app.studentId
          );

        const user =
          await User.findById(
            student.userId
          );

        await createNotification({

          userId: user._id,

          title: "Hostel Allotted",

          message:
            `You have been allotted ${hostel.name}, Room ${room.roomNumber}.`,

          type: "allotment",
        });

        await sendEmail({

          to: user.email,

          subject:
            "Hostel Allotted",

          html: `
            <h2>
              Hostel Allotted
            </h2>

            <p>
              You have been allotted ${hostel.name}, Room ${room.roomNumber}.
            </p>
          `
        });

        allocated = true;

        break;
      }
    }

    if (!allocated) {

      app.allocationStatus =
        "waitlisted";

      await app.save();
    }
  }

  // =========================
  // CHECK WAITLIST
  // =========================

  const waitlistedCount =
    await Application.countDocuments({

      cycleId: cycle._id,

      allocationStatus:
        "waitlisted",

      isAllotted: false,

      "wardenDecision.status":
        "approved"
    });

  if (waitlistedCount > 0) {

    cycle.reAllotmentOpen = true;

  } else {

    cycle.status = "closed";

    cycle.reAllotmentOpen = false;
  }

  await cycle.save();

  return res.status(200).json({

    success: true,

    message:
      waitlistedCount > 0
        ? "Allotment completed. Some students are waitlisted."
        : "Allotment completed successfully"
  });
});

const getApplicationsForWarden =  asyncHandler(async (req, res) => {
  console.log(req.user);
console.log(req.staff);
    if (
      req.staff.role !== "Warden"
    ) {

      throw new ApiError(
        403,
        "Only warden allowed"
      );
    }

    const applications =
      await Application.find()

        .populate({

          path: "studentId",

          populate: {

            path: "userId",

            model: "User"
          }
        })

        .populate("preferences")

        .populate("allottedHostel")

        .populate("roomId")

        .sort({ createdAt: -1 });

    return res.status(200).json({

      success: true,

      applications
    });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const { applicationId, action, remarks } = req.body;

  const isAdmin =
    req.user.role === "admin";

  const isWarden =
    req.user.role === "staff" &&
    req.staff?.role === "Warden";

  if (!isAdmin && !isWarden) {

    throw new ApiError(
      403,
      "Only admin or warden allowed"
    );
  }

  // const staffId = req.user._id;

  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }


  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.wardenDecision.status !== "pending" && req.user.role !== "admin") {
    throw new ApiError(400, "Application already reviewed");
  }

  //  Update decision
  application.wardenDecision.status =
    action === "approve" ? "approved" : "rejected";

  application.wardenDecision.decidedBy = req.user._id;
  application.wardenDecision.decidedAt = new Date();
  application.wardenDecision.remarks = remarks || "";

  await application.save();

  await createLog(req, {
    userId: req.user._id,
    action: action === "approve" ? "APPROVE" : "REJECT",
    targetTable: "Application",
    targetId: application._id,
    newData: {
      status: application.wardenDecision.status,
      remarks
    }
  });

  const studentDoc = await Student.findById(application.studentId);
  const user = await User.findById(studentDoc.userId);

  await createNotification({

    userId: user._id,

    title:
      action === "approve"
        ? "Application Approved"
        : "Application Rejected",

    message:
      remarks ||
      `Your hostel application has been ${application.wardenDecision.status}.`,

    type:
      action === "approve"
        ? "allotment"
        : "rejection",
  });

  sendEmail({
    to: user.email,
    subject: "Application Status Update",
    html: `
    <h3>Your application is ${application.wardenDecision.status}</h3>
    <p>${remarks || ""}</p>
  `
  });

  return res.status(200).json({
    success: true,
    message: `Application ${application.wardenDecision.status} successfully`
  });
});

const getMyApplication = asyncHandler(async (req, res) => {

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

  // FETCH LATEST APPLICATION
  // OF THIS STUDENT

  const application =
    await Application.findOne({

      studentId: student._id

    })
      .sort({ createdAt: -1 })

      .populate("preferences")

      .populate("allottedHostel")

      .populate("roomId");

  if (!application) {

    return res.status(200).json({

      success: true,

      application: null
    });
  }

  return res.status(200).json({

    success: true,

    application
  });
});

const getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate("studentId")
    .populate("preferences")
    .populate("allottedHostel")
    .populate("roomId")
    .sort({ createdAt: -1 });

  await createLog(req, {
    userId: req.user._id,
    action: "VIEW",
    targetTable: "Application",
    newData: { type: "ALL_APPLICATIONS_ADMIN" }
  });

  return res.status(200).json({
    success: true,
    applications
  });
});

const getAllottedStudents = asyncHandler(async (req, res) => {

  // =========================
  // GET LATEST CYCLE
  // =========================

  const cycle =
    await AllotmentCycle
      .findOne()
      .sort({ createdAt: -1 });

  if (!cycle) {

    throw new ApiError(
      404,
      "No allotment cycle found"
    );
  }

  // =========================
  // FETCH ONLY CURRENT
  // CYCLE ALLOTMENTS
  // =========================

  const applications =
    await Application.find({

      cycleId: cycle._id,

      isAllotted: true
    })
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          model: "User"
        }
      })
      .populate("allottedHostel")
      .populate("roomId")
      .sort({ createdAt: -1 });

  return res.status(200).json({

    success: true,

    applications
  });
});

const cancelApplication = asyncHandler(async (req, res) => {
  //  Step 1: get student from user
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  //  Step 2: find application using studentId
  const application = await Application.findOne({
    studentId: student._id
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  //  Cannot cancel after allotment
  if (application.isAllotted) {
    throw new ApiError(400, "Cannot cancel after allotment");
  }

  //  Save old data for logging
  const oldData = application.toObject();

  //  Delete application
  application.allocationStatus =
    "cancelled";

  await application.save();

  //  Logging
  await createLog(req, {
    userId: req.user._id,
    action: "DELETE",
    targetTable: "Application",
    targetId: application._id,
    oldData
  });

  return res.status(200).json({
    success: true,
    message: "Application cancelled successfully"
  });
});

const reAllotWaitlisted = asyncHandler(async (req, res) => {

  const cycle =
    await AllotmentCycle.findOne({

      status: "open",

      reAllotmentOpen: true
    });

  if (!cycle) {

    throw new ApiError(
      404,
      "No active re-allotment cycle found"
    );
  }

  const applications =
    await Application.find({

      cycleId: cycle._id,

      allocationStatus:
        "waitlisted"
    })
      .populate("preferences");

  if (applications.length === 0) {

    throw new ApiError(
      400,
      "No waitlisted students found"
    );
  }

  for (const app of applications) {

    let allocated = false;

    for (const hostel of app.preferences) {
      console.log(
        "HOSTEL ID:",
        hostel._id
      );

      console.log(
        "HOSTEL TYPE:",
        typeof hostel._id
      );
      const room =
        await Room.findOne({

          hostelId: hostel._id,

          $expr: {
            $lt: [
              "$occupiedCount",
              "$capacity"
            ]
          }
        });

      if (room) {
        console.log(
          "FOUND ROOM:",
          room
        );
        room.occupiedCount += 1;

        await room.save();

        app.isAllotted = true;

        app.allottedHostel =
          hostel._id;

        app.roomId = room._id;

        app.allocationStatus =
          "allotted";

        await app.save();

        const student =
          await Student.findById(
            app.studentId
          );

        const user =
          await User.findById(
            student.userId
          );

        await createNotification({

          userId: user._id,

          title:
            "Hostel Allotted (Re-Allotment)",

          message:
            `You have been allotted ${hostel.name}, Room ${room.roomNumber}.`,

          type: "allotment",
        });

        allocated = true;

        break;
      }
    }
  }

  // =========================
  // CHECK REMAINING WAITLIST
  // =========================

  const stillWaitlisted =
    await Application.countDocuments({

      cycleId: cycle._id,

      allocationStatus:
        "waitlisted",

      isAllotted: false,

      "wardenDecision.status":
        "approved"
    });

  if (stillWaitlisted === 0) {

    cycle.reAllotmentOpen = false;

    cycle.status = "closed";

    await cycle.save();
  }

  return res.status(200).json({

    success: true,

    message:
      stillWaitlisted > 0
        ? "Some students are still waitlisted"
        : "Re-allotment completed successfully"
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const total = await Application.countDocuments();

  const approved = await Application.countDocuments({
    "wardenDecision.status": "approved"
  });

  const rejected = await Application.countDocuments({
    "wardenDecision.status": "rejected"
  });

  const pending = await Application.countDocuments({
    "wardenDecision.status": "pending"
  });

  const allotted = await Application.countDocuments({
    isAllotted: true
  });

  const waitlisted = await Application.countDocuments({
    allocationStatus: "waitlisted"
  });

  return res.status(200).json({
    success: true,
    stats: {
      total,
      approved,
      rejected,
      pending,
      allotted,
      waitlisted
    }
  });
});

const getApplicationDetailsForWarden = asyncHandler(async (req, res) => {

  const { applicationId } =
    req.params;

  const staff =
    await Staff.findOne({

      userId:
        req.user._id
    });

  if (
    !staff ||
    staff.role !== "Warden"
  ) {

    throw new ApiError(
      403,
      "Only warden allowed"
    );
  }

  const application =
    await Application.findById(
      applicationId
    )

      .populate({

        path: "studentId",

        populate: {

          path: "userId",

          model: "User",

          select:
            "fullName email"
        }
      })

      .populate("preferences")

      .populate("allottedHostel")

      .populate("roomId");

  if (!application) {

    throw new ApiError(
      404,
      "Application not found"
    );
  }

  // GET DOCUMENTS

  const documents =
    await Document.find({

      studentId:
        application.studentId._id
    });

  return res.status(200).json({

    success: true,

    application,

    documents
  });
});

export {
  applyForHostel,
  startAllotment,
  reviewApplication,
  getApplicationsForWarden,
  getAllApplications,
  getMyApplication,
  getAllottedStudents,
  cancelApplication,
  reAllotWaitlisted,
  getDashboardStats,
  runAllotment,
  getApplicationDetailsForWarden

} 