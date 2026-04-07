import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/adminService";

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

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 bg-white shadow rounded">
          <h2>Total Students</h2>
          <p className="text-xl font-bold">{data.totalStudents}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2>Total Staff</h2>
          <p className="text-xl font-bold">{data.totalStaff}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2>Total Applications</h2>
          <p className="text-xl font-bold">{data.totalApplications}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2>Approved</h2>
          <p className="text-xl font-bold">{data.approved}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2>Pending</h2>
          <p className="text-xl font-bold">{data.pending}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2>Allotted</h2>
          <p className="text-xl font-bold">{data.allotted}</p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;