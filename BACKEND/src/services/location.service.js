import { Document } from "../models/document.model.js";
import { getCoordinatesFromAddress } from "../utils/geo.util.js";

/**
 * Get student's coordinates
 */
export const getStudentCoordinates = async (studentId) => {
  const doc = await Document.findOne({
    studentId,
    type: "address_proof",
  });

  if (!doc) {
    throw new Error("Address document not found");
  }

  if (!doc.address) {
    throw new Error("Address missing in document");
  }

  // ✅ If already exists → skip API
  if (doc.latitude && doc.longitude) {
    return {
      lat: doc.latitude,
      lng: doc.longitude,
    };
  }

  // 🔥 Call API
  const { lat, lng } = await getCoordinatesFromAddress(doc.address);

  // 💾 Save for future
  doc.latitude = lat;
  doc.longitude = lng;
  await doc.save();

  return { lat, lng };
};