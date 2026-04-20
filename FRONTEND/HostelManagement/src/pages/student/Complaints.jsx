import { useEffect, useState } from "react";
import {
  createComplaint,
  getComplaints,
  deleteComplaint,
} from "../../services/complaint.service.js";

import {
  Wrench,
  Send,
  Trash2,
  Clock3,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const Complaints = () => {
  const [form, setForm] =
    useState({
      title: "",
      description: "",
      category: "",
    });

  const [list, setList] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  /* ---------------------- */
  /* FETCH                  */
  /* ---------------------- */

  const fetchComplaints =
    async () => {
      try {
        setFetching(true);

        const res =
          await getComplaints();

        setList(
          res.data.data ||
            []
        );
      } catch (err) {
        console.log(err);
        setList([]);
      } finally {
        setFetching(false);
      }
    };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /* ---------------------- */
  /* SUBMIT                 */
  /* ---------------------- */

  const submit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.category
    ) {
      return alert(
        "All fields required"
      );
    }

    try {
      setLoading(true);

      await createComplaint(
        form
      );

      alert(
        "Complaint submitted!"
      );

      setForm({
        title: "",
        description:
          "",
        category: "",
      });

      fetchComplaints();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- */
  /* DELETE                 */
  /* ---------------------- */

  const handleDelete =
    async (id) => {
      if (
        !window.confirm(
          "Delete this complaint?"
        )
      )
        return;

      try {
        await deleteComplaint(
          id
        );

        alert(
          "Deleted successfully"
        );

        fetchComplaints();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Delete failed"
        );
      }
    };

  /* ---------------------- */
  /* HELPERS                */
  /* ---------------------- */

  const getStatusBadge =
    (status) => {
      if (
        status ===
        "resolved"
      ) {
        return "bg-green-100 text-green-700";
      }

      if (
        status ===
        "in_progress"
      ) {
        return "bg-blue-100 text-blue-700";
      }

      return "bg-yellow-100 text-yellow-700";
    };

  const getStatusIcon =
    (status) => {
      if (
        status ===
        "resolved"
      )
        return (
          <CheckCircle
            size={16}
          />
        );

      if (
        status ===
        "in_progress"
      )
        return (
          <RefreshCw
            size={16}
          />
        );

      return (
        <Clock3
          size={16}
        />
      );
    };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Complaints
        </h2>

        <p className="text-gray-500 mt-1">
          Raise issues related
          to hostel facilities
          and track progress.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Complaints
          </p>

          <p className="text-2xl font-bold mt-1">
            {list.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {
              list.filter(
                (i) =>
                  i.status ===
                  "pending"
              ).length
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="text-2xl font-bold mt-1 text-green-600">
            {
              list.filter(
                (i) =>
                  i.status ===
                  "resolved"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Complaint Form */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" />

          <h3 className="text-xl font-semibold">
            Raise New Complaint
          </h3>
        </div>

        <input
          type="text"
          placeholder="Title (Fan not working)"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />

        <select
          value={
            form.category
          }
          onChange={(e) =>
            setForm({
              ...form,
              category:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="">
            Select Category
          </option>

          <option value="electrical">
            Electrical
          </option>

          <option value="cleaning">
            Cleaning
          </option>

          <option value="carpentry">
            Carpentry
          </option>

          <option value="general">
            General
          </option>
        </select>

        <textarea
          placeholder="Describe your issue..."
          value={
            form.description
          }
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 h-32 resize-none"
        />

        <button
          onClick={submit}
          disabled={
            loading
          }
          className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <Send size={18} />

          {loading
            ? "Submitting..."
            : "Submit Complaint"}
        </button>

      </div>

      {/* Complaint List */}
      <div className="space-y-5">

        <h3 className="text-xl font-semibold text-gray-800">
          My Complaints
        </h3>

        {fetching ? (
          <p className="text-gray-500">
            Loading complaints...
          </p>
        ) : list.length ===
          0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
            No complaints yet
          </div>
        ) : (
          list.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow p-5 space-y-4"
            >

              {/* Top */}
              <div className="flex justify-between items-start gap-4">

                <div>
                  <div className="flex items-center gap-2">

                    <Wrench
                      size={18}
                      className="text-indigo-500"
                    />

                    <h4 className="text-lg font-semibold">
                      {c.title}
                    </h4>

                  </div>

                  <p className="text-sm text-gray-500 capitalize mt-1">
                    {c.category}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(
                    c.status
                  )}`}
                >
                  {getStatusIcon(
                    c.status
                  )}

                  {c.status}
                </span>

              </div>

              {/* Desc */}
              <p className="text-gray-700">
                {c.description}
              </p>

              {/* Bottom */}
              <div className="flex justify-between items-center">

                <p className="text-xs text-gray-400">
                  {new Date(
                    c.createdAt
                  ).toLocaleString()}
                </p>

                {c.status ===
                  "pending" && (
                  <button
                    onClick={() =>
                      handleDelete(
                        c._id
                      )
                    }
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                  >
                    <Trash2
                      size={15}
                    />
                    Delete
                  </button>
                )}

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Complaints;