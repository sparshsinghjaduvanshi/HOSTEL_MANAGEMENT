import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  getStudentDetails
} from "../../services/admin.service";

export default function StudentDetailsAdmin() {

  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent =
    async () => {

      try {

        const res =
          await getStudentDetails(id);

        console.log(res.data);

        setStudent(
          res.data.data.student
        );

        setApplication(
          res.data.data.application
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!student) {

    return (
      <div className="p-6">
        Student not found
      </div>
    );
  }

  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h1 className="text-3xl font-bold text-gray-800">

          {
            student.userId?.fullName
          }

        </h1>

        <p className="text-gray-500 mt-2">

          {
            student.userId?.email
          }

        </p>

      </div>

      {/* DETAILS */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">

          Student Details

        </h2>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <p className="text-gray-500">
              Enrollment No.
            </p>

            <p className="font-medium">
              {student.enrollmentNo}
            </p>

          </div>

          <div>

            <p className="text-gray-500">
              Gender
            </p>

            <p className="font-medium">
              {student.gender}
            </p>

          </div>

          <div>

            <p className="text-gray-500">
              Hostel
            </p>

            <p className="font-medium">

              {
                application
                  ?.allottedHostel
                  ?.name || "N/A"
              }

            </p>

          </div>

          <div>

            <p className="text-gray-500">
              Room
            </p>

            <p className="font-medium">

              {
                application
                  ?.roomId
                  ?.roomNumber || "N/A"
              }

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}