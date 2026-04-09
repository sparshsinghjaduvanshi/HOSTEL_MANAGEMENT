import Sidebar from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome 👋</span>
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              S
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default StudentLayout;