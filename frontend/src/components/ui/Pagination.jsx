import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "./Button";

export default function Pagination({
  page,
  totalPages,
  totalDocs,
  limit,
  onPageChange,
  onLimitChange,
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end === totalPages) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = totalDocs === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalDocs === 0 ? 0 : Math.min(page * limit, totalDocs);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white border-t border-slate-200 gap-3">
      {/* LEFT: INFO */}
      <p className="text-[12px] text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{startItem}</span> to{" "}
        <span className="font-bold text-slate-900">{endItem}</span> of{" "}
        <span className="font-bold text-slate-900">{totalDocs}</span> results
      </p>

      {/* RIGHT: CONTROLS */}
      <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
        {/* ROWS SELECTOR */}
        {onLimitChange && (
          <div className="flex items-center gap-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] leading-none">
              Rows
            </label>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                onLimitChange(newLimit);
                onPageChange(1);
              }}
              className="h-8 border border-slate-200 rounded-lg text-[11px] font-bold px-2 bg-slate-50 text-slate-700 outline-none focus:border-indigo-400 transition-all cursor-pointer"
            >
              {[10, 20, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MOBILE BUTTONS */}
        <div className="flex sm:hidden w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            leftIcon={<ChevronLeft size={14} />}
          >
            Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            rightIcon={<ChevronRight size={14} />}
          >
            Next
          </Button>
        </div>

        {/* DESKTOP PAGINATION */}
        <nav className="hidden sm:flex items-center gap-1.5">
          {/* FIRST */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="w-9 px-0"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* PREV */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-9 px-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* PAGE NUMBERS */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((n) => (
              <Button
                key={n}
                size="sm"
                variant={page === n ? "primary" : "ghost"}
                onClick={() => onPageChange(n)}
                className={cn(
                  "w-9 px-0",
                  page === n ? "shadow-indigo-100" : "text-slate-500 font-bold",
                )}
              >
                {n}
              </Button>
            ))}
          </div>

          {/* NEXT */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-9 px-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* LAST */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="w-9 px-0"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
