import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Building,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Applications", path: "/admin/applications", icon: FileCheck },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Allotment", path: "/admin/allotment", icon: Building },
];

const AdminSidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/auth");
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">

      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-gray-700 tracking-wide">
        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
                    : "hover:bg-gray-700/70 hover:translate-x-1"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-600 py-2 rounded-xl hover:bg-red-700 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default AdminSidebar;