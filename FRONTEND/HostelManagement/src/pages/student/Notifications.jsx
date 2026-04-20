import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../../services/notification.service";

import {
  Bell,
  CheckCircle,
  RefreshCw,
  MailOpen,
  Clock3,
} from "lucide-react";

const Notifications = () => {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchNotifications =
    async () => {
      try {
        setLoading(true);

        const res =
          await getNotifications();

        setData(
          res.data.notifications ||
            res.data.data ||
            []
        );
      } catch (err) {
        console.log(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead =
    async (id) => {
      try {
        await markAsRead(id);

        fetchNotifications();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Failed to update"
        );
      }
    };

  const unreadCount =
    data.filter(
      (n) => !n.isRead
    ).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Notifications
          </h2>

          <p className="text-gray-500 mt-1">
            Stay updated with
            hostel alerts,
            approvals and
            messages.
          </p>
        </div>

        <button
          onClick={
            fetchNotifications
          }
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {data.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">
            Unread
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {unreadCount}
          </p>
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          Loading notifications...
        </div>
      ) : data.length ===
        0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center">

          <Bell
            size={44}
            className="mx-auto text-gray-300"
          />

          <p className="mt-4 text-lg font-semibold text-gray-700">
            No Notifications
          </p>

          <p className="text-sm text-gray-500 mt-1">
            You're all caught
            up.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {data.map((n) => (
            <div
              key={n._id}
              className={`rounded-2xl shadow p-5 border transition ${
                n.isRead
                  ? "bg-white border-gray-100"
                  : "bg-blue-50 border-blue-200"
              }`}
            >

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Left */}
                <div className="flex gap-4 flex-1">

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      n.isRead
                        ? "bg-gray-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {n.isRead ? (
                      <MailOpen
                        size={
                          18
                        }
                        className="text-gray-600"
                      />
                    ) : (
                      <Bell
                        size={
                          18
                        }
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  <div className="space-y-2">

                    <h3 className="font-semibold text-gray-800 text-lg">
                      {n.title ||
                        "Notification"}
                    </h3>

                    <p className="text-gray-600">
                      {n.message}
                    </p>

                    {n.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        <Clock3
                          size={
                            14
                          }
                        />

                        {new Date(
                          n.createdAt
                        ).toLocaleString()}
                      </div>
                    )}

                  </div>

                </div>

                {/* Right */}
                <div className="flex flex-col items-start md:items-end gap-3">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      n.isRead
                        ? "bg-gray-100 text-gray-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {n.isRead
                      ? "Read"
                      : "Unread"}
                  </span>

                  {!n.isRead && (
                    <button
                      onClick={() =>
                        handleMarkRead(
                          n._id
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      <CheckCircle
                        size={
                          16
                        }
                      />
                      Mark as Read
                    </button>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default Notifications;