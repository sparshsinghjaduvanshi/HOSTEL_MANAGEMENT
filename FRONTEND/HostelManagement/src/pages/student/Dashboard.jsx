import { useEffect, useState } from "react";
import { getProfile } from "../../services/student.service";
import { getMyApplication } from "../../services/application.service";

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
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Overview</h2>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Application Status</p>
          <p className="text-xl font-bold text-yellow-500">
            {application?.wardenDecision?.status || "No Application"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Hostel</p>
          <p className="text-xl font-bold">
            {application?.allottedHostel?.name || "Not Allotted"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Room</p>
          <p className="text-xl font-bold">
            {application?.roomId?.roomNumber || "--"}
          </p>
        </div>

      </div>

      {/* PROFILE */}
      {profile && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>

          <div className="grid grid-cols-2 gap-4">
            <p><strong>Name:</strong> {profile.user.fullName}</p>
            <p><strong>Email:</strong> {profile.user.email}</p>
            <p><strong>Enrollment:</strong> {profile.student.enrollmentId}</p>
            <p><strong>Phone:</strong> {profile.student.phone}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;