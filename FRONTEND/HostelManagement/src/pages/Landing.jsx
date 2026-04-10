import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    if (user.role === "admin") navigate("/admin/dashboard");
    else navigate("/student/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-indigo-600">
          HostelSys
        </h1>

        <button
          onClick={() => navigate("/auth")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Login / Register
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Smart Hostel Management System
        </h1>

        <p className="text-gray-600 max-w-xl mb-6">
          Apply for hostels, manage allotments, track applications,
          and simplify student accommodation — all in one platform.
        </p>

        <button
          onClick={() => navigate("/auth")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg hover:bg-indigo-700"
        >
          Get Started
        </button>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-6 px-10 pb-16">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Easy Applications</h3>
          <p className="text-gray-500">
            Apply to hostels with just a few clicks.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Automated Allotment</h3>
          <p className="text-gray-500">
            Smart allocation based on priority & distance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Real-time Tracking</h3>
          <p className="text-gray-500">
            Track your application and room status anytime.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Landing;