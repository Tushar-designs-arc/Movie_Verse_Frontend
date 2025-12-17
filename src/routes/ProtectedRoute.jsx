import { Lock, ShieldAlert } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// This is a navigation guard; server middleware remains the authorization source of truth.
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="section-shell min-h-screen py-28">
        <div className="cinema-panel mx-auto flex max-w-xl items-center gap-4 rounded-lg p-6">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-red-400">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-theme">Checking access</h1>
            <p className="muted-copy mt-1 text-sm">Your session is being verified.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="section-shell grid min-h-screen place-items-center py-28">
        <div className="cinema-panel max-w-xl rounded-lg p-8 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-lg bg-red-600/15 text-red-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <p className="eyebrow mt-6">Admin only</p>
          <h1 className="mt-2 text-3xl font-black text-theme">Access restricted</h1>
          <p className="muted-copy mx-auto mt-3 max-w-md text-sm leading-7">
            This panel is available only for accounts with admin role.
          </p>
          <Link
            to="/profile"
            className="primary-action mt-6 inline-flex rounded-md px-5 py-3 text-sm font-black transition"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
