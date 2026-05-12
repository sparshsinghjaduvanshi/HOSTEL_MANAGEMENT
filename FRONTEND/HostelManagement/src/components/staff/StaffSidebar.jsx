import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/auth.service";
import { sidebarConfig } from "../../config/sidebarConfig";

const StaffSidebar = () => {

  const navigate = useNavigate();

  const { user, setUser, loading } = useAuth(); 
  console.log("USER:", user);
  if (loading) {
    return (
      <div className="w-64 h-screen bg-gray-900" />
    );
  }
  console.log(
    "ROLE DATA:",
    user?.roleData
  );

  console.log(
    "ROLE:",
    user?.roleData?.role
  );


  const role = user?.roleData?.role;

  const navItems = sidebarConfig[role] || [];
  console.log(
    "ROLE VALUE:",
    JSON.stringify(role)
  );
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
        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Staff Panel
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
                `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-md"
                  : "hover:bg-gray-700/70 hover:translate-x-1"
                }`
              }
            >
              <Icon size={18} />

              <span className="text-sm font-medium">
                {item.name}
              </span>

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

export default StaffSidebar;