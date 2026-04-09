import { Hostel } from "../models/hostel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find();

  return res.status(200).json({
    success: true,
    hostels
  });
});

export { getAllHostels };