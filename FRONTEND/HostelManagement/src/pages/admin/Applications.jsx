import { useEffect, useMemo, useState } from "react";
import {
  getAllApplications,
  reviewApplication,
} from "../../services/admin.service.js";

import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await getAllApplications();
      setApps(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const review = async (id, action) => {
    try {
      await reviewApplication({
        applicationId: id,
        action,
      });

      fetchApps();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const name =
        app.studentId?.userId?.fullName?.toLowerCase() || "";

      const status =
        app.wardenDecision?.status || "pending";

      const matchSearch = name.includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : status === filter;

      return matchSearch && matchFilter;
    });
  }, [apps, search, filter]);

  const badge = (status) => {
    if (status === "approved")
      return "bg-green-100 text-green-700";

    if (status === "rejected")
      return "bg-red-100 text-red-700";

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Applications Review
          </h2>
          <p className="text-gray-500 mt-1">
            Approve or reject hostel applications.
          </p>
        </div>

        <button
          onClick={fetchApps}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* Search + Filter */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="flex items-center gap-2 bg-white rounded-xl px-4 border">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 outline-none"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border rounded-xl px-4 py-3"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
          No applications found
        </div>
      ) : (
        <div className="grid gap-6">

          {filteredApps.map((app) => {
            const status =
              app.wardenDecision?.status || "pending";

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
              >

                {/* Top */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {app.studentId?.userId?.fullName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      ID: {app._id}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${badge(status)}`}
                  >
                    {status}
                  </span>

                </div>

                {/* Info */}
                <div className="grid md:grid-cols-3 gap-4 mt-5">

                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500">
                      Distance
                    </p>
                    <p className="font-semibold">
                      {app.distance || 0} km
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500">
                      Priority Score
                    </p>
                    <p className="font-semibold">
                      {app.priorityScore || 0}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500">
                      Preferences
                    </p>
                    <p className="font-semibold text-sm">
                      {app.preferences?.map((p) => p.name).join(", ") || "N/A"}
                    </p>
                  </div>

                </div>

                {/* Actions */}
                {status === "pending" && (
                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() =>
                        review(app._id, "approve")
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        review(app._id, "reject")
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default Applications;