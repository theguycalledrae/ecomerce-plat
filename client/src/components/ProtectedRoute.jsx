import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // flash-free while /me resolves
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

