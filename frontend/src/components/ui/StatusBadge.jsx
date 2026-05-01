import React from "react";

const STATUS_MAP = {
  // ---------------- TRANSACTION ----------------
  draft: {
    label: "Draft",
    bg: "bg-transparent",
    text: "text-neutral-600",
    border: "border-neutral-300",
  },

  submitted: {
    label: "Submitted",
    bg: "bg-transparent",
    text: "text-slate-700",
    border: "border-slate-300",
  },

  // ---------------- WORKFLOW ----------------
  pending: {
    label: "Pending Approval",
    bg: "bg-transparent",
    text: "text-amber-700",
    border: "border-amber-300",
  },

  approved: {
    label: "Approved",
    bg: "bg-transparent",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },

  completed: {
    label: "Completed",
    bg: "bg-transparent",
    text: "text-green-700",
    border: "border-green-300",
  },

  rejected: {
    label: "Rejected",
    bg: "bg-transparent",
    text: "text-red-700",
    border: "border-red-300",
  },

  clarification_requested: {
    label: "Action Required",
    bg: "bg-transparent",
    text: "text-orange-700",
    border: "border-orange-300",
  },

  clarification_provided: {
    label: "Updated",
    bg: "bg-transparent",
    text: "text-sky-700",
    border: "border-sky-300",
  },

  // ---------------- STAGE (normalized keys) ----------------
  "clarification needed": {
    label: "Action Required",
    bg: "bg-transparent",
    text: "text-orange-700",
    border: "border-orange-300",
  },

  // ---------------- FLAGS ----------------
  true: {
    label: "Active",
    bg: "bg-transparent",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },

  false: {
    label: "Inactive",
    bg: "bg-transparent",
    text: "text-neutral-500",
    border: "border-neutral-300",
  },
};

export default function StatusBadge({ status }) {
  const normStatus = String(status || "").toLowerCase();

  const config = STATUS_MAP[normStatus] || {
    label: status,
    bg: "bg-transparent",
    text:
      normStatus.includes("approved") || normStatus.includes("completed")
        ? "text-emerald-700"
        : "text-slate-700",
    border:
      normStatus.includes("approved") || normStatus.includes("completed")
        ? "border-emerald-300"
        : "border-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {config.label}
    </span>
  );
}
