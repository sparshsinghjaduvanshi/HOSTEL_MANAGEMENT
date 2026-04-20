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

export default ADMIN_API;