import { useEffect, useState } from "react";
import {
  getAllApplications,
  reviewApplication,
} from "../../services/admin.service";

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
    <div>
      <h2 className="text-2xl font-bold mb-4">Applications</h2>

      {apps.length === 0 ? (
        <p>No applications</p>
      ) : (
        apps.map((app) => (
          <div key={app._id} className="bg-white p-4 rounded shadow mb-4">

            <p>
              <strong>Student:</strong>{" "}
              {app.studentId?.userId?.fullName}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {app.wardenDecision?.status}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApprove(app._id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(app._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default Applications;