import API from "../api/axios";

// LOGIN
export const loginUser = (data) =>
  API.post("/users/login", data);

// REGISTER
export const registerUser = (data) =>
  API.post("/users/register", data);

// SEND OTP
export const sendOTP = (email) =>
  API.post("/users/send-otp", { email });

// LOGOUT (later)
export const logoutUser = () =>
  API.post("/users/logout");

// CURRENT USER
export const getCurrentUser = () =>
  API.get("/users/me");