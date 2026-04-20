import { useEffect, useMemo, useState } from "react";
import ADMIN_API from "../../services/admin.service.js";
import { getHostels } from "../../services/hostel.service.js";
import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  UserCheck,
  X,
  Upload,
} from "lucide-react";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "Warden",
  assignedHostelId: "",
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Warden",
    assignedHostelId: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [staffRes, hostelRes] = await Promise.all([
        ADMIN_API.get("/staff"),
        getHostels(),
      ]);

      setStaff(staffRes.data.data || []);
      setHostels(hostelRes.data.data?.hostels || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = search.toLowerCase();

      const name = s.userId?.fullName?.toLowerCase() || "";
      const email = s.userId?.email?.toLowerCase() || "";
      const role = s.role?.toLowerCase() || "";

      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q)
      );
    });
  }, [staff, search]);

  const handleCreate = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.phone ||
      !form.assignedHostelId
    ) {
      return alert("Fill all fields");
    }

    try {
      await ADMIN_API.post("/staff", form);

      alert("Staff created");
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Remove staff?")) return;

    try {
      await ADMIN_API.delete(`/staff/${userId}`);
      alert("Staff removed");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (s) => {
    setEditingId(s._id);

    setEditForm({
      fullName: s.userId?.fullName || "",
      email: s.userId?.email || "",
      phone: s.phone || "",
      role: s.role || "Warden",
      assignedHostelId: s.assignedHostelId?._id || "",
    });

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await ADMIN_API.put(`/staff/${editingId}`, editForm);

      alert("Staff updated");
      setEditOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handlePhotoUpload = async (staffId, file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      await ADMIN_API.patch(
        `/staff/${staffId}/photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Photo updated");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Staff Management
          </h2>

          <p className="text-gray-500 mt-1">
            Create, edit and manage staff members.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Create */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          Add New Staff
        </h3>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) =>
              setForm({
                ...form,
                fullName: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          >
            <option>Warden</option>
            <option>CareTaker</option>
            <option>Cleaner</option>
            <option>Electrician</option>
            <option>Carpenter</option>
          </select>

          <select
            value={form.assignedHostelId}
            onChange={(e) =>
              setForm({
                ...form,
                assignedHostelId: e.target.value,
              })
            }
            className="border rounded-xl px-4 py-3"
          >
            <option value="">Select Hostel</option>

            {hostels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>

        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          <Plus size={18} />
          Create Staff
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border rounded-xl px-4">
        <Search size={18} className="text-gray-400" />

        <input
          placeholder="Search staff..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full py-3 outline-none"
        />
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading...
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
          No staff found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredStaff.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
            >

              <div className="flex justify-between items-start">

                <div className="flex gap-3">

                  {s.photo ? (
                    <img
                      src={s.photo}
                      alt="staff"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <UserCheck
                        size={18}
                        className="text-indigo-600"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">
                      {s.userId?.fullName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {s.userId?.email}
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p><b>Role:</b> {s.role}</p>
                <p><b>Phone:</b> {s.phone}</p>
                <p>
                  <b>Hostel:</b>{" "}
                  {s.assignedHostelId?.name || "--"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <button
                  onClick={() => openEdit(s)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(s.userId?._id)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Remove
                </button>

                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                  <Upload size={16} />
                  Photo

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePhotoUpload(
                        s._id,
                        e.target.files?.[0]
                      )
                    }
                  />
                </label>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">

            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Edit Staff
              </h3>

              <button
                onClick={() => setEditOpen(false)}
              >
                <X />
              </button>
            </div>

            <div className="grid gap-4">

              <input
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    fullName: e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-3"
                placeholder="Full Name"
              />

              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    email: e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-3"
                placeholder="Email"
              />

              <input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone: e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-3"
                placeholder="Phone"
              />

              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-3"
              >
                <option>Warden</option>
                <option>CareTaker</option>
                <option>Cleaner</option>
                <option>Electrician</option>
                <option>Carpenter</option>
              </select>

              <select
                value={editForm.assignedHostelId}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    assignedHostelId:
                      e.target.value,
                  })
                }
                className="border rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Hostel
                </option>

                {hostels.map((h) => (
                  <option
                    key={h._id}
                    value={h._id}
                  >
                    {h.name}
                  </option>
                ))}
              </select>

            </div>

            <button
              onClick={handleUpdate}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Save Changes
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default Staff;