import { useEffect, useState } from "react";
import {
  getAllApplications,
  reviewApplication,
} from "../../services/admin.service.js";

const Applications = () => {
  const [apps, setApps] = useState([]);

  const fetchApps = async () => {
    const res = await getAllApplications();
    setApps(res.data.data || []);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleApprove = async (id) => {
    await reviewApplication({
      applicationId: id,
      action: "approve",
    });
    fetchApps();
  };

  const handleReject = async (id) => {
    await reviewApplication({
      applicationId: id,
      action: "reject",
    });
    fetchApps();
  };

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Applications Review
      </h2>

      {/* Empty State */}
      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
          No applications found
        </div>
      ) : (

        <div className="grid gap-6">

          {apps.map((app) => {
            const status = app.wardenDecision?.status;

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition"
              >

                {/* Top Section */}
                <div className="flex justify-between items-center mb-4">

                  <div>
                    <p className="text-lg font-semibold">
                      {app.studentId?.userId?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Application ID: {app._id}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      status === "approved"
                        ? "bg-green-100 text-green-700"
                        : status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {status || "pending"}
                  </span>

                </div>

                {/* Actions */}
                <div className="flex gap-3">

                  <button
                    onClick={() => handleApprove(app._id)}
                    className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(app._id)}
                    className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                  >
                    Reject
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default Applications;