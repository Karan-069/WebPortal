import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Landmark,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";

export default function VendorCompleteProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Complete Vendor Profile",
        actions: [],
      }),
    );
  }, [dispatch]);

  const [formData, setFormData] = useState({
    companyName: "",
    panNo: "",
    registrationType: "regular",
    gstNo: "",
    address1: "",
    address2: "",
    // City and State should conceptually be lookups, but we'll use placeholder text for UI
    city: "",
    state: "",
    country: "India",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: "",
    isMsme: false,
    msmeNo: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const res = await api.get("/vendors/profile/me");
        const vendor = res.data.data;
        setFormData((prev) => ({
          ...prev,
          companyName: vendor.fullName || "",
          panNo: vendor.panNo || "",
          gstNo: vendor.gstNo || "",
          address1: vendor.address1 || "",
          address2: vendor.address2 || "",
          city: vendor.city || "",
          state: vendor.state || "",
          country: vendor.country || "India",
          bankName: vendor.bankName || "",
          accountNumber: vendor.accountNumber || "",
          ifscCode: vendor.ifscCode || "",
          beneficiaryName: vendor.beneficiaryName || "",
          isMsme: vendor.isMsme || false,
          msmeNo: vendor.msmeNo || "",
        }));
      } catch (err) {
        toast.error("Failed to load your vendor profile context.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/vendors/profile/submit", formData);
      toast.success(
        "Profile submitted successfully! It is now pending approval.",
      );
      navigate("/vendor/dashboard");
    } catch (err) {
      toast.error("Failed to submit profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete Profile
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Please provide accurate details to finalize your vendor onboarding.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Locked Profile Header */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-inner">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Locked Identity Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Registered Company Name
              </label>
              <input
                type="text"
                readOnly
                value={formData.companyName}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Verified PAN Number
              </label>
              <input
                type="text"
                readOnly
                value={formData.panNo}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-100 text-slate-500 font-mono uppercase cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Tax & Registration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registration Type
              </label>
              <select
                name="registrationType"
                value={formData.registrationType}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="regular">Regular</option>
                <option value="compositeDealer">Composite Dealer</option>
                <option value="unregistered">Unregistered</option>
                <option value="overseas">Overseas</option>
                <option value="sez">SEZ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                GST Number
              </label>
              <input
                required={formData.registrationType !== "unregistered"}
                type="text"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                className="w-full border border-slate-200 font-mono rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-sky-50 p-2 rounded-lg text-sky-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Address
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address Line 1
              </label>
              <input
                required
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <input
                  required
                  readOnly
                  type="text"
                  name="country"
                  value={formData.country}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <Landmark className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Bank Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                required
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                placeholder="HDFC Bank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                required
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className="w-full border border-slate-200 font-mono uppercase rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                placeholder="HDFC0001234"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Number
              </label>
              <input
                required
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full border border-slate-200 font-mono rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                placeholder="501234567890"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Beneficiary Name (As per Bank)
              </label>
              <input
                required
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                placeholder="Acme Logistics Private Limited"
              />
            </div>
          </div>
        </div>

        {/* MSME & Cert */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Certifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer w-max">
              <input
                type="checkbox"
                name="isMsme"
                checked={formData.isMsme}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700">
                Registered as MSME
              </span>
            </label>

            {formData.isMsme && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  MSME Registration Number
                </label>
                <input
                  required
                  type="text"
                  name="msmeNo"
                  value={formData.msmeNo}
                  onChange={handleChange}
                  className="w-full border border-slate-200 font-mono rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="UDYAM-XX-00-00000"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.25)] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
