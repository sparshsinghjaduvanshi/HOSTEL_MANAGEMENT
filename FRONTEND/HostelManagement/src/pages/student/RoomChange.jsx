import { useState } from "react";
import { createRoomChange } from "../../services/student.service";

const RoomChange = () => {
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    try {
      await createRoomChange({
        targetStudentId: targetId || null,
        reason
      });

      alert("Request submitted!");
      setTargetId("");
      setReason("");

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Room Change Request</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          placeholder="Target Student ID (optional for swap)"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="input"
        />

        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Request
        </button>

      </div>
    </div>
  );
};

export default RoomChange;