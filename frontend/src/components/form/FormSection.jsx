import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/Accordion";
import { cn } from "../../lib/utils";
import * as LucideIcons from "lucide-react";

const FormSection = ({
  id,
  title,
  icon,
  children,
  className,
  headerClassName,
  ...props
}) => {
  // Robust case-insensitive icon resolution
  const resolveIcon = (iconName) => {
    if (!iconName) return LucideIcons.Database;
    if (typeof iconName !== "string") return iconName;

    // Try exact match
    if (LucideIcons[iconName]) return LucideIcons[iconName];

    // Try PascalCase
    const pascal =
      iconName.charAt(0).toUpperCase() + iconName.slice(1).toLowerCase();
    if (LucideIcons[pascal]) return LucideIcons[pascal];

    // Fallback
    return LucideIcons.Database;
  };

  const IconComponent = resolveIcon(icon);

  return (
    <AccordionItem
      value={id || title}
      className={cn(
        "bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all data-[state=open]:shadow-md",
        className,
      )}
      {...props}
    >
      <AccordionTrigger
        className={cn(
          "px-6 py-4 border-b border-transparent bg-slate-100/80 hover:bg-slate-200/50 transition-all data-[state=open]:border-slate-200/60 relative",
          headerClassName,
        )}
      >
        {/* Subtle Accent Bar */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-data-[state=open]:opacity-100 transition-opacity" />

        <div className="flex items-center gap-4">
          {IconComponent && (
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 group-data-[state=open]:border-indigo-100 transition-all">
              <IconComponent className="w-4 h-4 text-indigo-600" />
            </div>
          )}
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">
            {title}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="p-8">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FormSection;
