import API from "../api/axios";

// ================= DASHBOARD =================

export const getStaffDashboard = () =>
  API.get("/staff/dashboard");

// ================= COMPLAINTS =================

export const getStaffComplaints = () =>
  API.get("/staff/complaints");

export const updateComplaintStatus = (id, status) =>
  API.patch(`/staff/complaints/${id}`, {
    status,
  });

// ================= STUDENTS =================

export const getHostelStudents = () =>
  API.get("/staff/students");

// ================= APPLICATIONS =================

export const getWardenApplications = () =>
  API.get("/staff/applications");

export const reviewApplication = (
  applicationId,
  action,
  remarks = ""
) =>
  API.patch("/staff/applications/review", {
    applicationId,
    action,
    remarks,
  });

// ================= ROOM CHANGES =================

export const getRoomChangeRequests = () =>
  API.get("/staff/room-changes");

export const decideRoomChange = (
  id,
  action,
  newRoomId
) =>
  API.patch(`/staff/room-changes/${id}`, {
    action,
    newRoomId,
  });

export const getStudentDetails =
  (id) => {

    return API.get(
      `/staff/students/${id}`
    );
};