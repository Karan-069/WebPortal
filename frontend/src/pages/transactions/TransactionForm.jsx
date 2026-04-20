import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import SearchableSelect from "../../components/ui/SearchableSelect";

export default function TransactionForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-dropdown"],
    queryFn: async () => (await api.get("/vendors")).data?.data || [],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => (await api.get("/departments")).data?.data || [],
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post("/bills", data),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Bill processed successfully");
      navigate("/transactions");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save bill");
    },
  });

  const handleSave = (status) => {
    mutation.mutate({ ...formData, transactionStatus: status });
  };

  useEffect(() => {
    dispatch(
      setPageContext({
        title: isEditMode ? `Edit Bill: ${id}` : "Create New Bill",
        actions: [
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => navigate("/transactions"),
          },
          {
            label: "Save Draft",
            variant: "secondary",
            onClick: () => handleSave("save"),
          },
          {
            label: "Submit for Approval",
            variant: "primary",
            onClick: () => handleSave("submit"),
          },
        ],
      }),
    );
  }, [dispatch, navigate, isEditMode, id, formData, mutation.isPending]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Bill Details
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Invoice Number *
          </label>
          <input
            type="text"
            name="invoiceNo"
            value={formData.invoiceNo}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-md focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all bg-slate-50/30 hover:bg-slate-50/80 focus:bg-white text-slate-900"
            placeholder="INV-XXX"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Invoice Date
          </label>
          <input
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-md focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all bg-slate-50/30 hover:bg-slate-50/80 focus:bg-white text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Vendor *
          </label>
          <SearchableSelect
            value={formData.vendor}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, vendor: val }))
            }
            options={[
              { label: "Acme Corp", value: "100a" },
              { label: "Global Tech", value: "100b" },
              { label: "Office Supplies Inc.", value: "100c" },
              { label: "Delta Solutions", value: "100d" },
            ]}
            placeholder="Select Vendor..."
            searchPlaceholder="Search vendors..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Department
          </label>
          <SearchableSelect
            value={formData.department}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, department: val }))
            }
            options={[
              { label: "Information Technology", value: "IT" },
              { label: "Human Resources", value: "HR" },
              { label: "Finance", value: "FIN" },
              { label: "Marketing", value: "MKT" },
              { label: "Operations", value: "OPS" },
            ]}
            placeholder="Select Department..."
            searchPlaceholder="Search departments..."
          />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-md focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all bg-slate-50/30 hover:bg-slate-50/80 focus:bg-white text-slate-900"
            rows="3"
            placeholder="Add any extra notes here..."
          ></textarea>
        </div>
      </div>

      <div className="flex items-center justify-between mt-10 mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Line Items
        </h2>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded p-6 text-center text-slate-500 italic mb-6">
        Item grid functionality will be loaded here. It handles complex nested
        states and exact decimal matches for MongoDB.
      </div>
    </div>
  );
}
