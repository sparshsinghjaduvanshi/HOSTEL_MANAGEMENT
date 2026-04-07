import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/v1/users", // adjust if your route is different
  withCredentials: true, // IMPORTANT (for cookies: accessToken, refreshToken)
});

// =====================
// 🔐 AUTH APIs
// =====================

// Register Student
export const registerUser = async (data) => {
  return await API.post("/register", data);
};

// Login User
export const loginUser = async (data) => {
  return await API.post("/login", data);
};

// Logout User
export const logoutUser = async () => {
  return await API.post("/logout");
};

// Get Current User
export const getCurrentUser = async () => {
  return await API.get("/me");
};

// Refresh Token
export const refreshToken = async () => {
  return await API.post("/refresh-token");
};

// Change Password
export const changePassword = async (data) => {
  return await API.post("/change-password", data);
};

// Forgot Password
export const forgotPassword = async (email) => {
  return await API.post("/forgot-password", { email });
};

export default API;