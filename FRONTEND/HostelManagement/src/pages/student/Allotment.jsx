// import { useEffect, useState } from "react";
// import {
//   startAllotment,
//   reAllotWaitlisted,
//   getAllottedStudents,
//   runAllotment,
//   toggleApplicationWindow
// } from "../../services/admin.service.js";
// import ADMIN_API from "../../services/admin.service.js";

// const Allotment = () => {
//   const [cycle, setCycle] = useState(null);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🔥 Fetch active cycle
//   const fetchCycle = async () => {
//     try {
//       const res = await ADMIN_API.get("/cycle/active");
//       setCycle(res.data.data || null);
//     } catch (err) {
//       console.log(err);
//       setCycle(null);
//     }
//   };

//   // 🔥 Fetch allotted students
//   const fetchAllotted = async () => {
//     try {
//       const res = await getAllottedStudents();
//       setData(res.data.applications || []);
//     } catch (err) {
//       console.log(err);
//       setData([]);
//     }
//   };

//   useEffect(() => {
//     fetchCycle();
//     fetchAllotted();
//   }, []);

//   // 🔥 START CYCLE
//   const handleStart = async () => {
//     if (loading) return;


//     try {
//       setLoading(true);
//       await startAllotment();

//       alert("Cycle started! Applications are now open.");
//       await fetchCycle(); // 🔥 MUST REFRESH
//     } catch (err) {
//       alert(err.response?.data?.message || "Error starting cycle");
//     } finally {
//       setLoading(false)
//     }


//   };

//   // 🔥 TOGGLE APPLICATION WINDOW
//   const handleToggleApplications = async () => {
//     if (!cycle || loading) return;


//     try {
//       setLoading(true);
//       await toggleApplicationWindow();
//       await fetchCycle();
//     } catch (err) {
//       alert("Error toggling application window");
//     } finally {
//       setLoading(false);
//     }

//   };

//   // 🔥 RUN ALLOTMENT
//   const handleRunAllotment = async () => {
//     if (!cycle || cycle.applicationOpen || loading) {
//       return alert("Close applications before running allotment");
//     }


//     try {
//       setLoading(true);
//       await runAllotment();

//       alert("Allotment completed!");
//       await fetchCycle();
//       await fetchAllotted();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error running allotment");
//     } finally {
//       setLoading(false);
//     }


//   };

//   // 🔥 REALLOT
//   const handleReallot = async () => {
//     if (!cycle || loading) return;


//     if (cycle.reAllotmentOpen) {
//       return alert("Re-allotment already active");
//     }

//     try {
//       setLoading(true);
//       await reAllotWaitlisted();

//       alert("Re-allotment started!");
//       await fetchCycle();
//       await fetchAllotted();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error in re-allotment");
//     } finally {
//       setLoading(false);
//     }


//   };

//   return (<div className="space-y-6">


//     <h2 className="text-2xl font-bold">Allotment Panel</h2>

//     {/* 🔥 STATUS */}
//     <div className="bg-blue-100 p-4 rounded">
//       <p><strong>Status:</strong> {cycle?.status || "No active cycle"}</p>

//       <p>
//         <strong>Applications:</strong>{" "}
//         {cycle?.applicationOpen ? "Open" : "Closed"}
//       </p>

//       {cycle?.reAllotmentOpen && (
//         <p className="text-green-700 font-semibold">
//           Re-Allot Active till:{" "}
//           {new Date(cycle.reAllotmentEndDate).toLocaleString()}
//         </p>
//       )}
//     </div>

//     {/* 🔥 ACTION BUTTONS */}
//     <div className="flex flex-wrap gap-4">

//       {/* START */}
//       <button
//         disabled={loading || cycle?.status === "open"}
//         onClick={handleStart}
//         className={`px-4 py-2 rounded text-white ${loading || cycle?.status === "open"
//           ? "bg-gray-400"
//           : "bg-green-600"
//           }`}
//       >
//         {loading ? "Processing..." : "Start Cycle"}
//       </button>

//       {/* TOGGLE APPLICATION */}
//       <button
//         disabled={!cycle || loading}
//         onClick={handleToggleApplications}
//         className={`px-4 py-2 rounded text-white ${cycle?.applicationOpen ? "bg-red-600" : "bg-blue-600"
//           }`}
//       >
//         {cycle?.applicationOpen ? "Close Applications" : "Open Applications"}
//       </button>

//       {/* RUN ALLOTMENT */}
//       <button
//         disabled={!cycle || cycle?.applicationOpen || loading}
//         onClick={handleRunAllotment}
//         className={`px-4 py-2 rounded text-white ${!cycle || cycle?.applicationOpen
//           ? "bg-gray-400"
//           : "bg-purple-600"
//           }`}
//       >
//         Run Allotment
//       </button>

//       {/* REALLOT */}
//       <button
//         disabled={!cycle || cycle?.reAllotmentOpen || loading}
//         onClick={handleReallot}
//         className={`px-4 py-2 rounded text-white ${cycle?.reAllotmentOpen
//           ? "bg-gray-400"
//           : "bg-yellow-600"
//           }`}
//       >
//         Re-Allot Waitlist
//       </button>

//     </div>

//     {/* 🔥 ALLOTTED STUDENTS */}
//     <div className="bg-white p-6 rounded shadow">
//       <h3 className="font-semibold mb-4">Allotted Students</h3>

//       {data.length === 0 ? (
//         <p>No allotments yet</p>
//       ) : (
//         data.map((app) => (
//           <div key={app._id} className="border-b pb-3 mb-3">
//             <p>
//               <strong>Student:</strong>{" "}
//               {app.studentId?.userId?.fullName}
//             </p>

//             <p>
//               <strong>Hostel:</strong>{" "}
//               {app.allottedHostel?.name}
//             </p>

//             <p>
//               <strong>Room:</strong>{" "}
//               {app.roomId?.roomNumber}
//             </p>
//           </div>
//         ))
//       )}
//     </div>

//   </div>


//   );
// };

// export default Allotment;



import { useEffect, useState } from "react";
import { getMyApplication } from "../../services/application.service";
import ADMIN_API from "../../services/admin.service";

const StudentAllotment = () => {
  const [cycle, setCycle] = useState(null);
  const [application, setApplication] = useState(null);

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get("/cycle/active");
      setCycle(res.data.data || null);
    } catch {
      setCycle(null);
    }
  };

  const fetchMyApplication = async () => {
    try {
      const res = await getMyApplication();
      setApplication(res.data.application || null);
    } catch {
      setApplication(null);
    }
  };

  useEffect(() => {
    fetchCycle();
    fetchMyApplication();
  }, []);

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">My Allotment</h2>

      {/* 🔥 CYCLE STATUS */}
      <div className="bg-blue-100 p-4 rounded">
        <p><strong>Cycle Status:</strong> {cycle?.status || "No active cycle"}</p>
        <p>
          <strong>Applications:</strong>{" "}
          {cycle?.applicationOpen ? "Open" : "Closed"}
        </p>
      </div>

      {/* 🔥 APPLICATION STATUS */}
      <div className="bg-white p-4 shadow rounded">

        {!application ? (
          <p>You have not applied yet.</p>
        ) : (
          <>
            <p>
              <strong>Status:</strong>{" "}
              {application.allocationStatus || "Pending"}
            </p>

            {application.isAllotted && (
              <>
                <p>
                  <strong>Hostel:</strong>{" "}
                  {application.allottedHostel?.name}
                </p>

                <p>
                  <strong>Room:</strong>{" "}
                  {application.roomId?.roomNumber}
                </p>
              </>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default StudentAllotment;