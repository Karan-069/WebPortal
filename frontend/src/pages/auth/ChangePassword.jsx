import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import { setUser } from "../../store/features/authSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import {
  Key,
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "../../components/ui/Button";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isForced = user?.mustChangePassword;

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Security Credentials",
        actions: [],
      }),
    );
  }, [dispatch]);

  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
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
      dispatch(setUser({ ...user, mustChangePassword: false }));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-700">
      <div className="space-y-6 p-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Security Credentials
            </h1>
            <p className="text-base font-medium text-slate-500 mt-1">
              Manage and update your enterprise access credentials
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!Object.values(validation).every(Boolean)}
            leftIcon={<Save size={18} />}
            className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] text-[11px]"
          >
            Update Password
          </Button>
        </div>

        {isForced && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-5 animate-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-100/50">
            <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-amber-100 shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-amber-900 font-bold text-lg leading-tight">
                Administrative Action Required
              </h3>
              <p className="text-amber-800/70 text-sm mt-1.5 font-medium leading-relaxed">
                Your account security policy requires an immediate password
                update. Establish a new secure credential to unlock all system
                features.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              {/* Left Column: Vertical Inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      required
                      value={formData.oldPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          oldPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      className="w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("old")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                    >
                      {showPasswords.old ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      required
                      value={formData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Establish new password"
                      className="w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("new")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleConfirmChange}
                      placeholder="Repeat new password"
                      className="w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("confirm")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 2-Column Checklist */}
              <div className="lg:col-span-7">
                <div className="h-full bg-slate-50/50 rounded-3xl p-8 border border-slate-100/50 flex flex-col justify-center">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-6 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-500" />{" "}
                    Complexity Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { label: "8 Characters Minimum", key: "minLength" },
                      { label: "One Uppercase Letter", key: "upperCase" },
                      { label: "One Lowercase Letter", key: "lowerCase" },
                      { label: "One Numeric Value", key: "number" },
                      { label: "One Special Character", key: "specialChar" },
                      { label: "Passwords Must Match", key: "match" },
                    ].map((rule) => (
                      <div
                        key={rule.key}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.05em]",
                          validation[rule.key]
                            ? "bg-white border-emerald-500/20 text-emerald-700 shadow-sm shadow-emerald-500/5"
                            : "bg-white/50 border-transparent text-slate-400 opacity-60",
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                            validation[rule.key]
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-300",
                          )}
                        >
                          {validation[rule.key] ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-current" />
                          )}
                        </div>
                        <span className="truncate">{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                isLoading={loading}
                disabled={!Object.values(validation).every(Boolean)}
                leftIcon={<Save size={18} />}
                className="h-11 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold uppercase tracking-widest text-xs"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
