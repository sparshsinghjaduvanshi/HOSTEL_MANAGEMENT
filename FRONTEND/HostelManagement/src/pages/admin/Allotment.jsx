import { useEffect, useState } from "react";
import {
  startAllotment,
  getAllottedStudents,
  forceCloseCycle,
  runAllotment,
  toggleApplicationWindow
} from "../../services/admin.service.js";

import ADMIN_API from "../../services/admin.service.js";

import {
  Play,
  Power,
  Shuffle,
  RefreshCw,
  XCircle,
  BedDouble
} from "lucide-react";

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

  const refreshAll = async () => {
    await fetchCycle();
    await fetchAllotted();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      await startAllotment();
      alert("Cycle started");
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleApplicationWindow();
      refreshAll();
    } catch {
      alert("Toggle failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (cycle?.applicationOpen) {
      return alert("Close applications first");
    }

    try {
      setLoading(true);
      await runAllotment();
      alert("Allotment completed");
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceClose = async () => {
    if (!window.confirm("Close current cycle?")) return;

    try {
      setLoading(true);
      await forceCloseCycle();
      refreshAll();
    } catch {
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Allotment Control Panel
          </h2>
          <p className="text-gray-500 mt-1">
            Manage hostel cycles and allotments.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">
            Current Cycle
          </p>

          <p className="text-xl font-bold mt-2">
            {cycle?.name || "No Active Cycle"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">
            Status
          </p>

          <p className="text-xl font-bold mt-2 capitalize">
            {cycle?.status || "Closed"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">
            Applications
          </p>

          <p className="text-xl font-bold mt-2">
            {cycle?.applicationOpen ? "Open" : "Closed"}
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4">

        <button
          onClick={handleStart}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
        >
          <Play size={18} />
          Start Cycle
        </button>

        <button
          onClick={handleToggle}
          disabled={!cycle || loading}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
        >
          <Power size={18} />
          Toggle Applications
        </button>

        <button
          onClick={handleRun}
          disabled={!cycle || loading}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700"
        >
          <Shuffle size={18} />
          Run Allotment
        </button>

        <button
          onClick={handleForceClose}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700"
        >
          <XCircle size={18} />
          Force Close
        </button>

      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Allotment Summary
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-gray-50 p-4 rounded-xl">
            Total Allotted Students:
            <span className="font-bold ml-2 text-indigo-600">
              {data.length}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            Current Cycle:
            <span className="font-bold ml-2">
              {cycle?.name || "--"}
            </span>
          </div>

        </div>
      </div>

      {/* Students */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Allotted Students
          </h3>
        </div>

        {data.length === 0 ? (
          <p className="p-6 text-gray-500">
            No allotments yet
          </p>
        ) : (
          <div className="divide-y">

            {data.map((app) => (
              <div
                key={app._id}
                className="p-4 flex justify-between items-center hover:bg-gray-50"
              >

                <div>
                  <p className="font-medium">
                    {app.studentId?.userId?.fullName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {app.allottedHostel?.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <BedDouble size={18} />
                  Room {app.roomId?.roomNumber || "--"}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminAllotment;