import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Requires login — redirects guests to /login */
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/** Requires login + client role */
export const ClientRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "client") return <Navigate to="/dashboard" replace />;
  return children;
};

/** Requires login + freelancer role */
export const FreelancerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "freelancer") return <Navigate to="/dashboard" replace />;
  return children;
};

/** Only for guests — redirects logged-in users to /dashboard */
export const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
