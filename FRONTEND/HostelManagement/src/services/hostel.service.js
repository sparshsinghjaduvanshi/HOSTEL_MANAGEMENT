import API from "../api/axios";

export const getHostels = () =>
  API.get("/hostels"); // make sure this route exists