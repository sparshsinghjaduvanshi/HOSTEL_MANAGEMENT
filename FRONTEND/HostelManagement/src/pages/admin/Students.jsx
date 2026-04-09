import { useEffect, useState } from "react";
import { getAllStudents } from "../../services/admin.service";

const Students = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();

      console.log("API RESPONSE:", res.data); // 🔥 DEBUG

      setStudents(res.data.data || []); // ✅ FIX

    } catch (err) {
      console.log(err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Students</h2>

      {students.length === 0 ? (
        <p className="text-gray-500">No students found</p>
      ) : (
        students.map((s) => (
          <div key={s._id} className="bg-white p-4 rounded shadow mb-3">
            <p><strong>Name:</strong> {s.userId?.fullName}</p>  {/* ✅ FIX */}
            <p><strong>Email:</strong> {s.userId?.email}</p>    {/* ✅ FIX */}
            <p><strong>Phone:</strong> {s.phone}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Students;