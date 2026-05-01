import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useFormContext } from "./FormContext";
import { cn } from "../../lib/utils";
import ReturnButton from "../ui/ReturnButton";
import { Separator } from "../ui/Separator";

import Button from "../ui/Button";

const FormHeader = ({
  title,
  subtitle,
  mode, // 'NEW' | 'VIEW' | 'EDIT'
  breadcrumbs = [],
  onBack,
  children,
  backTo,
  tabs = [], // Array of { label, path, active }
}) => {
  const navigate = useNavigate();
  const { toggleAll, isAllExpanded, allSectionIds } = useFormContext();

  const modeColors = {
    NEW: "bg-emerald-500 text-white",
    VIEW: "bg-indigo-500 text-white",
    EDIT: "bg-amber-500 text-white",
  };

  return (
    <div className="flex flex-col gap-6 mb-8 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {mode && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                  modeColors[mode] || "bg-slate-900 text-white",
                )}
              >
                {mode}
              </span>
            )}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {title}
            </h1>
          </div>
          {subtitle && (
            <div className="text-sm text-slate-500 font-medium mt-1">
              {subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {allSectionIds.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleAll}
              leftIcon={
                isAllExpanded ? (
                  <Minimize2 size={14} className="text-indigo-500" />
                ) : (
                  <Maximize2 size={14} className="text-indigo-500" />
                )
              }
            >
              {isAllExpanded ? "Collapse All" : "Expand All"}
            </Button>
          )}
          {children}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex items-center gap-6 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className={cn(
                "pb-3 text-xs font-black uppercase tracking-widest transition-all relative",
                tab.active
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent",
              )}
            >
              {tab.label}
              {tab.active && (
                <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-indigo-600 blur-[2px] opacity-50" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormHeader;
