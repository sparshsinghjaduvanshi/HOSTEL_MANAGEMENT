import {useEffect, useState} from "react";
import {getAllComplaints, getAllRoomChanges} from "../../services/admin.service.js";
import RequestsPage from "../../components/common/RequestsPage.jsx";

export default function AdminRequests() {

  const [complaints, setComplaints] = useState([]);
  const [roomChanges, setRoomChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

      try {

        const [
          complaintsRes,
          roomRes
        ] = await Promise.all([

          getAllComplaints(),

          getAllRoomChanges()
        ]);

        setComplaints(
          complaintsRes.data.data || []
        );

        setRoomChanges(
          roomRes.data.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div>Loading...</div>
    );
  }

  return (

    <RequestsPage
      complaints={complaints}
      roomChanges={roomChanges}
      title="Admin Requests"
    />

  );
}