import API from "../api/axios";

export const getDocuments = () =>
  API.get("/students/documents");

export const uploadDocument = (formData) =>
  API.post("/students/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });