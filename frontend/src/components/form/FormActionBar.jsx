import React from "react";
import { Save, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * FormActionBar Component
 * Standardized sticky bottom bar for form actions.
 */
const FormActionBar = ({
  onCancel,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  disabled = false,
  isDirty = false,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between z-20 transition-all",
        className,
      )}
    >
      <div className="flex flex-col ml-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          Form Status
        </span>
        <span className="text-xs font-bold text-slate-600">
          {isDirty ? "Unsaved changes" : "All changes saved"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-11 px-6 shadow-sm disabled:opacity-50"
            disabled={disabled || isSubmitting}
          >
            {cancelLabel}
          </button>
        )}

        {children}

        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={disabled || isSubmitting}
            className="inline-flex items-center justify-center rounded-xl text-sm font-black transition-all bg-slate-900 text-white hover:bg-slate-800 h-11 px-10 shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {submitLabel}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormActionBar;
