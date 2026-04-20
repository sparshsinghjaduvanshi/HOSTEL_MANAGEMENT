import { useEffect, useState } from "react";
import { getMyApplication } from "../../services/application.service.js";
import ADMIN_API from "../../services/admin.service.js";

import {
  Building2,
  DoorOpen,
  CheckCircle,
  Clock3,
  AlertCircle,
  Home,
  Bed,
} from "lucide-react";

const StudentAllotment = () => {
  const [cycle, setCycle] =
    useState(null);

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchCycle = async () => {
    try {
      const res = await ADMIN_API.get(
        "/cycle/active"
      );

      setCycle(
        res.data.data || null
      );
    } catch {
      setCycle(null);
    }
  };

  const fetchMyApplication =
    async () => {
      try {
        const res =
          await getMyApplication();

        setApplication(
          res.data.data ||
            res.data.application ||
            res.data.data
              ?.application ||
            null
        );
      } catch {
        setApplication(null);
      }
    };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      await Promise.all([
        fetchCycle(),
        fetchMyApplication(),
      ]);

      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading allotment...
      </p>
    );
  }

  const status =
    application
      ?.allocationStatus ||
    application
      ?.wardenDecision
      ?.status ||
    "Pending";

  const isAllotted =
    application?.isAllotted;

  const getBadgeStyle = () => {
    if (isAllotted)
      return "bg-green-100 text-green-700";

    if (
      status
        .toLowerCase()
        .includes(
          "reject"
        )
    )
      return "bg-red-100 text-red-700";

    if (
      status
        .toLowerCase()
        .includes(
          "approve"
        )
    )
      return "bg-green-100 text-green-700";

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          My Allotment
        </h2>

        <p className="text-gray-500 mt-1">
          Check your hostel
          allotment and current
          application progress.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Cycle */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Cycle Status
              </p>

              <p className="text-lg font-bold mt-1">
                {cycle?.status ||
                  "No Active Cycle"}
              </p>
            </div>

            <Building2 className="text-indigo-500" />

          </div>

        </div>

        {/* Applications */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                Applications
              </p>

              <p className="text-lg font-bold mt-1">
                {cycle
                  ?.applicationOpen
                  ? "Open"
                  : "Closed"}
              </p>
            </div>

            <DoorOpen className="text-blue-500" />

          </div>

        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-gray-500">
                My Result
              </p>

              <p className="text-lg font-bold mt-1">
                {isAllotted
                  ? "Allotted"
                  : "Pending"}
              </p>
            </div>

            <CheckCircle className="text-green-500" />

          </div>

        </div>

      </div>

      {/* Main Box */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">

        {!application ? (
          <div className="text-center py-10">

            <AlertCircle className="mx-auto text-gray-400 mb-3" size={36} />

            <p className="text-gray-600 text-lg">
              You have not applied yet.
            </p>

          </div>
        ) : (
          <>
            {/* Status Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-gray-500 text-sm">
                  Application Status
                </p>

                <p className="text-xl font-bold mt-1 capitalize">
                  {status}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getBadgeStyle()}`}
              >
                {isAllotted
                  ? "Allotted"
                  : status}
              </span>

            </div>

            {/* Pending State */}
            {!isAllotted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex gap-3">

                <Clock3 className="text-yellow-600 mt-1" />

                <div>
                  <p className="font-semibold text-yellow-800">
                    Waiting for allotment
                  </p>

                  <p className="text-sm text-yellow-700 mt-1">
                    Your application is under review or waiting for allotment results.
                  </p>
                </div>

              </div>
            )}

            {/* Allotted */}
            {isAllotted && (
              <div className="grid md:grid-cols-2 gap-5">

                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">

                  <div className="flex gap-3 items-center">

                    <Home className="text-blue-600" />

                    <div>
                      <p className="text-sm text-gray-500">
                        Allotted Hostel
                      </p>

                      <p className="font-bold text-lg">
                        {application
                          ?.allottedHostel
                          ?.name ||
                          "N/A"}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="bg-green-50 rounded-2xl p-5 border border-green-200">

                  <div className="flex gap-3 items-center">

                    <Bed className="text-green-600" />

                    <div>
                      <p className="text-sm text-gray-500">
                        Room Number
                      </p>

                      <p className="font-bold text-lg">
                        {application
                          ?.roomId
                          ?.roomNumber ||
                          "--"}
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default StudentAllotment;