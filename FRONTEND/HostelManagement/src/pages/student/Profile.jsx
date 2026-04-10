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
    const d = res.data.data;

    setData(d);
    setForm({
      fullName: d.user.fullName,
      phone: d.student.phone,
      enrollmentNo: d.student.enrollmentId
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    await updateProfile(form);
    alert("Updated!");
    fetchProfile();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })}
          className="input" placeholder="Name" />

        <input value={data.user.email} disabled className="input bg-gray-100" />

        <input value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="input" placeholder="Phone" />

        <button onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>

      </div>
    </div>
  );
};

export default Profile;