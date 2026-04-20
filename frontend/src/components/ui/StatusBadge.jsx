import React from "react";

const STATUS_MAP = {
  // Transaction statuses
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-700" },
  submitted: {
    label: "Submitted",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
  },

  // Workflow statuses
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  completed: {
    label: "Approved",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  }, // alias
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  clarification_requested: {
    label: "Clarification Requested",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  clarification_provided: {
    label: "Clarification Provided",
    bg: "bg-sky-100",
    text: "text-sky-700",
  },

  // General active/inactive
  true: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-600" },
  false: { label: "Inactive", bg: "bg-slate-50", text: "text-slate-400" },
};

export default function StatusBadge({ status }) {
  const normStatus = String(status).toLowerCase();
  const config = STATUS_MAP[normStatus] || {
    label: status,
    bg: "bg-slate-50",
    text: "text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} border-current/20`}
    >
      {config.label}
    </span>
  );
}
