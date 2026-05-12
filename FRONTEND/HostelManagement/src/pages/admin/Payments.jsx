import { useEffect, useState} from "react";

import {getPendingPayments} from "../../services/payment.service.js";

export default function AdminPayments() {

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {

      try {

        const res =
          await getPendingPayments();

        setPayments(
          res.data.data || []
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
          Pending Payments
        </h1>

        <p className="text-gray-500 mt-1">
          Students with unpaid hostel fees.
        </p>

      </div>

      <div className="grid gap-4">

        {
          payments.map((fee) => (

            <div
              key={fee._id}
              className="
                bg-white
                rounded-2xl
                shadow
                p-6
                border
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                      text-lg
                      font-semibold
                    "
                  >
                    {
                      fee.allotmentId
                        ?.studentId
                        ?.userId
                        ?.fullName
                    }
                  </h2>

                  <p className="text-gray-500">
                    ₹{fee.amount}
                  </p>

                </div>

                <span
                  className="
                    px-4
                    py-1
                    bg-yellow-100
                    text-yellow-700
                    rounded-full
                    text-sm
                  "
                >
                  Pending
                </span>

              </div>

              <div className="mt-4">

                <p className="text-sm text-gray-500">

                  Due Date:
                  {" "}

                  {
                    new Date(
                      fee.dueDate
                    ).toLocaleDateString()
                  }

                </p>

              </div>

            </div>
          ))
        }

      </div>

    </div>
  );
}