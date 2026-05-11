// // import { useEffect, useState } from "react";

// // import {
// //   getHostelStudents
// // } from "../../services/staff.service";

// // export default function StaffStudents() {

// //   const [students, setStudents] =
// //     useState([]);

// //   const [loading, setLoading] =
// //     useState(true);

// //   const [error, setError] =
// //     useState("");

// //   const [search, setSearch] =
// //     useState("");

// //   const fetchStudents = async () => {

// //     try {

// //       setLoading(true);

// //       const res =
// //         await getHostelStudents();

// //       setStudents(
// //         res.data.students || []
// //       );

// //     } catch (err) {

// //       console.error(err);

// //       setError(
// //         err.response?.data?.message ||
// //         "Failed to fetch students"
// //       );

// //     } finally {

// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchStudents();
// //   }, []);

// //   const filteredStudents = students.filter((item) => {

// //     const name =
// //       item.studentId?.userId?.fullName || "";

// //     return name
// //       .toLowerCase()
// //       .includes(search.toLowerCase());
// //   });

// //   if (loading) {
// //     return (
// //       <div className="p-6">
// //         Loading students...
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-6 text-red-500">
// //         {error}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">

// //       {/* Header */}
// //       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

// //         <div>
// //           <h1 className="text-3xl font-bold text-gray-800">
// //             Hostel Students
// //           </h1>

// //           <p className="text-gray-500 mt-1">
// //             View and manage students assigned to your hostel.
// //           </p>
// //         </div>

// //         {/* Search */}
// //         <div>
// //           <input
// //             type="text"
// //             placeholder="Search student..."
// //             value={search}
// //             onChange={(e) =>
// //               setSearch(e.target.value)
// //             }
// //           />
// //         </div>

// //       </div>

      
// //       {/* Stats */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

// //         {/* Total Students */}
// //         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
// //           <p className="text-sm text-gray-500">
// //             Total Students
// //           </p>

// //           <h2 className="text-3xl font-bold text-gray-800 mt-2">
// //             {students.length}
// //           </h2>
// //         </div>

// //         {/* Male Students */}
// //         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
// //           <p className="text-sm text-gray-500">
// //             Male Students
// //           </p>

// //           <h2 className="text-3xl font-bold text-blue-600 mt-2">
// //             {
// //               students.filter(
// //                 (s) =>
// //                   s.studentId?.gender === "male"
// //               ).length
// //             }
// //           </h2>
// //         </div>

// //         {/* Female Students */}
// //         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
// //           <p className="text-sm text-gray-500">
// //             Female Students
// //           </p>

// //           <h2 className="text-3xl font-bold text-pink-600 mt-2">
// //             {
// //               students.filter(
// //                 (s) =>
// //                   s.studentId?.gender === "female"
// //               ).length
// //             }
// //           </h2>
// //         </div>

// //       </div>

// //       {/* Students Table */}
// //       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

// //         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
// //           <h2 className="text-xl font-semibold text-gray-800">
// //             Students List
// //           </h2>

// //           <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm">
// //             Export
// //           </button>
// //         </div>

// //         <div className="overflow-x-auto">
// //           <table className="w-full text-left">

// //             <thead className="bg-gray-50 border-b border-gray-200">
// //               <tr>
// //                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
// //                   Student
// //                 </th>

// //                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
// //                   Room
// //                 </th>

// //                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
// //                   Enrollment No.
// //                 </th>


// //                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
// //                   Gender
// //                 </th>

// //                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>

// //             <tbody>

// //               {filteredStudents.map((student) => (
// //                 <tr
// //                   key={student._id}
// //                   className="border-b border-gray-100 hover:bg-gray-50 transition-all"
// //                 >

// //                   {/* Student */}
// //                   <td className="px-6 py-4">
// //                     <div>
// //                       <h3 className="font-semibold text-gray-800">
// //                         {student.studentId?.userId?.fullName}
// //                       </h3>

// //                       <p className="text-sm text-gray-500 mt-1">
// //                         {student.studentId?.userId?.email}
// //                       </p>
// //                     </div>
// //                   </td>

// //                   {/* Room */}
// //                   <td className="px-6 py-4 text-gray-700 font-medium">
// //                     {student.roomId?.roomNumber || "N/A"}
// //                   </td>

// //                   {/* enrollment no. */}
// //                   <td className="px-6 py-4 text-gray-700">
// //                     {student.studentId?.enrollmentNo}
// //                   </td>

// //                   {/* gender */}
// //                   <td className="px-6 py-4 text-gray-700">
// //                     {student.studentId?.gender}
// //                   </td>

// //                   {/* Status */}


