import { Hostel } from "../models/hostel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ================= GET ALL HOSTELS =================

const getAllHostels = asyncHandler(async (req, res) => {
  // Optional query params (future-ready)
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const skip = (pageNum - 1) * limitNum;

  // Fetch hostels with pagination
  const hostels = await Hostel.find()
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Hostel.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        hostels
      },
      "Hostels fetched successfully"
    )
  );
});

export { getAllHostels };