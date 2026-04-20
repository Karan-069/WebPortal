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
          "px-6 py-4 border-b border-transparent bg-slate-50/30 hover:bg-slate-50/60 transition-all data-[state=open]:border-slate-50",
          headerClassName,
        )}
      >
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="p-1.5 bg-indigo-50 rounded-lg group-data-[state=open]:bg-indigo-100 transition-colors">
              <IconComponent className="w-4 h-4 text-indigo-600" />
            </div>
          )}
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
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
