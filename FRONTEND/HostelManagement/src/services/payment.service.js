import API from "../api/axios.js";

export const getMyPayment = () =>
    API.get(
      "/payments/me"
    );

export const uploadReceipt = (formData) =>
    API.post(

      "/payments/receipt",

      formData,

      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    );

export const createOrder = () =>
    API.post(
      "/payments/create-order"
    );