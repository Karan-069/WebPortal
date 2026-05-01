import React from "react";
import { cn } from "../../lib/utils";

const Table = React.forwardRef(
  ({ className, responsiveCard = true, ...props }, ref) => (
    <div
      className={cn(
        "relative w-full overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm bg-white md:bg-transparent md:border-none md:shadow-none",
        responsiveCard
          ? "responsive-table md:border-slate-200/60 md:bg-white md:shadow-sm"
          : "",
      )}
    >
      <table
        ref={ref}
        className={cn("w-full text-sm text-left whitespace-nowrap", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-slate-50/80 border-b border-slate-200/60", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100/60", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(
  ({ className, isClickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors duration-150 group even:bg-slate-50/30",
        isClickable && "cursor-pointer hover:bg-sky-50/40 hover:shadow-sm",
        !isClickable && "hover:bg-slate-50/80",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-5 py-3 align-middle text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-5 py-3 align-middle text-[13px] font-medium text-slate-700",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
