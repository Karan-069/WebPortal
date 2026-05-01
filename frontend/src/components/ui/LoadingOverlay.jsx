import React from "react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  const isPageLoading = useSelector((state) => state.ui.isPageLoading);

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 scale-110">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm shadow-indigo-200" />
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm shadow-indigo-200" />
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce shadow-sm shadow-indigo-200" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            Processing Request
          </p>
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-slate-100" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em] leading-none">
              Security Hydration
            </p>
            <div className="h-px w-6 bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
