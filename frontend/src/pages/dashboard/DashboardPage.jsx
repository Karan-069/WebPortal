import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import { Loader2 } from "lucide-react";

import DashboardKpiCard from "./DashboardKpiCard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [layout, setLayout] = useState([]);
  const [loadingLayout, setLoadingLayout] = useState(true);

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "Dashboard Overview",
        actions: [],
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const fetchLayoutConfig = async () => {
      try {
        setLoadingLayout(true);
        const res = await api.get("/dashboard/config");
        if (isMounted && res.data?.success) {
          // We assume layout is an array returned by the API
          const layoutData = res.data.data?.layout || [];
          // Sort based on 'order' parameter
          const sortedLayout = layoutData.sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );
          setLayout(sortedLayout);
        }
      } catch (e) {
        if (isMounted)
          toast.error("Failed to load personalized dashboard configuration");
      } finally {
        if (isMounted) setLoadingLayout(false);
      }
    };
    fetchLayoutConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Personalized Overview
          </p>
        </div>
      </div>

      {loadingLayout ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            Constructing your dashboard...
          </p>
        </div>
      ) : layout.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-500">
            No layout configurations assigned to your role.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {layout.map((cardConfig) => (
            <DashboardKpiCard key={cardConfig.id} cardConfig={cardConfig} />
          ))}
        </div>
      )}

      {/* Table Area underneath */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden mt-8">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Action Center</h3>
        </div>
        <div className="p-10 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Click on your personalized KPIs above to navigate directly to the
            respective record lists.
          </p>
          <button
            onClick={() => navigate("/bills")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold shadow-sm transition-colors"
          >
            Go to Bill Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
