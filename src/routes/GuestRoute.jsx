import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import RouteLoadingFallback from "../components/common/RouteLoadingFallback";

/**
 * Route guard that prevents authenticated users from accessing guest-only routes
 * (login, signup, forgot password, reset password, verify email).
 * Replaces browser history so the browser's back button cannot navigate back into auth pages.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingFallback />;
  }

  if (isAuthenticated) {
    const from = location.state?.from;
    const requestedPath =
      typeof from === "string"
        ? from
        : from?.pathname
          ? `${from.pathname}${from.search || ""}${from.hash || ""}`
          : "/";

    const destination =
      requestedPath.startsWith("/login") ||
      requestedPath.startsWith("/signup") ||
      requestedPath.startsWith("/forgot-password") ||
      requestedPath.startsWith("/reset-password") ||
      requestedPath.startsWith("/verify-email")
        ? "/"
        : requestedPath;

    return <Navigate to={destination} replace />;
  }

  return children;
};

export default GuestRoute;
