import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalDocs}</span>{" "}
        results
      </p>

      {/* RIGHT: CONTROLS */}
      <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
        {/* ROWS SELECTOR */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Rows:</label>
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              onLimitChange(newLimit);
              onPageChange(1);
            }}
            className="border border-slate-300 rounded-md text-sm px-2 py-1 bg-white"
          >
            {[25, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* MOBILE BUTTONS */}
        <div className="flex sm:hidden w-full justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm border rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* DESKTOP PAGINATION */}
        <nav className="hidden sm:inline-flex rounded-md shadow-sm -space-x-px">
          {/* FIRST */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="px-2 py-2 border rounded-l-md bg-white disabled:opacity-50"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* PREV */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-2 py-2 border bg-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* PAGE NUMBERS */}
          {getPageNumbers().map((n) => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`px-4 py-2 border text-sm font-semibold ${
                page === n
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          ))}

          {/* NEXT */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-2 py-2 border bg-white disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* LAST */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="px-2 py-2 border rounded-r-md bg-white disabled:opacity-50"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
