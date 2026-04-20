import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { loginSuccess } from "../../store/features/authSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setIsLoading(true);

    try {
      const res = await api.post("/users/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });
      const { user, accessToken, tenantId } = res.data.data;
      dispatch(loginSuccess({ user, token: accessToken, tenantId }));
      toast.success(`Welcome, ${user.fullName}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Check credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <ShieldCheck className="w-10 h-10 text-white transform -rotate-3" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          WebPortal Central
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Enterprise Resource Planning & Workflow
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5"
              >
                Work Email
              </label>
              <div className="mt-1">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  name="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-widest"
                >
                  Password
                </label>
                <div className="text-xs">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>
              <div className="mt-1 relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-slate-700 cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing
                    in...
                  </>
                ) : (
                  <>Sign in</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              New business user?{" "}
              <button
                onClick={() => navigate("/vendor-register")}
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Request Enrollment
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
        &copy; 2026 WebPortal V2. Secure Enterprise Environment.
      </div>
    </div>
  );
}
