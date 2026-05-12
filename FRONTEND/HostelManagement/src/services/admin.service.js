import axios from "axios";

const ADMIN_API = axios.create({
  baseURL: "http://localhost:8000/api/v1/admin",
  withCredentials: true,
});

// Dashboard
export const getAdminDashboard = () =>
  ADMIN_API.get("/dashboard");

// Applications
export const getAllApplications = () =>
  ADMIN_API.get("/applications");

export const reviewApplication = (data) =>
  ADMIN_API.post("/applications/review", data);

export const allotRoom = (id, data) =>
  ADMIN_API.patch(`/applications/${id}/allot`, data);

// Students
export const getAllStudents = () =>
  ADMIN_API.get("/students");

// Delete Student
export const deleteStudent = (id) =>
  ADMIN_API.delete(`/users/${id}`);

export const getStudentDocuments = (id) =>
  ADMIN_API.get(`/students/${id}/documents`);

export const getStudentDetails = (id) =>
  ADMIN_API.get(`/students/${id}`);

export const deleteApplication = (id) =>
  ADMIN_API.delete(`/applications/${id}`);

export const getApplicationDetails = (id) =>
  ADMIN_API.get(`/applications/${id}`);

// START ALLOTMENT
export const startAllotment = () =>
  ADMIN_API.post("/allotment/start");

export const reAllotWaitlisted = (cycleId) =>
  ADMIN_API.post("/allotment/reallot", { cycleId });

// GET ALLOTTED STUDENTS
export const getAllottedStudents = () =>
  ADMIN_API.get("/allotment/allotted");

export const forceCloseCycle = () =>
  ADMIN_API.patch("/cycle/force-close");

export const runAllotment = () =>
  ADMIN_API.post("/allotment/run");

export const toggleApplicationWindow = () =>
  ADMIN_API.patch("/cycle/toggle-application");

/* Staff */
export const getAllStaff = () =>
  ADMIN_API.get("/staff");

export const createStaff = (data) =>
  ADMIN_API.post("/staff", data);

export const updateStaff = (id, data) =>
  ADMIN_API.put(`/staff/${id}`, data);

export const deleteStaff = (id) =>
  ADMIN_API.delete(`/users/${id}`);

export const getAllComplaints = () =>
  ADMIN_API.get("/complaints");

export const getAllRoomChanges = () =>
  ADMIN_API.get("/room-changes");



export default ADMIN_API;

// import API from "../api/axios";

// // Dashboard
// export const getAdminDashboard = () =>
//   API.get("/admin/dashboard");

// // Applications
// export const getAllApplications = () =>
//   API.get("/admin/applications");

// export const reviewApplication = (data) =>
//   API.post("/admin/applications/review", data);

// export const allotRoom = (id, data) =>
//   API.patch(`/admin/applications/${id}/allot`, data);

// export const deleteApplication = (id) =>
//   API.delete(`/admin/applications/${id}`);

// export const getApplicationDetails = (id) =>
//   API.get(`/admin/applications/${id}`);

// // Students
// export const getAllStudents = () =>
//   API.get("/admin/students");

// export const deleteStudent = (id) =>
//   API.delete(`/admin/users/${id}`);

// export const getStudentDocuments = (id) =>
//   API.get(`/admin/students/${id}/documents`);

// export const getStudentDetails = (id) =>
//   API.get(`/admin/students/${id}`);

// // Allotment
// export const startAllotment = () =>
//   API.post("/admin/allotment/start");

// export const reAllotWaitlisted = (cycleId) =>
//   API.post("/admin/allotment/reallot", {
//     cycleId,
//   });

// export const getAllottedStudents = () =>
//   API.get("/admin/allotment/allotted");

// export const runAllotment = () =>
//   API.post("/admin/allotment/run");

// // Cycle
// export const forceCloseCycle = () =>
//   API.patch("/admin/cycle/force-close");

// export const toggleApplicationWindow = () =>
//   API.patch(
//     "/admin/cycle/toggle-application"
//   );

// // Staff
// export const getAllStaff = () =>
//   API.get("/admin/staff");

// export const createStaff = (data) =>
//   API.post("/admin/staff", data);

// export const updateStaff = (id, data) =>
//   API.put(`/admin/staff/${id}`, data);

// export const deleteStaff = (id) =>
//   API.delete(`/admin/users/${id}`);