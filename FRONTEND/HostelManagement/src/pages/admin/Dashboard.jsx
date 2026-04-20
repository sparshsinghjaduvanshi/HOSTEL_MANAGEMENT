import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/admin.service.js";
import {
  Users,
  UserCheck,
  FileText,
  CheckCircle,
  Clock,
  Bed,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAdminDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl flex items-center gap-2">
        <AlertCircle size={18} />
        {error}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Students",
      value: data.totalStudents,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Total Staff",
      value: data.totalStaff,
      icon: UserCheck,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Applications",
      value: data.totalApplications,
      icon: FileText,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Approved",
      value: data.approved,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending",
      value: data.pending,
      icon: Clock,
      color: "from-gray-500 to-gray-700",
    },
    {
      title: "Allotted",
      value: data.allotted,
      icon: Bed,
      color: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage hostel operations and monitor system activity.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >

              <div>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {item.value}
                </p>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center shadow-lg`}
              >
                <Icon size={24} />
              </div>

            </div>
          );
        })}

      </div>

      {/* Bottom Panel */}
      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Quick Summary
        </h2>

        <div className="grid md:grid-cols-3 gap-4 text-sm">

          <div className="bg-gray-50 rounded-xl p-4">
            Pending Applications:
            <span className="font-bold ml-2 text-yellow-600">
              {data.pending}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            Approved Students:
            <span className="font-bold ml-2 text-green-600">
              {data.approved}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            Room Allotted:
            <span className="font-bold ml-2 text-indigo-600">
              {data.allotted}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;