import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      window.location.href = "/auth";
    }

    if (err.response?.status === 403) {
      alert("You are not authorized");
    }

    return Promise.reject(err);
  }
);

export default API;