import { useEffect, useState } from "react";
import { getMyRequests, cancelRequest } from "../../services/student.service";

const MyRequests = () => {
  const [data, setData] = useState([]);

  const fetch = async () => {
    const res = await getMyRequests();
    setData(res.data.data || []);
  };

  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    await cancelRequest(id);
    fetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Requests</h2>

      {data.map(r => (
        <div key={r._id} className="bg-white p-4 rounded shadow">
          <p>{r.reason}</p>
          <p>Status: {r.status}</p>

          {r.status === "pending" && (
            <button onClick={() => cancel(r._id)}
              className="text-red-500">
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyRequests;