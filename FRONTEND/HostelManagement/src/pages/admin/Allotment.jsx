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

  // 🔥 START
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

  // 🔥 TOGGLE
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

  // 🔥 RUN ALLOTMENT
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

  // 🔥 FORCE CLOSE
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
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Allotment Panel</h2>

      <div className="bg-blue-100 p-4 rounded">
        <p><strong>Status:</strong> {cycle?.status || "No cycle"}</p>
        <p>
          <strong>Applications:</strong>{" "}
          {cycle?.applicationOpen ? "Open" : "Closed"}
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">

        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded">
          Start Cycle
        </button>

        <button onClick={handleToggle} className="bg-blue-600 text-white px-4 py-2 rounded">
          Toggle Applications
        </button>

        <button onClick={handleRun} className="bg-purple-600 text-white px-4 py-2 rounded">
          Run Allotment
        </button>

        <button onClick={handleForceClose} className="bg-red-600 text-white px-4 py-2 rounded">
          Force Close
        </button>

      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3>Allotted Students</h3>

        {data.map((app) => (
          <div key={app._id}>
            {app.studentId?.userId?.fullName} → {app.allottedHostel?.name}
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminAllotment;