import API from "../api/axios";

// Apply
export const applyHostel = (data) =>
  API.post("/applications/apply", data);

// Get application
export const getMyApplication = () =>
  API.get("/applications/me");

// Cancel
export const cancelApplication = () =>
  API.delete("/applications/cancel");