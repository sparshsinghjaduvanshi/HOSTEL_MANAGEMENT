import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../../services/notification.service";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">Notifications</h2>

      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className={`p-4 rounded-xl shadow border ${
              n.isRead ? "bg-white" : "bg-blue-50 border-blue-300"
            }`}
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-gray-600 text-sm">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleRead(n._id)}
                  className="text-blue-600 text-sm"
                >
                  Mark as read
                </button>
              )}

            </div>
          </div>
        ))
      )}

    </div>
  );
};

export default Notifications;