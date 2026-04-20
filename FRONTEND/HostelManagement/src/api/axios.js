import axios from "axios";

const API = axios.create({
  // baseURL: "http://127.0.0.1:8000/api/v1",
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err.response?.status;
//     const url = err.config?.url;

//     // ❗ Ignore auth-check endpoints (like /me)
//     if (status === 401 && !url.includes("/users/me")) {
//       console.log("Unauthorized → redirecting");

//       window.location.href = "/auth";
//     }

//     if (status === 403) {
//       alert("You are not authorized");
//     }

//     return Promise.reject(err);
//   }
// );


API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      console.log("401 Unauthorized (handled by AuthContext)");
    }

    if (status === 403) {
      alert("You are not authorized");
    }

    return Promise.reject(err);
  }
);
export default API;