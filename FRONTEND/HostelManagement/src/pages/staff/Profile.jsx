import { useState } from "react";

import {
  useAuth
} from "../../context/AuthContext";

export default function StaffProfile() {

  const { user } = useAuth();

  const [profile, setProfile] = useState({
    fullName:
      user?.fullName || "",

    email:
      user?.email || "",

    phone:
      user?.roleData?.phone || "",

    role:
      user?.roleData?.role || "",

    hostel:
      user?.roleData
        ?.assignedHostelId?.name ||
      "Assigned Hostel",

    joinedAt:
      user?.roleData?.hiredAt
        ?.split("T")[0] || "",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Profile updated successfully");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Top Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-40 relative">

          {/* Avatar */}
          <div className="absolute -bottom-14 left-8">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-green-700 overflow-hidden">
              {profile.fullName.charAt(0)}
            </div>
          </div>

        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profile.fullName}
              </h2>

              <p className="text-gray-500 mt-1">
                {profile.role}
              </p>
            </div>

            <button className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm">
              Change Photo
            </button>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Staff Role
              </label>

              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Hostel */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Assigned Hostel
              </label>

              <input
                type="text"
                value={profile.hostel}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Joined Date
              </label>

              <input
                type="text"
                value={profile.joinedAt}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
