import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFormContext } from "./FormContext";

const FormHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  onBack,
  children,
}) => {
  const navigate = useNavigate();
  const { toggleAll, isAllExpanded, allSectionIds } = useFormContext();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 group shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {crumb}
                </span>
                <ChevronRight size={10} className="text-slate-300" />
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-medium text-slate-400 mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {allSectionIds.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm active:scale-95"
          >
            {isAllExpanded ? (
              <>
                <Minimize2 size={14} className="text-indigo-500" /> Collapse All
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-indigo-500" /> Expand All
              </>
            )}
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default FormHeader;
