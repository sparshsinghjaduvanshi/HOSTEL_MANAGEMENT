import { useEffect, useState} from "react";
import {getMyComplaints, getRoomChangeRequests } from "../../services/staff.service.js";
import RequestsPage from "../../components/common/RequestsPage.jsx";

export default function StaffRequests() {

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

          getMyComplaints(),

          getRoomChangeRequests()
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
      title="Hostel Requests"
    />

  );
}