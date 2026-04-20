import {
  Camera,
  Upload
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto
} from "../../services/student.service";

import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Save,
  RefreshCw,
} from "lucide-react";

const Profile = () => {
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    enrollmentNo: "",
  });

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      return alert(
        "Select photo first"
      );
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "photo",
        photoFile
      );

      await uploadProfilePhoto(
        formData
      );

      alert(
        "Photo updated!"
      );

      fetchProfile();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
        "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res =
        await getProfile();

      const d =
        res.data.data;

      setData(d);

      setForm({
        fullName:
          d?.user
            ?.fullName ||
          "",
        phone:
          d?.student
            ?.phone ||
          "",
        enrollmentNo:
          d?.student
            ?.enrollmentNo ||
          d?.student
            ?.enrollmentId ||
          "",
      });
    } catch (err) {
      console.log(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      if (
        !form.fullName ||
        !form.phone
      ) {
        return alert(
          "Please fill all required fields"
        );
      }

      setSaving(true);

      await updateProfile(
        form
      );

      alert(
        "Profile updated successfully"
      );

      fetchProfile();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
        "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
        Failed to load
        profile.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            My Profile
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your
            personal details.
          </p>
        </div>

        <button
          onClick={
            fetchProfile
          }
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow p-6">

        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-8">

          <div className="space-y-4">

            <div className="relative w-28 h-28">

              {data.student?.photo ? (
                <img
                  src={data.student.photo}
                  alt="profile"
                  className="w-28 h-28 rounded-2xl object-cover border shadow"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-indigo-100 flex items-center justify-center shadow">
                  <User
                    size={42}
                    className="text-indigo-600"
                  />
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow">
                <Camera size={18} />

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setPhotoFile(e.target.files[0])
                  }
                />
              </label>

            </div>

            {photoFile && (
              <button
                onClick={handlePhotoUpload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                <Upload size={16} />

                {uploading
                  ? "Uploading..."
                  : "Upload Photo"}
              </button>
            )}

          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {
                form.fullName
              }
            </h3>

            <p className="text-gray-500">
              Student
              Account
            </p>
          </div>

        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Full Name
            </label>

            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                value={
                  form.fullName
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    {
                      ...form,
                      fullName:
                        e
                          .target
                          .value,
                    }
                  )
                }
                className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Enter name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                value={
                  data.user
                    ?.email ||
                  ""
                }
                disabled
                className="w-full border rounded-xl py-3 pl-10 pr-4 bg-gray-100 text-gray-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Phone
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                value={
                  form.phone
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    {
                      ...form,
                      phone:
                        e
                          .target
                          .value,
                    }
                  )
                }
                className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Phone"
              />
            </div>
          </div>

          {/* Enrollment */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Enrollment No
            </label>

            <div className="relative">
              <GraduationCap
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                value={
                  form.enrollmentNo
                }
                disabled
                className="w-full border rounded-xl py-3 pl-10 pr-4 bg-gray-100 text-gray-500"
              />
            </div>
          </div>

        </div>

        {/* Button */}
        <div className="mt-8">

          <button
            onClick={
              handleUpdate
            }
            disabled={
              saving
            }
            className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${saving
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Update Profile"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Profile;