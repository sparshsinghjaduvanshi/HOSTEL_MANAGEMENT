import { Room } from "../models/room.model.js";

/**
 * Assign a room to a student (application)
 */
export const assignRoomToStudent = async (application) => {
  if (!application.allottedHostel) {
    throw new Error("Hostel not allotted yet");
  }

  //  Find room with available beds (optimized)
  const room = await Room.findOneAndUpdate(
    {
      hostelId: application.allottedHostel,
      $expr: { $lt: ["$occupiedCount", "$capacity"] }
    },
    {
      $inc: { occupiedCount: 1 }
    },
    { new: true }
  );

  if (!room) {
    throw new Error("No rooms available in this hostel");
  }

  // assign room to application
  application.roomId = room._id;

  await application.save();

  return room;
};