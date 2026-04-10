import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../../services/notification.service";

const Notifications = () => {
  const [data, setData] = useState([]);

  const fetch = async () => {
    const res = await getNotifications();
    setData(res.data.notifications || []);
  };

  useEffect(() => { fetch(); }, []);

  const mark = async (id) => {
    await markAsRead(id);
    fetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {data.map(n => (
        <div key={n._id} className="bg-white p-4 rounded shadow">
          <p>{n.title}</p>
          <p>{n.message}</p>

          {!n.isRead && (
            <button onClick={() => mark(n._id)} className="text-blue-500">
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;