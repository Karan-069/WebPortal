import React, { useState, useEffect } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Reply,
  User as UserIcon,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

export default function WorkflowTrail({ transactionId, transactionModel }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!transactionId || transactionId === "new") return;
      setLoading(true);
      try {
        const res = await api.get(
          `/workflow-logs?transactionId=${transactionId}&transactionModel=${transactionModel}`,
        );
        setLogs(res.data.data.docs || []);
      } catch (err) {
        toast.error("Failed to fetch workflow trail");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [transactionId, transactionModel]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    if (s === "approve" || s === "approved")
      return {
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        label: "Approved",
      };
    if (s === "reject" || s === "rejected")
      return {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
        label: "Rejected",
      };
    if (s === "submit" || s === "submitted")
      return {
        icon: Send,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
        label: "Submitted",
      };
    if (s === "amend" || s === "amended")
      return {
        icon: Reply,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        label: "Amended",
      };
    if (s === "delegate" || s === "delegated")
      return {
        icon: UserPlus,
        color: "text-sky-600",
        bg: "bg-sky-50",
        border: "border-sky-100",
        label: "Delegated",
      };
    if (s === "clarify" || s === "clarification_requested")
      return {
        icon: Reply,
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        label: "Clarification",
      };
    return {
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-50",
      border: "border-slate-100",
      label: status || "Pending",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            Workflow Logic
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
            Reconstructing Trail
          </p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 mx-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-50">
          <Send className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] text-[11px]">
          No activity recorded
        </p>
      </div>
    );
  }

  return (
    <div className="relative px-4 pb-12">
      {/* The Timeline Line with Gradient */}
      <div className="absolute left-[19px] top-8 bottom-0 w-1 bg-gradient-to-b from-indigo-500/20 via-slate-100 to-transparent rounded-full" />

      <div className="space-y-6">
        {logs.map((log, lidx) => {
          const config = getStatusConfig(log.StageStatus);
          const StatusIcon = config.icon;
          const date = new Date(log.createdAt);

          return (
            <div
              key={lidx}
              className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${lidx * 100}ms` }}
            >
              {/* Circle Indicator - Compact Design */}
              <div
                className={cn(
                  "absolute left-0 top-0 w-10 h-10 rounded-xl border-4 border-white shadow-md z-10 flex items-center justify-center transition-all group-hover:scale-110",
                  config.bg,
                  config.color,
                )}
              >
                <StatusIcon size={16} strokeWidth={2.5} />
              </div>

              {/* Content Card - Compact Architecture */}
              <div className="ml-14">
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/5 group-hover:border-indigo-100 transition-all duration-300">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3 pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-black shrink-0">
                        {log.userId?.fullName?.[0] || <UserIcon size={12} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-black text-slate-900 tracking-tight leading-tight mb-0.5">
                          {log.userId?.fullName || "System User"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] leading-none">
                          Stage {log.StageNo} • {format(date, "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] border",
                          config.bg,
                          config.color,
                          config.border,
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] opacity-60">
                        {formatDistanceToNow(date)} ago
                      </span>
                    </div>
                  </div>

                  {log.comments ? (
                    <div className="relative overflow-hidden bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 group-hover:bg-white transition-colors">
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          config.bg
                            .replace("bg-", "bg-")
                            .replace("-50", "-500"),
                        )}
                      />
                      <p className="text-[12px] text-slate-700 leading-relaxed font-bold italic pl-1.5 break-words">
                        "{log.comments}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] opacity-40 px-2 italic">
                      No audit remarks
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
