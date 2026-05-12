import {useEffect, useState} from "react";

import { getAllLogs} from "../../services/log.service.js";

export default function Logs() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {

      try {

        const res =
          await getAllLogs();

        setLogs(
          res.data.data.logs || []
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

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          System Logs
        </h1>

        <p className="text-gray-500 mt-1">
          All activity logs in system.
        </p>

      </div>

      <div className="space-y-4">

        {
          logs.map((log) => (

            <div
              key={log._id}
              className="
                bg-white
                rounded-2xl
                shadow
                border
                p-5
              "
            >

              <div
                className="
                  flex
                  justify-between
                  items-start
                "
              >

                <div>

                  <h2 className="font-semibold">

                    {log.action}

                  </h2>

                  <p className="text-gray-500 text-sm">

                    {
                      log.userId?.fullName
                    }

                  </p>

                </div>

                <span className="text-sm text-gray-400">

                  {
                    new Date(
                      log.createdAt
                    ).toLocaleString()
                  }

                </span>

              </div>

              <div className="mt-3">

                <p className="text-sm">

                  Target Table:
                  {" "}
                  {log.targetTable}

                </p>

                <p className="text-sm text-gray-500 mt-1">

                  {log.ipAddress}

                </p>

              </div>

            </div>
          ))
        }

      </div>

    </div>
  );
}