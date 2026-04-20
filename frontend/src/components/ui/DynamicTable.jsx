import React from "react";

export default function DynamicTable({
  data,
  columns,
  isLoading,
  onRowDoubleClick,
}) {
  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading data...
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded shadow">
        No data available.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200/60 w-full transition-all">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 uppercase tracking-wide text-xs">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
              className={`border-b border-slate-100/60 last:border-none hover:bg-sky-50/40 even:bg-slate-50/30 transition-colors duration-200 ${onRowDoubleClick ? "cursor-pointer hover:shadow-sm" : ""}`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="px-6 py-4 text-slate-700 font-medium"
                >
                  {col.accessor
                    ? row[col.accessor]
                    : col.render
                      ? col.render(row)
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
