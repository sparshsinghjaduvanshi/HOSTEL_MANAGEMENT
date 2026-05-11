import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
import { useAuth } from "../context/AuthContext";


const StaffLayout = () => {
  const { user } = useAuth();

  const staffRole = user?.roleData?.role;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Sidebar */}
      <StaffSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">

        {/* Topbar */}
        <div className="h-16 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl flex items-center justify-between px-6 mb-4 border border-gray-200">

          <div>
            <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
              Staff Panel
            </h1>

            <p className="text-sm text-gray-500">
              {staffRole}
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            <span className="text-gray-600 hidden sm:block">
              Welcome 👋
            </span>

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold shadow-md">
              {user?.fullName?.charAt(0) || "S"}
            </div>

          </div>

        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-full border border-gray-200">
            <Outlet />
          </div>
        </div>

      </div>

    </div>
  );
};

export default StaffLayout;