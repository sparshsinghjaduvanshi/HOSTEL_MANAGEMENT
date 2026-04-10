import { useEffect, useState } from "react";
import { getProfile } from "../../services/student.service.js";
import { getMyApplication } from "../../services/application.service.js";
import { Home, Bed, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const profileRes = await getProfile();
      setProfile(profileRes.data.data);

      const appRes = await getMyApplication();
      setApplication(appRes.data.application);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading dashboard...
      </p>
    );
  }

  const status = application?.wardenDecision?.status || "No Application";

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Overview
      </h2>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Status */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition">
          <div>
            <p className="text-gray-500 text-sm">Application Status</p>
            <p className="text-xl font-bold text-yellow-500 mt-1">
              {status}
            </p>
          </div>
          <CheckCircle className="text-yellow-500" />
        </div>

        {/* Hostel */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition">
          <div>
            <p className="text-gray-500 text-sm">Hostel</p>
            <p className="text-xl font-bold mt-1">
              {application?.allottedHostel?.name || "Not Allotted"}
            </p>
          </div>
          <Home className="text-blue-500" />
        </div>

        {/* Room */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition">
          <div>
            <p className="text-gray-500 text-sm">Room</p>
            <p className="text-xl font-bold mt-1">
              {application?.roomId?.roomNumber || "--"}
            </p>
          </div>
          <Bed className="text-green-500" />
        </div>

      </div>

      {/* PROFILE */}
      {profile && (
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{profile.user.fullName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile.user.email}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Enrollment</p>
              <p className="font-medium">{profile.student.enrollmentId}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile.student.phone}</p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;