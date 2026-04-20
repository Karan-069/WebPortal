import React from "react";
import { Download } from "lucide-react";
import { DropdownMenuItem } from "./DropdownMenu";

export default function CsvDownload({
  data,
  columns,
  filename = "export.csv",
  asDropdownItem,
  className,
}) {
  const downloadCsv = () => {
    if (!data || data.length === 0) return;

    // Header row
    const headers = columns.map((col) => col.header).join(",");

    // Data rows
    const rows = data.map((item) => {
      return columns
        .map((col) => {
          let val = "";
          if (typeof col.accessor === "function") {
            val = col.accessor(item);
          } else if (col.accessor.includes(".")) {
            // Handle nested objects
            val = col.accessor
              .split(".")
              .reduce((obj, key) => obj?.[key], item);
          } else {
            val = item[col.accessor];
          }

          // Escape commas and wrap in quotes
          const strVal = String(val ?? "").replace(/"/g, '""');
          return `"${strVal}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return asDropdownItem ? (
    <DropdownMenuItem onClick={downloadCsv} className="cursor-pointer">
      <Download className="w-4 h-4 mr-2 text-slate-500" />
      Export CSV
    </DropdownMenuItem>
  ) : (
    <button
      type="button"
      onClick={downloadCsv}
      className={
        className ||
        "inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
      }
    >
      <Download className="w-4 h-4 text-slate-400" />
      Export CSV
    </button>
  );
}
