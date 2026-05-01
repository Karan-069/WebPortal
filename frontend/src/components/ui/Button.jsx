import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Universal Button Component
 * Standardized across the application for premium aesthetics and consistent behavior.
 */
const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      disabled = false,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200",
      secondary:
        "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200",
      outline:
        "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
      ghost:
        "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100",
      soft: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    };

    const sizes = {
      xs: "h-7 px-2.5 text-[9px]",
      sm: "h-9 px-4 text-[10px]",
      md: "h-11 px-6 text-[11px]",
      lg: "h-14 px-10 text-[13px]",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-black uppercase tracking-[0.1em] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        <div
          className={cn("flex items-center gap-2", isLoading && "opacity-0")}
        >
          {LeftIcon && <span className="flex-shrink-0">{LeftIcon}</span>}
          <span className="truncate">{children}</span>
          {RightIcon && <span className="flex-shrink-0">{RightIcon}</span>}
        </div>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
