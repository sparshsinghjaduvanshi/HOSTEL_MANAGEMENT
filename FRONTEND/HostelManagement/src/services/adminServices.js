import axios from "axios";

const ADMIN_API = axios.create({
  baseURL: "http://localhost:5000/api/v1/admin",
  withCredentials: true,
});

// Dashboard
export const getAdminDashboard = () =>
  ADMIN_API.get("/dashboard");

// Students
export const getAllStudents = () =>
  ADMIN_API.get("/students");

// Staff
export const getAllStaff = () =>
  ADMIN_API.get("/staff");

// Applications
export const getAllApplications = () =>
  ADMIN_API.get("/applications");

export default ADMIN_API;