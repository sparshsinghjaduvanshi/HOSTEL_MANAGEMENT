import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";


 const navItems = [
  { name: "Dashboard", path: "/student/dashboard" },
  { name: "My Application", path: "/student/application" },
  { name: "Documents", path: "/student/documents" },

  // 🔥 ADD THESE
  { name: "Profile", path: "/student/profile" },
  { name: "Room Change", path: "/student/room-change" },
  { name: "My Requests", path: "/student/my-requests" },

  // existing
  { name: "Allotment", path: "/student/allotment" },
  { name: "Complaints", path: "/student/complaints" },
  { name: "Notifications", path: "/student/notifications" },
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
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        HostelSys
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/*  Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;