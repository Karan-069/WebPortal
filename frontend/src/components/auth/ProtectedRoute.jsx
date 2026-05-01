import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout } from "../../store/features/authSlice";
import api from "../../services/api";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [isBootstrapping, setIsBootstrapping] = useState(
    isAuthenticated && !user,
  );
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const bootstrapUser = async () => {
      if (isAuthenticated && !user && token) {
        try {
          const response = await api.get("/users/current-user");
          dispatch(setUser(response.data.data));
        } catch (error) {
          console.error("Failed to bootstrap user:", error);
          dispatch(logout());
        } finally {
          setIsBootstrapping(false);
        }
      } else {
        setIsBootstrapping(false);
      }
    };

    bootstrapUser();
  }, [isAuthenticated, user, token, dispatch]);

  if (isBootstrapping) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse text-sm">
            Initializing your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
