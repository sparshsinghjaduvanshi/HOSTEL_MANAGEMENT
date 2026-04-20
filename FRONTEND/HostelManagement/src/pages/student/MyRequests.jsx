import { useEffect, useState } from "react";
import {
  getMyRequests,
  cancelRequest,
} from "../../services/student.service";

import {
  RefreshCw,
  Clock3,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
} from "lucide-react";

const MyRequests = () => {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchRequests =
    async () => {
      try {
        setLoading(true);

        const res =
          await getMyRequests();

        setData(
          res.data.data || []
        );
      } catch (err) {
        console.log(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel =
    async (id) => {
      const ok =
        window.confirm(
          "Cancel this request?"
        );

      if (!ok) return;

      try {
        await cancelRequest(
          id
        );

        alert(
          "Request cancelled"
        );

        fetchRequests();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Failed to cancel"
        );
      }
    };

  const getStatusStyle = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "approved":
        return (
          <CheckCircle size={16} />
        );

      case "rejected":
      case "cancelled":
        return (
          <XCircle size={16} />
        );

      default:
        return (
          <Clock3 size={16} />
        );
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            My Requests
          </h2>

          <p className="text-gray-500 mt-1">
            View all room
            change / hostel
            related requests.
          </p>
        </div>

        <button
          onClick={
            fetchRequests
          }
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          Loading requests...
        </div>
      ) : data.length ===
        0 ? (
        /* Empty */
        <div className="bg-white rounded-2xl shadow p-10 text-center">

          <FileText
            size={42}
            className="mx-auto text-gray-300"
          />

          <p className="mt-4 text-lg font-semibold text-gray-700">
            No Requests Found
          </p>

          <p className="text-sm text-gray-500 mt-1">
            You haven't
            created any
            request yet.
          </p>

        </div>
      ) : (
        /* List */
        <div className="grid gap-5">

          {data.map(
            (r) => (
              <div
                key={
                  r._id
                }
                className="bg-white rounded-2xl shadow p-6 border border-gray-100"
              >

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  {/* Left */}
                  <div className="space-y-3 flex-1">

                    <div className="flex items-center gap-2">

                      <FileText
                        size={
                          18
                        }
                        className="text-indigo-600"
                      />

                      <h3 className="font-semibold text-lg text-gray-800">
                        Request
                      </h3>

                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Reason
                      </p>

                      <p className="text-gray-800 mt-1">
                        {r.reason ||
                          "No reason provided"}
                      </p>
                    </div>

                    {r.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Submitted
                        </p>

                        <p className="text-sm text-gray-700 mt-1">
                          {new Date(
                            r.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-start md:items-end gap-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusStyle(
                        r.status
                      )}`}
                    >
                      {getStatusIcon(
                        r.status
                      )}

                      {r.status ||
                        "pending"}
                    </span>

                    {r.status ===
                      "pending" && (
                      <button
                        onClick={() =>
                          handleCancel(
                            r._id
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                        Cancel
                      </button>
                    )}

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
};

export default MyRequests;