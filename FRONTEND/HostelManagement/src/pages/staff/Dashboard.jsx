import { useEffect, useState } from "react";
import { getMyComplaints } from "../../services/staff.service";

export default function Dashboard() {

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const res =
        await  getMyComplaints();

      setComplaints(
        res.data.complaints || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load dashboard"
      );

    } finally {

      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Complaints",
      value: complaints.length,
      change: "All records",
    },

    {
      title: "Pending",
      value: complaints.filter(
        (c) => c.status === "pending"
      ).length,
      change: "Needs attention",
    },

    {
      title: "In Progress",
      value: complaints.filter(
        (c) =>
          c.status === "in-progress"
      ).length,
      change: "Currently active",
    },

    {
      title: "Resolved",
      value: complaints.filter(
        (c) =>
          c.status === "resolved"
      ).length,
      change: "Completed work",
    },
  ];

  const recentComplaints = complaints.slice(0, 5);

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Staff Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome to the hostel management staff panel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {item.value}
                </h2>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {item.value}
              </div>

            </div>

            <p className="text-sm text-gray-400 mt-4">
              {item.change}
            </p>
          </div>
        ))}

      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Complaints
          </h2>

          <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Complaint
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Category
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Room
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {recentComplaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {complaint.title}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {complaint.category}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {complaint.roomId?.roomNumber || "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${complaint.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : complaint.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-md">
          <h3 className="text-xl font-semibold">
            Complaints
          </h3>

          <p className="text-sm mt-2 opacity-90">
            View and manage all assigned complaints.
          </p>

          <button className="mt-4 px-4 py-2 bg-white text-green-700 rounded-xl font-medium hover:scale-105 transition-all">
            Open
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-md">
          <h3 className="text-xl font-semibold">
            Hostel Students
          </h3>

          <p className="text-sm mt-2 opacity-90">
            Access student information and hostel records.
          </p>

          <button className="mt-4 px-4 py-2 bg-white text-blue-700 rounded-xl font-medium hover:scale-105 transition-all">
            View
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-md">
          <h3 className="text-xl font-semibold">
            Room Changes
          </h3>

          <p className="text-sm mt-2 opacity-90">
            Review room change requests and approvals.
          </p>

          <button className="mt-4 px-4 py-2 bg-white text-purple-700 rounded-xl font-medium hover:scale-105 transition-all">
            Review
          </button>
        </div>

      </div>

    </div>
  );
}
