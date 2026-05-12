import axios from "axios";

const LOG_API = axios.create({

  baseURL:
    "http://localhost:8000/api/v1/logs",

  withCredentials: true
});

export const getAllLogs = () =>
  LOG_API.get("/");