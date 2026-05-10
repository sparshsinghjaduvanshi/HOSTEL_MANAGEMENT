import { useEffect, useState } from "react";

import {
  getRoomChangeRequests,
  decideRoomChange
} from "../../services/staff.service";

export default function StaffRoomChanges() {

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const res =
        await getRoomChangeRequests();

      setRequests(
        res.data.requests || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to fetch requests"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id, action) => {

    try {

      await decideRoomChange(
        id,
        action
      );

      setRequests((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
              ...item,
              status:
                action === "approve"
                  ? "approved"
                  : "rejected",
            }
            : item
        )
      );

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Action failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading room requests...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Room Change Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Review and manage hostel room change requests.
          </p>
        </div>

        <button className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm">
          Export Requests
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Total Requests
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {requests.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Approved
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              requests.filter(
                (r) => r.status === "approved"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            {
              requests.filter(
                (r) => r.status === "pending"
              ).length
            }
          </p>

         <h2 className="text-3xl font-bold text-yellow-500 mt-2">
  {
    requests.filter(
      (r) => r.status === "pending"
    ).length
  }
</h2>
        </div>

      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Requests List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Student
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Current Room
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Requested Room
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Type
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Reason
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {requests.map((request) => (
                <tr
                  key={request._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >

                  {/* Student */}
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {
                      request.requester?.userId
                        ?.fullName
                    }
                  </td>

                  {/* Current Room */}
                  <td className="px-6 py-4 text-gray-700">
                    {request.currentRoom}
                  </td>

                  {/* Requested Room */}
                  <td className="px-6 py-4 text-gray-700">
                    {request.newRoomId || "Swap Request"}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {request.type}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4 text-gray-700 max-w-xs">
                    {request.reason}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {request.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">

                      <button
                        onClick={() =>
                          handleDecision(
                            request._id,
                            "approve"
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleDecision(
                            request._id,
                            "reject"
                          )
                        }
                      >
                        Reject
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}
