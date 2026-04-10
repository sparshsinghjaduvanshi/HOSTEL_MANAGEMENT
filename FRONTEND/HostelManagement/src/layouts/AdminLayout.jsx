import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar.jsx";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">

        {/* Topbar */}
        <div className="h-16 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl flex items-center justify-between px-6 mb-4 border border-gray-200">

          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
            Admin Dashboard
          </h1>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden sm:block">
              Welcome Admin 👋
            </span>

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold shadow-md">
              A
            </div>
          </div>

        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-full border border-gray-200">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;