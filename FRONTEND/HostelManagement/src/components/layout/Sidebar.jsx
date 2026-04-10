import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Home,
  FileText,
  Folder,
  User,
  RefreshCw,
  List,
  Bed,
  AlertCircle,
  Bell,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/student/dashboard", icon: Home },
  { name: "My Application", path: "/student/application", icon: FileText },
  { name: "Documents", path: "/student/documents", icon: Folder },
  { name: "Profile", path: "/student/profile", icon: User },
  { name: "Room Change", path: "/student/room-change", icon: RefreshCw },
  { name: "My Requests", path: "/student/my-requests", icon: List },
  { name: "Allotment", path: "/student/allotment", icon: Bed },
  { name: "Complaints", path: "/student/complaints", icon: AlertCircle },
  { name: "Notifications", path: "/student/notifications", icon: Bell },
];

const Sidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/auth");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">

      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-gray-700 tracking-wide">
        <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          HostelSys
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
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
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

export default Sidebar;