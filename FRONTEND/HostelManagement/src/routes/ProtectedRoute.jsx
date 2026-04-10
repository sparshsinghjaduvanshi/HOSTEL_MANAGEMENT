import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

 if (!user) return <Navigate to="/" />;

  if (role && user.role !== role) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;