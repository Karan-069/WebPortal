import { Save, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "../ui/Button";

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
        "sticky bottom-0 bg-white/95 backdrop-blur-md border-2 border-slate-300/50 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center justify-between z-20 mt-12 mb-4 transition-all mx-1",
        className,
      )}
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col border-r border-slate-100 pr-6 mr-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            Live Status
          </span>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isDirty ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            <span className="text-[11px] font-bold text-slate-600">
              {isDirty ? "Unsaved Changes" : "Draft Saved"}
            </span>
          </div>
        </div>

        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            type="button"
            disabled={disabled}
            isLoading={isSubmitting}
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
          >
            {cancelLabel}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}

        {onSubmit && (
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={disabled}
            isLoading={isSubmitting}
            variant="primary"
            leftIcon={<Save size={14} />}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormActionBar;