// //                   {/* Actions */}
// //                   <td className="px-6 py-4">
// //                     <div className="flex gap-2">

// //                       <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-all">
// //                         View
// //                       </button>

// //                       <button className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-all">
// //                         Contact
// //                       </button>

// //                     </div>
// //                   </td>

// //                 </tr>
// //               ))}

// //             </tbody>

// //           </table>
// //         </div>

// //       </div>

// //     </div>
// //   );
// // }


// import { useEffect, useState } from "react";

// import { useNavigate } from "react-router-dom";

// import {
//   getHostelStudents
// } from "../../services/staff.service";

// export default function StaffStudents() {

//   const navigate = useNavigate();

//   const [students, setStudents] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [search, setSearch] =
//     useState("");

//   const fetchStudents = async () => {

//     try {

//       setLoading(true);

//       const res =
//         await getHostelStudents();

//       setStudents(
//         res.data.students || []
//       );

//     } catch (err) {

//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//         "Failed to fetch students"
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   useEffect(() => {

//     fetchStudents();

//   }, []);

//   // ================= FILTER =================

//   const filteredStudents =
//     students.filter((item) => {

//       const name =
//         item.studentId?.userId?.fullName || "";

//       return name
//         .toLowerCase()
//         .includes(search.toLowerCase());
//     });

//   // ================= LOADING =================

//   if (loading) {

//     return (
//       <div className="p-6">
//         Loading students...
//       </div>
//     );
//   }

//   // ================= ERROR =================

//   if (error) {

//     return (
//       <div className="p-6 text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (

//     <div className="space-y-6">

//       {/* HEADER */}

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//         <div>

//           <h1 className="text-3xl font-bold text-gray-800">
//             Hostel Students
//           </h1>

//           <p className="text-gray-500 mt-1">
//             View and manage students assigned to your hostel.
//           </p>

//         </div>

//         {/* SEARCH */}

//         <input
//           type="text"
//           placeholder="Search student..."
//           value={search}
//           onChange={(e) =>
//             setSearch(e.target.value)
//           }
//           className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//         />

//       </div>

//       {/* STATS */}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

//         {/* TOTAL */}

//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

//           <p className="text-sm text-gray-500">
//             Total Students
//           </p>

//           <h2 className="text-3xl font-bold text-gray-800 mt-2">
//             {students.length}
//           </h2>

//         </div>

//         {/* MALE */}

//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

//           <p className="text-sm text-gray-500">
//             Male Students
//           </p>

//           <h2 className="text-3xl font-bold text-blue-600 mt-2">

//             {
//               students.filter(

//                 (s) =>

//                   s.studentId?.gender
//                     ?.toLowerCase() === "male"

//               ).length
//             }

//           </h2>

//         </div>

//         {/* FEMALE */}

//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

//           <p className="text-sm text-gray-500">
//             Female Students
//           </p>

//           <h2 className="text-3xl font-bold text-pink-600 mt-2">

//             {
//               students.filter(

//                 (s) =>

//                   s.studentId?.gender
//                     ?.toLowerCase() === "female"

//               ).length
//             }

//           </h2>

//         </div>

//       </div>

//       {/* TABLE */}

//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

//         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

//           <h2 className="text-xl font-semibold text-gray-800">
//             Students List
//           </h2>

//           <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm">

//             Export

//           </button>

//         </div>

//         <div className="overflow-x-auto">

//           <table className="w-full text-left">

//             <thead className="bg-gray-50 border-b border-gray-200">

//               <tr>

//                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
//                   Student
//                 </th>

//                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
//                   Room
//                 </th>

//                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
//                   Enrollment No.
//                 </th>

//                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
//                   Gender
//                 </th>

//                 <th className="px-6 py-3 text-sm font-semibold text-gray-600">
//                   Actions
//                 </th>

//               </tr>

//             </thead>

//             <tbody>

//               {
//                 filteredStudents.length === 0 ? (

//                   <tr>

//                     <td
//                       colSpan="5"
//                       className="text-center py-10 text-gray-500"
//                     >

//                       No students found

//                     </td>

//                   </tr>

//                 ) : (

//                   filteredStudents.map((student) => (

//                     <tr
//                       key={student._id}
//                       className="border-b border-gray-100 hover:bg-gray-50 transition-all"
//                     >

//                       {/* STUDENT */}

//                       <td className="px-6 py-4">

//                         <div>

//                           <h3 className="font-semibold text-gray-800">

//                             {
//                               student.studentId
//                                 ?.userId?.fullName
//                             }

//                           </h3>

//                           <p className="text-sm text-gray-500 mt-1">

//                             {
//                               student.studentId
//                                 ?.userId?.email
//                             }

//                           </p>

//                         </div>

//                       </td>

//                       {/* ROOM */}

//                       <td className="px-6 py-4 text-gray-700 font-medium">

//                         {
//                           student.roomId
//                             ?.roomNumber || "N/A"
//                         }

//                       </td>

//                       {/* ENROLLMENT */}

//                       <td className="px-6 py-4 text-gray-700">

//                         {
//                           student.studentId
//                             ?.enrollmentNo
//                         }

//                       </td>

//                       {/* GENDER */}

//                       <td className="px-6 py-4 text-gray-700">

//                         {
//                           student.studentId
//                             ?.gender
//                         }

//                       </td>

//                       {/* ACTIONS */}

//                       <td className="px-6 py-4">

//                         <div className="flex gap-2">

//                           <button

//                             onClick={() =>
//                               navigate(
//                                 `/staff/students/${student.studentId?._id}`
//                               )
//                             }

//                             className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-all"
//                           >

//                             View

//                           </button>

//                           <button
//                             className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-all"
//                           >

//                             Contact

//                           </button>

//                         </div>

//                       </td>

//                     </tr>

//                   ))
//                 )
//               }

//             </tbody>

//           </table>

//         </div>

//       </div>

//     </div>
//   );
// }


import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  getHostelStudents
} from "../../services/staff.service";

export default function StaffStudents() {

  const navigate = useNavigate();

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ================= FETCH STUDENTS =================

  const fetchStudents = async () => {

    try {

      setLoading(true);

      const res =
        await getHostelStudents();

      console.log(
        "STUDENTS:",
        res.data.students
      );

      setStudents(
        res.data.students || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to fetch students"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchStudents();

  }, []);

  // ================= FILTER =================

  const filteredStudents =
    students.filter((item) => {

      const name =
        item.studentId?.userId
          ?.fullName || "";

      return name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    });

  // ================= LOADING =================

  if (loading) {

    return (
      <div className="p-6">
        Loading students...
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {

    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (

    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Hostel Students
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage students assigned to your hostel.
          </p>

        </div>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* TOTAL */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <p className="text-sm text-gray-500">
            Total Students
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {students.length}
          </h2>

        </div>

        {/* MALE */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <p className="text-sm text-gray-500">
            Male Students
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">

            {
              students.filter(

                (s) =>

                  s.studentId?.gender
                    ?.toLowerCase() ===
                  "male"

              ).length
            }

          </h2>

        </div>

        {/* FEMALE */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <p className="text-sm text-gray-500">
            Female Students
          </p>

          <h2 className="text-3xl font-bold text-pink-600 mt-2">

            {
              students.filter(

                (s) =>

                  s.studentId?.gender
                    ?.toLowerCase() ===
                  "female"

              ).length
            }

          </h2>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

          <h2 className="text-xl font-semibold text-gray-800">
            Students List
          </h2>

          <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm">

            Export

          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            {/* ================= HEAD ================= */}

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Student
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Room
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Enrollment No.
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Gender
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Actions
                </th>

              </tr>

            </thead>

            {/* ================= BODY ================= */}

            <tbody>

              {
                filteredStudents.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-500"
                    >

                      No students found

                    </td>

                  </tr>

                ) : (

                  filteredStudents.map((student) => (

                    <tr
                      key={student._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >

                      {/* STUDENT */}

                      <td className="px-6 py-4">

                        <div>

                          <h3 className="font-semibold text-gray-800">

                            {
                              student.studentId
                                ?.userId
                                ?.fullName
                            }

                          </h3>

                          <p className="text-sm text-gray-500 mt-1">

                            {
                              student.studentId
                                ?.userId
                                ?.email
                            }

                          </p>

                        </div>

                      </td>

                      {/* ROOM */}

                      <td className="px-6 py-4 text-gray-700 font-medium">

                        {
                          student.roomId
                            ?.roomNumber || "N/A"
                        }

                      </td>

                      {/* ENROLLMENT */}

                      <td className="px-6 py-4 text-gray-700">

                        {
                          student.studentId
                            ?.enrollmentNo
                        }

                      </td>

                      {/* GENDER */}

                      <td className="px-6 py-4 text-gray-700">

                        {
                          student.studentId
                            ?.gender
                        }

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex gap-2">

                          {/* VIEW */}

                          <button

                            onClick={() => {

                              console.log(
                                "CLICKED ID:",
                                student.studentId?._id
                              );

                              navigate(
                                `/staff/students/${student.studentId?._id}`
                              );
                            }}

                            className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-all"
                          >

                            View

                          </button>

                          {/* CONTACT */}

                          <button
                            className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-all"
                          >

                            Contact

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))
                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}