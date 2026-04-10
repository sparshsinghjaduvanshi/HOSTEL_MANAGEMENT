import { useEffect, useState } from "react";
import {
  createComplaint,
  getComplaints,
  deleteComplaint
} from "../../services/complaint.service.js";

const Complaints = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: ""
  });

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  //  Fetch complaints
  const fetch = async () => {
    try {
      const res = await getComplaints();
      setList(res.data.data || []);
    } catch (err) {
      console.log(err);
      setList([]);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  //  Submit complaint
  const submit = async () => {
    try {
      if (!form.title || !form.description || !form.category) {
        return alert("All fields required");
      }

      setLoading(true);

      await createComplaint(form);

      alert("Complaint submitted!");

      setForm({
        title: "",
        description: "",
        category: ""
      });

      fetch();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete complaint
  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Delete this complaint?")) return;

      await deleteComplaint(id);

      alert("Deleted successfully");
      fetch();
    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* TITLE */}
      <h2 className="text-2xl font-bold">Complaints</h2>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl">

        {/* Title */}
        <input
          placeholder="Title (e.g. Fan not working)"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* Category */}
        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="carpentry">Carpentry</option>
          <option value="general">General</option>
        </select>

        {/* Description */}
        <textarea
          placeholder="Describe your issue..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full border p-2 rounded h-28 resize-none"
        />

        {/* Button */}
        <button
          onClick={submit}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading
              ? "bg-gray-400"
              : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-4">

        {list.length === 0 ? (
          <p className="text-gray-500">No complaints yet</p>
        ) : (
          list.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-start"
            >

              {/* LEFT */}
              <div>
                <p className="font-semibold text-lg">{c.title}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {c.category}
                </p>

                <p className="mt-2 text-gray-700">
                  {c.description}
                </p>

                <span className="text-xs mt-2 inline-block">
                  Status: {c.status}
                </span>
              </div>

              {/* RIGHT ACTION */}
              {c.status === "pending" && (
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              )}

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Complaints;