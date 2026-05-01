import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import { useEffect } from "react";
import Button from "../../components/ui/Button";
import { cn } from "../../lib/utils";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Vendor Portal Dashboard",
        actions: [],
      }),
    );
  }, [dispatch]);

  const [vendorProfile, setVendorProfile] = useState({
    companyName: user?.fullName || "Vendor Name",
    workflowStatus: "Draft", // Draft, Pending Approval, Approved
    profileCompleteness: 40,
  });

  const isDraft = vendorProfile.workflowStatus === "Draft";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Clean, Minimalist Header matching standard app styling */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Portal
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl text-sm">
            Welcome back, {vendorProfile.companyName}. Manage your profile and
            invoices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] [word-spacing:0.1em]">
            Active Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Profile Completion Action Card */}
        <div
          className={`col-span-full bg-white rounded-lg shadow-sm border ${isDraft ? "border-amber-200" : "border-slate-200"} p-6 relative overflow-hidden transition-all`}
        >
          {isDraft && (
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full ${isDraft ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {isDraft ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  {isDraft
                    ? "Action Required: Complete Profile"
                    : "Profile Status"}
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  {isDraft
                    ? "Your profile is incomplete. Please provide business, tax, and bank details to start receiving purchase orders and processing bills."
                    : "Your profile has been submitted and is currently routed for internal approval. We will notify you once approved."}
                </p>

                {isDraft && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-2 w-48 overflow-hidden rounded-full">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{
                          width: `${vendorProfile.profileCompleteness}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {vendorProfile.profileCompleteness}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => (isDraft ? navigate("/register/vendor") : null)}
              disabled={!isDraft}
              variant={isDraft ? "soft" : "outline"}
              rightIcon={isDraft ? <ChevronRight className="w-4 h-4" /> : null}
              className={cn(
                "whitespace-nowrap px-4 font-bold shadow-none border-0",
                isDraft
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-slate-50 text-slate-400",
              )}
            >
              {isDraft ? "Complete Profile" : "Awaiting Approval"}
            </Button>
          </div>
        </div>

        {/* Actionable KPIs */}
        <div
          className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
          onClick={() => navigate("/bills")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
              Total Bills
            </h3>
            <div className="p-2 bg-slate-50 border border-slate-100 text-indigo-600 rounded">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">24</div>
        </div>

        <div
          className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => navigate("/bills?status=pending")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
              Pending
            </h3>
            <div className="p-2 bg-amber-50 border border-amber-100 text-amber-600 rounded">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 text-amber-600">
            3
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => navigate("/bills?status=approved")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
              Approved
            </h3>
            <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 text-emerald-600">
            12
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => navigate("/bills")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
              Amount Paid
            </h3>
            <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded">
              <span className="font-bold pl-1">$</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 text-blue-600">
            14k
          </div>
        </div>
      </div>
    </div>
  );
}
