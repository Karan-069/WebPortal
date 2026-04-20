import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip";
import { cn } from "../../lib/utils";

/**
 * FormField Component
 * Standardizes the display of labels, help tooltips, and validation errors.
 */
const FormField = ({
  label,
  help,
  error,
  children,
  className,
  required = false,
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5 ml-0.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>

        {help && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <HelpCircle size={10} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-[10px] font-medium leading-relaxed"
              >
                {help}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="relative">{children}</div>

      {error && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter mt-1 ml-0.5 animate-in fade-in slide-in-from-top-1">
          {error.message || error}
        </p>
      )}
    </div>
  );
};

export default FormField;
