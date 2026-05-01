import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * ReturnButton - Pattern A (Integrated Breadcrumb Action)
 * Provides a clean back-navigation action that blends with breadcrumbs.
 */
const ReturnButton = ({ to, onClick, label = "Back to List", className }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleAction}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95",
        className,
      )}
    >
      <Plus className="w-3 h-3 rotate-45" />
      <span>{label}</span>
    </button>
  );
};

export default ReturnButton;
