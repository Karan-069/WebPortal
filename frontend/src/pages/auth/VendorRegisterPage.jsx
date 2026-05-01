import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Mail,
  Briefcase,
  Link as LinkIcon,
  Building2,
  Key,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { loginSuccess } from "../../store/features/authSlice";
import Button from "../../components/ui/Button";

export default function VendorRegisterPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);

  // Payload data
  const [inviteData, setInviteData] = useState({
    companyName: "",
    email: "",
    panNo: "",
  });

  // Step 1: PAN Verification
  const [inputPan, setInputPan] = useState("");

  // Step 2: Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initial mount: verify the token exists and gets the masked email mapping
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing registration token.");
      setVerifyingToken(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await api.get(`/vendor-invites/verify/${token}`);
        setInviteData((prev) => ({ ...prev, email: res.data.data.email }));
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Invalid or expired registration link.",
        );
      } finally {
        setVerifyingToken(false);
      }
    };
    checkToken();
  }, [token]);

  const handleVerifyPan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/vendor-invites/verify-pan", {
        token,
        panNo: inputPan,
      });
      // If success, we grab the full unmasked data backwards
      setInviteData(res.data.data);
      toast.success("PAN Verified successfully!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid PAN number.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    setLoading(true);
    try {
      // Backend automatically maps workflow roles and sets cookies
      const res = await api.post("/vendor-invites/register", {
        token,
        password,
      });

      toast.success("Registration successful!");

      // Push Auth to Redux Context
      dispatch(
        loginSuccess({
          user: res.data.data.user,
          token: res.data.data.accessToken,
        }),
      );

      // In real-world apps, vendor properties might be saved in another slice or context
      // but Redux primarily handles core user.

      // Auto Redirect to Dashboard
      navigate("/vendor/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to complete registration.",
      );
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <LinkIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-slate-500 mb-6">
            The registration link you used is invalid, missing, or has expired.
          </p>
          <p className="text-sm font-medium text-indigo-600">
            Please contact the procurement team for a new invite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:20px_20px]" />
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#e0e7ff,transparent)]" />

      <div className="mx-auto w-full max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Vendor Onboarding
        </h2>
        {inviteData.companyName && (
          <p className="mt-2 text-center text-sm text-slate-600 font-medium">
            Registering for{" "}
            <span className="text-indigo-600">{inviteData.companyName}</span>
          </p>
        )}
      </div>

      <div className="mt-8 mx-auto w-full max-w-md relative z-10 transition-all">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-indigo-500/5 rounded-3xl sm:px-10 border border-white">
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"} transition-all duration-500`}
            ></div>
            <div
              className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"} transition-all duration-500`}
            ></div>
          </div>

          {step === 1 && (
            <form
              onSubmit={handleVerifyPan}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Verify Identity
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Please enter your company PAN strictly for verification.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
                  Email Linked to Invite
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={inviteData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
                  Company PAN Number
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="pan"
                    type="text"
                    required
                    maxLength={10}
                    value={inputPan}
                    onChange={(e) => setInputPan(e.target.value.toUpperCase())}
                    className="block w-full pl-10 pr-3 py-2 font-mono uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                    placeholder="Enter strictly matched PAN"
                  />
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full">
                Verify PAN & Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleRegister}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-2 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  PAN Verified
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Set a secure password for your vendor access.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
                  Create Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                    placeholder="Verify your password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Complete Registration
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
