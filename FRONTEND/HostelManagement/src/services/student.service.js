import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

// PROFILE
export const getProfile = () => API.get("/students/profile");
export const updateProfile = (data) =>
  API.patch("/students/profile", data);

// ROOM CHANGE
export const createRoomChange = (data) =>
  API.post("/students/room-change", data);

export const respondToRequest = (id) =>
  API.patch(`/students/room-change/${id}/respond`);

export const getMyRequests = () =>
  API.get("/students/room-change");

export const cancelRequest = (id) =>
  API.delete(`/students/room-change/${id}`);