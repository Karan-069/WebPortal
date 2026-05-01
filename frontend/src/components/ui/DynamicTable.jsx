import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";

export default function DynamicTable({
  data,
  columns,
  isLoading,
  onRowDoubleClick,
}) {
  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse bg-white rounded-xl shadow-sm border border-slate-200/60">
        Loading data...
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200/60">
        No data available.
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, idx) => (
            <TableHead key={idx} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIdx) => (
          <TableRow
            key={rowIdx}
            onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
            isClickable={!!onRowDoubleClick}
          >
            {columns.map((col, colIdx) => (
              <TableCell
                key={colIdx}
                className={col.className}
                data-label={typeof col.header === "string" ? col.header : ""}
              >
                {col.accessor
                  ? row[col.accessor]
                  : col.render
                    ? col.render(row)
                    : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
