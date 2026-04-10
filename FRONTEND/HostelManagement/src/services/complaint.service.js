import API from "../api/axios"; 

// create complaint
export const createComplaint = (data) =>
  API.post("/students/complaints", data);

// get all complaints
export const getComplaints = () =>
  API.get("/students/complaints");

// complaint.service.js
export const deleteComplaint = (id) =>
  API.delete(`/students/complaints/${id}`);