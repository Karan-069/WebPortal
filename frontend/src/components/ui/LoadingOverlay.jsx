import React from "react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  const isPageLoading = useSelector((state) => state.ui.isPageLoading);

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl border border-slate-100 scale-110">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-slate-400/20 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            Processing
          </p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Please Wait
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
