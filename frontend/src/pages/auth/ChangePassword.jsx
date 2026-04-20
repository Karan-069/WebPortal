import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import {
  Key,
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Update Password",
        actions: [],
      }),
    );
  }, [dispatch]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validation, setValidation] = useState({
    minLength: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, newPassword: val });
    setValidation({
      minLength: val.length >= 8,
      upperCase: /[A-Z]/.test(val),
      lowerCase: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      specialChar: /[@$!%*?&]/.test(val),
      match: val === formData.confirmPassword && val !== "",
    });
  };

  const handleConfirmChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, confirmPassword: val });
    setValidation({
      ...validation,
      match: val === formData.newPassword && val !== "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(formData.newPassword)) {
      toast.error("Password does not meet complexity requirements");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Change Password
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Keep your account secure with a strong password
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <Key className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            Security Credentials
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.oldPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Minimal 8 characters"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleConfirmChange}
                    placeholder="Repeat new password"
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> complexity rules
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { label: "Minimal 8 Characters", key: "minLength" },
                  { label: "One Uppercase Letter", key: "upperCase" },
                  { label: "One Lowercase Letter", key: "lowerCase" },
                  { label: "One Numeric Value", key: "number" },
                  { label: "One Special Character", key: "specialChar" },
                  { label: "Both Passwords Match", key: "match" },
                ].map((rule) => (
                  <div
                    key={rule.key}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold",
                      validation[rule.key]
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-white border-slate-100 text-slate-400 shadow-sm",
                    )}
                  >
                    {validation[rule.key] ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-100" />
                    )}
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-end gap-3 z-20">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-11 px-6 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !Object.values(validation).every(Boolean)}
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 h-11 px-10 disabled:pointer-events-none disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
