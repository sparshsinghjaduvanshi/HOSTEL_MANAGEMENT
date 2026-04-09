import { useEffect, useState } from "react";
import { cancelRequest } from "../../services/student.service";
import {
    getMyRequests,
    respondToRequest
} from "../../services/student.service";

const MyRequests = () => {
    const [requests, setRequests] = useState([]);


    const handleCancel = async (id) => {
        try {
            await cancelRequest(id);
            alert("Request cancelled");
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await getMyRequests();

            console.log("API RESPONSE:", res.data); // 👈 DEBUG

            setRequests(
                res.data.requests || res.data.data || []
            );

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (id) => {
        await respondToRequest(id);
        fetchRequests();
    };

    return (
       <div className="space-y-6">
  <h2 className="text-2xl font-bold">My Requests</h2>

  {requests.length === 0 ? (
    <p className="text-gray-500">No requests found</p>
  ) : (
    requests.map((req) => (
      <div key={req._id} className="bg-white p-4 rounded shadow">
        
        <p><strong>Type:</strong> {req.type}</p>
        <p><strong>Reason:</strong> {req.reason}</p>

        <div className="flex gap-3 mt-3">

          {/* ✅ Accept Swap */}
          {req.type === "swap" && !req.targetApproved && (
            <button
              onClick={() => handleAccept(req._id)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Accept Swap
            </button>
          )}

          {/* 🔥 Cancel Request */}
          {req.status === "pending" && (
            <button
              onClick={() => {
                if (!window.confirm("Cancel this request?")) return;
                handleCancel(req._id);
              }}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Cancel
            </button>
          )}

        </div>

      </div>
    ))
  )}
</div>
    );
};

export default MyRequests;