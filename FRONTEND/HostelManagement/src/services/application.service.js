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

// Reallotment
export const retryAllotment = () =>
  API.post(
    "/application/allotment/retry"
  );

export const getApplicationsForWarden = () =>
  API.get(
    "/applications/warden"
  );

export const reviewApplication = (data) =>
  API.post(
    "/applications/review",
    data
  );