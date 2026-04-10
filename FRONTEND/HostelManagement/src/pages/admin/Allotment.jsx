import { useEffect, useState } from "react";
import {
  startAllotment,
  reAllotWaitlisted,
  getAllottedStudents,
  forceCloseCycle,
  runAllotment,
  toggleApplicationWindow
} from "../../services/admin.service.js";
import ADMIN_API from "../../services/admin.service.js";

const AdminAllotment = () => {
  const [data, setData] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get("/cycle/active");
      setCycle(res.data.data || null);
    } catch {
      setCycle(null);
    }
  };

  const fetchAllotted = async () => {
    try {
      const res = await getAllottedStudents();
      setData(res.data.applications || []);
    } catch {
      setData([]);
    }
  };

  useEffect(() => {
    fetchCycle();
    fetchAllotted();
  }, []);

  //  ACTIONS (UNCHANGED)
  const handleStart = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await startAllotment();
      alert("Cycle started!");
      await fetchCycle();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!cycle || loading) return;

    try {
      setLoading(true);
      await toggleApplicationWindow();
      await fetchCycle();
    } catch {
      alert("Toggle failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!cycle || cycle.applicationOpen) {
      return alert("Close applications first");
    }

    try {
      setLoading(true);
      await runAllotment();
      alert("Allotment completed");
      await fetchCycle();
      await fetchAllotted();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceClose = async () => {
    if (!window.confirm("Force close cycle?")) return;

    try {
      await forceCloseCycle();
      alert("Cycle closed");
      await fetchCycle();
    } catch {
      alert("Error closing");
    }
  };

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Allotment Control Panel
      </h2>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500">Cycle Status</p>
          <p className="text-xl font-bold mt-1">
            {cycle?.status || "No cycle"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500">Applications</p>
          <p className="text-xl font-bold mt-1">
            {cycle?.applicationOpen ? "Open" : "Closed"}
          </p>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-wrap gap-4">

        <button
          onClick={handleStart}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-white font-medium transition ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Processing..." : "Start Cycle"}
        </button>

        <button
          onClick={handleToggle}
          disabled={!cycle || loading}
          className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Toggle Applications
        </button>

        <button
          onClick={handleRun}
          disabled={!cycle || cycle?.applicationOpen}
          className={`px-5 py-2 rounded-lg text-white ${
            !cycle || cycle?.applicationOpen
              ? "bg-gray-400"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Run Allotment
        </button>

        <button
          onClick={handleForceClose}
          className="px-5 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
        >
          Force Close
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Allotted Students</h3>
        </div>

        {data.length === 0 ? (
          <p className="p-6 text-gray-500">No allotments yet</p>
        ) : (
          <div className="divide-y">
            {data.map((app) => (
              <div
                key={app._id}
                className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium">
                    {app.studentId?.userId?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {app.allottedHostel?.name}
                  </p>
                </div>

                <span className="text-sm text-gray-400">
                  Room {app.roomId?.roomNumber || "--"}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminAllotment;