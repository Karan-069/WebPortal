import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import { Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";

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
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-slate-900 tracking-tight">
              Personalizing Experience
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
              Constructing Layout
            </p>
          </div>
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
        <div className="bg-slate-100/50 p-4 border-b border-slate-200/60 relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
          <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] [word-spacing:0.1em] px-3">
            Action Center
          </h3>
        </div>
        <div className="p-10 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Click on your personalized KPIs above to navigate directly to the
            respective record lists.
          </p>
          <Button onClick={() => navigate("/bills")} variant="primary">
            Go to Bill Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}
