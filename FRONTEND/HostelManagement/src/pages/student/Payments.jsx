import { useEffect, useState } from "react";
import { CreditCard, Calendar, Building2, BedDouble } from "lucide-react";
import { getMyPayment, createOrder } from "../../services/payment.service.js";

const Payments = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const fetchPayment = async () => {

    try {

      const res =
        await getMyPayment();

      setData(
        res.data.data
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  const handleUpload = async (e) => {

    e.preventDefault();

    try {

      const formData =
        new FormData();

      formData.append(
        "receipt",
        receipt
      );

      formData.append(
        "transactionId",
        transactionId
      );

      await uploadReceipt(
        formData
      );

      alert(
        "Receipt uploaded successfully"
      );

      fetchPayment();

    } catch (err) {

      console.log(err);

      alert(
        "Upload failed"
      );
    }
  };

  const handlePayment = async () => {

    try {

      const res =
        await createOrder();

      const order =
        res.data.data;

      const options = {

        key: "rzp_test_SndacNFJ9Uu06m",

        amount:
          order.amount,

        currency:
          order.currency,

        name:
          "Hostel Management System",

        description:
          "Hostel Fee Payment",

        order_id:
          order.id,

        handler:
          async function (
            response
          ) {

            console.log(
              "PAYMENT SUCCESS:",
              response
            );

            alert(
              "Payment Successful"
            );

            fetchPayment();
          },

        modal: {

          ondismiss: function () {

            console.log(
              "Checkout closed"
            );
          }
        },

        prefill: {

          name:
            "Test Student",

          email:
            "student@test.com",

          contact:
            "9999999999"
        },

        theme: {
          color:
            "#2563eb"
        },

        method: {

          upi: true,

          card: true,

          netbanking: true,

          wallet: true
        }
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.open();

    } catch (err) {

      console.log(err);

      alert(
        "Payment failed"
      );
    }
  };

  useEffect(() => {

    fetchPayment();

  }, []);

  if (loading) {

    return (
      <p className="p-6">
        Loading...
      </p>
    );
  }

  if (!data) {

    return (
      <div className="p-6">

        <h2 className="text-2xl font-bold">
          Payments
        </h2>

        <p className="text-gray-500 mt-2">
          No allotment found.
        </p>

      </div>
    );
  }

  const {
    allotment,
    fee
  } = data;

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h2 className="text-3xl font-bold text-gray-800">
          Hostel Payment
        </h2>

        <p className="text-gray-500 mt-1">
          Manage your hostel fee payment.
        </p>

      </div>

      {/* CARDS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl shadow p-5">

          <div className="flex items-center gap-2 text-blue-600">

            <Building2 size={20} />

            <p className="font-medium">
              Hostel
            </p>

          </div>

          <p className="text-xl font-bold mt-3">
            {
              allotment?.hostelId?.name
            }
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow p-5">

          <div className="flex items-center gap-2 text-indigo-600">

            <BedDouble size={20} />

            <p className="font-medium">
              Room
            </p>

          </div>

          <p className="text-xl font-bold mt-3">

            {
              allotment?.roomId?.roomNumber
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow p-5">

          <div className="flex items-center gap-2 text-green-600">

            <CreditCard size={20} />

            <p className="font-medium">
              Amount
            </p>

          </div>

          <p className="text-xl font-bold mt-3">

            ₹{fee?.amount}

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow p-5">

          <div className="flex items-center gap-2 text-orange-600">

            <Calendar size={20} />

            <p className="font-medium">
              Due Date
            </p>

          </div>

          <p className="text-lg font-bold mt-3">

            {
              new Date(
                fee?.dueDate
              ).toLocaleDateString()
            }

          </p>

        </div>

      </div>

      {/* PAYMENT STATUS */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h3 className="text-xl font-semibold mb-4">
          Payment Status
        </h3>

        <div className="flex items-center gap-3">

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${fee?.status === "paid"
              ? "bg-green-100 text-green-700"
              : fee?.status === "overdue"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
              }`}
          >

            {
              fee?.status
            }

          </span>

        </div>

      </div>

      {/* RECEIPT UPLOAD */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h3 className="text-xl font-semibold mb-4">
          Upload Payment Receipt
        </h3>

        <form
          onSubmit={handleUpload}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) =>
              setTransactionId(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) =>
              setReceipt(
                e.target.files[0]
              )
            }
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl"
          >
            Upload Receipt
          </button>

        </form>

      </div>

      {/* ONLINE PAYMENT */}

      {
        fee?.status !== "paid" && (

          <div className="bg-white rounded-2xl shadow p-6">

            <h3 className="text-xl font-semibold mb-4">
              Online Payment
            </h3>

            <button
              onClick={handlePayment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Pay Now
            </button>

          </div>
        )
      }

    </div>
  );
};

export default Payments;