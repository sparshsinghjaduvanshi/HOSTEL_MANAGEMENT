import { useState } from "react";
import { createRoomChange } from "../../services/student.service";

const RoomChange = () => {
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");

  const submit = async () => {
    await createRoomChange({ targetStudentId: targetId || null, reason });
    alert("Request sent");
    setTargetId("");
    setReason("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Room Change</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input value={targetId}
          onChange={e => setTargetId(e.target.value)}
          placeholder="Target Student ID"
          className="input" />

        <textarea value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason"
          className="input" />

        <button onClick={submit}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>

      </div>
    </div>
  );
};

export default RoomChange;