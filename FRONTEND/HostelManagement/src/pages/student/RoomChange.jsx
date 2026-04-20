import { useState } from "react";
import { createRoomChange } from "../../services/student.service";

import {
  ArrowRightLeft,
  User,
  FileText,
  Send,
  Info,
} from "lucide-react";

const RoomChange = () => {
  const [targetId, setTargetId] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submit = async () => {
    try {
      if (!reason.trim()) {
        return alert(
          "Please enter a reason"
        );
      }

      setLoading(true);

      await createRoomChange({
        targetStudentId:
          targetId.trim() ||
          null,
        reason:
          reason.trim(),
      });

      alert(
        "Room change request sent"
      );

      setTargetId("");
      setReason("");
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Room Change
        </h2>

        <p className="text-gray-500 mt-1">
          Request a room
          transfer or mutual
          room exchange.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">

        <Info className="text-blue-600 mt-0.5" />

        <div className="text-sm text-blue-800 space-y-1">
          <p>
            Leave Target
            Student ID empty
            for a normal room
            change request.
          </p>

          <p>
            Add Target Student
            ID only if both
            students want to
            exchange rooms.
          </p>
        </div>

      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">

        {/* Target Student */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Target Student ID
            (Optional)
          </label>

          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-3.5 text-gray-400"
            />

            <input
              value={targetId}
              onChange={(e) =>
                setTargetId(
                  e.target.value
                )
              }
              placeholder="Enter student ID"
              className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Reason
          </label>

          <div className="relative">
            <FileText
              size={16}
              className="absolute left-3 top-3.5 text-gray-400"
            />

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              placeholder="Explain why you need room change..."
              rows="5"
              className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none resize-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={submit}
          disabled={loading}
          className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {targetId ? (
            <ArrowRightLeft size={18} />
          ) : (
            <Send size={18} />
          )}

          {loading
            ? "Submitting..."
            : "Submit Request"}
        </button>

      </div>

    </div>
  );
};

export default RoomChange;