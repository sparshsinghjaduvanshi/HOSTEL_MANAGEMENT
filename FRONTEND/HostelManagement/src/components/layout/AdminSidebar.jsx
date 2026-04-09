import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service.js";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Applications", path: "/admin/applications" },
  { name: "Students", path: "/admin/students" },
  { name: "Allotment", path: "/admin/allotment" },
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
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;