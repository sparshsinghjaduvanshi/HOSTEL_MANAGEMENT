export default function StaffApplications() {

  const applications = [
    {
      id: 1,
      student: "Rahul Sharma",
      course: "B.Tech CSE",
      year: "2nd Year",
      hostelPreference: "Hostel A",
      distance: "120 km",
      status: "pending",
    },
    {
      id: 2,
      student: "Ankit Verma",
      course: "MBA",
      year: "1st Year",
      hostelPreference: "Hostel B",
      distance: "340 km",
      status: "approved",
    },
    {
      id: 3,
      student: "Aman Gupta",
      course: "B.Sc Physics",
      year: "Final Year",
      hostelPreference: "Hostel C",
      distance: "50 km",
      status: "rejected",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hostel Applications
          </h1>

          <p className="text-gray-500 mt-1">
            Review and manage hostel applications.
          </p>
        </div>

        <button className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm">
          Export Applications
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Total Applications
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            150
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Approved
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            100
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h2 className="text-3xl font-bold text-yellow-500 mt-2">
            50
          </h2>
        </div>

      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Applications List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Student
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Course
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Year
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Preference
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Distance
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >

                  {/* Student */}
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {application.student}
                  </td>

                  {/* Course */}
                  <td className="px-6 py-4 text-gray-700">
                    {application.course}
                  </td>

                  {/* Year */}
                  <td className="px-6 py-4 text-gray-700">
                    {application.year}
                  </td>

                  {/* Preference */}
                  <td className="px-6 py-4 text-gray-700">
                    {application.hostelPreference}
                  </td>

                  {/* Distance */}
                  <td className="px-6 py-4 text-gray-700">
                    {application.distance}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        application.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : application.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">

                      <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-all">
                        View
                      </button>

                      <button className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-all">
                        Approve
                      </button>

                      <button className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-all">
                        Reject
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}
