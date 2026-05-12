import { useEffect, useState } from "react";
import { getMyComplaints, updateComplaintStatus,} from "../../services/staff.service";

export default function StaffComplaints() {

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {

    try {

      setLoading(true);

      const res =
        await getMyComplaints();

      setComplaints(
        res.data.complaints || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to fetch complaints"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {

    try {

      await updateComplaintStatus(
        id,
        status
      );

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
              ...item,
              status,
            }
            : item
        )
      );

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Update failed"
      );
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = selectedStatus === "all"
    ? complaints
    : complaints.filter(
      (item) => item.status === selectedStatus
    );

  if (loading) {
    return (
      <div className="p-6">
        Loading complaints...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Complaints Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage and update assigned hostel complaints.
          </p>
        </div>

        {/* Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="work-done">Work Done</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

      </div>

      {/* Complaint Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {filteredComplaints.map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >

            {/* Top Section */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {complaint.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {complaint.description}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${complaint.status === "resolved"
                  ? "bg-green-100 text-green-700"
                  : complaint.status === "work-done"
                    ? "bg-blue-100 text-blue-700"
                    : complaint.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {complaint.status}
              </span>

            </div>

            {/* Details */}
            <div className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold">
                    Category
                  </p>

                  <p className="text-gray-700 font-medium mt-1">
                    {complaint.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold">
                    Room
                  </p>

                  <p className="text-gray-700 font-medium mt-1">
                    {complaint.roomId?.roomNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold">
                    Student
                  </p>

                  <p className="text-gray-700 font-medium mt-1">
                    {complaint.reportedBy?.userId?.fullName || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-semibold">
                    Date
                  </p>

                  <p className="text-gray-700 font-medium mt-1">
                    {complaint.createdAt}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">

                <button
                  onClick={() =>
                    handleStatusUpdate(
                      complaint._id,
                      "in-progress"
                    )
                  }> in-progress </button>

                <button
                  onClick={() =>
                    handleStatusUpdate(
                      complaint._id,
                      "work-done"
                    )
                  }
                >work-done
                </button>

                <button
                  onClick={() =>
                    handleStatusUpdate(
                      complaint._id,
                      "resolved"
                    )
                  }>
                  Resolve
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Empty State */}
      {filteredComplaints.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            No complaints found
          </h2>

          <p className="text-gray-500 mt-2">
            There are no complaints matching the selected filter.
          </p>
        </div>
      )}

    </div>
  );
}
