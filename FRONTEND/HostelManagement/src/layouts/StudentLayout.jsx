import Sidebar from "../components/layout/Sidebar.jsx";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">

        {/* Topbar */}
        <div className="h-16 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl flex items-center justify-between px-6 mb-4 border border-gray-200">

          {/* Left */}
          <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
            Student Dashboard
          </h1>

          {/* Right */}
          <div className="flex items-center gap-4">

            <span className="text-gray-600 hidden sm:block">
              Welcome 👋
            </span>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-md">
              S
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

export default StudentLayout;