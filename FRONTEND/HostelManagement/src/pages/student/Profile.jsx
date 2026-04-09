import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../services/student.service";

const Profile = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    enrollmentNo: ""
  });

  const fetchProfile = async () => {
    const res = await getProfile();
    setData(res.data.data);

    setForm({
      fullName: res.data.data.user.fullName,
      phone: res.data.data.student.phone,
      enrollmentNo: res.data.data.student.enrollmentId
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateProfile(form);
      alert("Updated!");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
          className="input"
        />

        <input
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="input"
        />

        <input
          value={form.enrollmentNo}
          onChange={(e) =>
            setForm({ ...form, enrollmentNo: e.target.value })
          }
          className="input"
        />

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>

      </div>
    </div>
  );
};

export default Profile;