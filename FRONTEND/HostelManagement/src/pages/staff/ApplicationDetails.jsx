import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import API from "../../api/axios.js";

export default function ApplicationDetails() {

  const { id } = useParams();

  const [application, setApplication] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchDetails =
    async () => {

      try {

        const res =
          await API.get(

            `/applications/warden/details/${id}`
          );

        setApplication(
          res.data.application
        );

        setDocuments(
          res.data.documents
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
  };

  useEffect(() => {

    fetchDetails();

  }, []);

  if (loading) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!application) {

    return (
      <div className="p-6">
        Application not found
      </div>
    );
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          Application Details
        </h1>

        <p className="text-gray-500 mt-1">
          Review student profile and documents.
        </p>

      </div>

      {/* STUDENT INFO */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Student Information
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-gray-500">
              Full Name
            </p>

            <p className="font-semibold">
              {
                application.studentId
                  ?.userId?.fullName
              }
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Email
            </p>

            <p className="font-semibold">
              {
                application.studentId
                  ?.userId?.email
              }
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Gender
            </p>

            <p className="font-semibold">
              {
                application.studentId
                  ?.gender
              }
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Distance
            </p>

            <p className="font-semibold">
              {
                application.distance
              } km
            </p>
          </div>

        </div>

      </div>

      {/* APPLICATION INFO */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Application Information
        </h2>

        <div className="space-y-4">

          <div>

            <p className="text-gray-500">
              Priority Score
            </p>

            <p className="font-semibold">
              {
                application.priorityScore
              }
            </p>

          </div>

          <div>

            <p className="text-gray-500">
              Status
            </p>

            <p className="font-semibold capitalize">
              {
                application
                  .wardenDecision
                  ?.status
              }
            </p>

          </div>

          <div>

            <p className="text-gray-500 mb-2">
              Hostel Preferences
            </p>

            <div className="flex gap-2 flex-wrap">

              {
                application.preferences
                  ?.map((hostel) => (

                    <span
                      key={hostel._id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {hostel.name}
                    </span>
                ))
              }

            </div>

          </div>

        </div>

      </div>

      {/* DOCUMENTS */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Uploaded Documents
        </h2>

        <div className="space-y-4">

          {
            documents.map((doc) => (

              <div
                key={doc._id}
                className="flex items-center justify-between border rounded-xl p-4"
              >

                <div>

                  <p className="font-semibold capitalize">
                    {
                      doc.type
                        ?.replace("_", " ")
                    }
                  </p>

                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  View Document
                </a>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}