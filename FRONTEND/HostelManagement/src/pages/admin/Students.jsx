import { useEffect, useState } from "react";
import { getAllStudents } from "../../services/admin.service.js";

const Students = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">
        Students Management
      </h2>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-3 bg-gray-100 text-gray-600 text-sm font-semibold p-4">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
        </div>

        {/* Data */}
        {students.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">
            No students found
          </p>
        ) : (
          <div className="divide-y">
            {students.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-3 p-4 items-center hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-800">
                  {s.userId?.fullName}
                </span>

                <span className="text-gray-600">
                  {s.userId?.email}
                </span>

                <span className="text-gray-500">
                  {s.phone}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default Students;