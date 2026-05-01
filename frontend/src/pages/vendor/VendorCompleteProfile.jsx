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
import Button from "../../components/ui/Button";
import FormSection from "../../components/form/FormSection";
import { Accordion } from "../../components/ui/Accordion";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            Onboarding Context
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
            Loading Vendor Portal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="w-10 h-10 p-0 rounded-full text-slate-500 shadow-none border-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete Profile
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] mt-1.5">
            Finalize Vendor Onboarding Workflow
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={["identity", "tax", "address", "banking", "cert"]}
          className="space-y-6"
        >
          {/* Locked Profile Header */}
          <FormSection
            id="identity"
            title="Locked Identity Details"
            icon="ShieldCheck"
            className="bg-slate-50/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
          </FormSection>

          {/* Tax Information */}
          <FormSection id="tax" title="Tax & Registration" icon="Building2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
          </FormSection>

          {/* Address */}
          <FormSection id="address" title="Registered Address" icon="MapPin">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
          </FormSection>

          {/* Banking */}
          <FormSection id="banking" title="Bank Details" icon="Landmark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
          </FormSection>

          {/* MSME & Cert */}
          <FormSection id="cert" title="Certifications" icon="ShieldCheck">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer w-max">
                <input
                  type="checkbox"
                  name="isMsme"
                  checked={formData.isMsme}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-500">
                  Registered as MSME
                </span>
              </label>

              {formData.isMsme && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-1">
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
          </FormSection>
        </Accordion>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={submitting}
            leftIcon={<CheckCircle className="w-5 h-5" />}
            className="px-8 shadow-[0_0_20px_rgba(79,70,229,0.25)]"
          >
            Submit Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
