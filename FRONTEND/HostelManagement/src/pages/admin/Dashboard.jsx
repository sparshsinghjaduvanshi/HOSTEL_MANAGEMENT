import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/admin.service.js";
import {
  Users,
  UserCheck,
  FileText,
  CheckCircle,
  Clock,
  Bed
} from "lucide-react";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  if (!data)
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading dashboard...
      </p>
    );

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
      title: "Total Applications",
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

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition"
            >

              {/* Left */}
              <div>
                <p className="text-gray-500 text-sm">
                  {item.title}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {item.value}
                </p>
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-r ${item.color} shadow`}
              >
                <Icon size={22} />
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default AdminDashboard;