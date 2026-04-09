import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

export const getNotifications = () =>
  API.get("/notifications");

export const markAsRead = (id) =>
  API.patch(`/notifications/${id}/read`);