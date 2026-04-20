import { useEffect, useState } from "react";
import { getProfile } from "../../services/student.service.js";
import { getMyApplication } from "../../services/application.service.js";

import {
  Home,
  Bed,
  CheckCircle,
  User,
  Mail,
  Phone,
  BadgeInfo,
  Clock3,
  Building2,
} from "lucide-react";

const Dashboard = () => {
  const [profile, setProfile] =
    useState(null);

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [profileRes, appRes] =
        await Promise.all([
          getProfile(),
          getMyApplication(),
        ]);

      setProfile(
        profileRes.data.data ||
          null
      );

      setApplication(
        appRes.data.data ||
          appRes.data.application ||
          null
      );
    } catch (err) {
      console.log(err);
      setProfile(null);
      setApplication(null);
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

  const status =
    application
      ?.wardenDecision
      ?.status ||
    "Not Applied";

  const hostel =
    application
      ?.allottedHostel
      ?.name ||
    "Not Allotted";

  const room =
    application
      ?.roomId
      ?.roomNumber ||
    "--";

  const user =
    profile?.user || {};

  const student =
    profile?.student || {};

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Student Dashboard
        </h2>

        <p className="text-gray-500 mt-1">
          Welcome back,{" "}
          {user.fullName ||
            "Student"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Application */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Application
              </p>

              <p className="text-xl font-bold mt-1">
                {status}
              </p>
            </div>

            <CheckCircle className="text-green-500" />

          </div>

        </div>

        {/* Hostel */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Hostel
              </p>

              <p className="text-xl font-bold mt-1">
                {hostel}
              </p>
            </div>

            <Home className="text-blue-500" />

          </div>

        </div>

        {/* Room */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Room
              </p>

              <p className="text-xl font-bold mt-1">
                {room}
              </p>
            </div>

            <Bed className="text-purple-500" />

          </div>

        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Current State
              </p>

              <p className="text-xl font-bold mt-1">
                {application
                  ? "Active"
                  : "Idle"}
              </p>
            </div>

            <Clock3 className="text-orange-500" />

          </div>

        </div>

      </div>

      {/* Application Details */}
      {application && (
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">

          <h3 className="text-xl font-semibold text-gray-800">
            Application Details
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="font-semibold mt-1">
                {status}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Hostel
              </p>

              <p className="font-semibold mt-1">
                {hostel}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Room
              </p>

              <p className="font-semibold mt-1">
                {room}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-md p-6">

        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          My Profile
        </h3>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <User className="text-indigo-500" />

            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="font-medium">
                {user.fullName ||
                  "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <Mail className="text-blue-500" />

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-medium break-all">
                {user.email ||
                  "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <Phone className="text-green-500" />

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="font-medium">
                {student.phone ||
                  "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <BadgeInfo className="text-purple-500" />

            <div>
              <p className="text-sm text-gray-500">
                Enrollment No
              </p>

              <p className="font-medium">
                {student.enrollmentNo ||
                  student.enrollmentId ||
                  "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <Building2 className="text-orange-500" />

            <div>
              <p className="text-sm text-gray-500">
                Gender
              </p>

              <p className="font-medium capitalize">
                {student.gender ||
                  "N/A"}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;