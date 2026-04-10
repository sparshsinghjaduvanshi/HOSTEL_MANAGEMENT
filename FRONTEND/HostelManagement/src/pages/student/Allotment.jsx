import { useEffect, useState } from "react";
import { getMyApplication } from "../../services/application.service.js";
import ADMIN_API from "../../services/admin.service.js";

const StudentAllotment = () => {
  const [cycle, setCycle] = useState(null);
  const [application, setApplication] = useState(null);

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get("/cycle/active");
      setCycle(res.data.data || null);
    } catch {
      setCycle(null);
    }
  };

  const fetchMyApplication = async () => {
    try {
      const res = await getMyApplication();
      setApplication(res.data.application || null);
    } catch {
      setApplication(null);
    }
  };

  useEffect(() => {
    fetchCycle();
    fetchMyApplication();
  }, []);

  const status = application?.allocationStatus || "Pending";

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        My Allotment
      </h2>

      {/* CYCLE STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500">Cycle Status</p>
          <p className="text-lg font-semibold mt-1">
            {cycle?.status || "No active cycle"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500">Applications</p>
          <p className="text-lg font-semibold mt-1">
            {cycle?.applicationOpen ? "Open" : "Closed"}
          </p>
        </div>

      </div>

      {/* APPLICATION STATUS */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        {!application ? (
          <p className="text-gray-500 text-center">
            You have not applied yet.
          </p>
        ) : (
          <>
            {/* Status Badge */}
            <div className="flex items-center justify-between">

              <p className="text-gray-600">Application Status</p>

              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  status === "approved" || application.isAllotted
                    ? "bg-green-100 text-green-700"
                    : status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {status}
              </span>

            </div>

            {/* Allotment Details */}
            {application.isAllotted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Hostel</p>
                  <p className="font-semibold text-gray-800">
                    {application.allottedHostel?.name}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-semibold text-gray-800">
                    {application.roomId?.roomNumber}
                  </p>
                </div>

              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default StudentAllotment;