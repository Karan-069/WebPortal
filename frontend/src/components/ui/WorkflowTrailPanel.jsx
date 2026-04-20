import React, { useState } from "react";
import {
  X,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  UserPlus,
  HelpCircle,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StatusBadge from "./StatusBadge";

const ACTION_ICONS = {
  submit: (
    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
    </div>
  ),
  approve: (
    <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-md">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    </div>
  ),
  reject: (
    <div className="p-1.5 bg-red-50 border border-red-100 rounded-md">
      <XCircle className="w-3.5 h-3.5 text-red-600" />
    </div>
  ),
  delegate: (
    <div className="p-1.5 bg-amber-50 border border-amber-100 rounded-md">
      <UserPlus className="w-3.5 h-3.5 text-amber-600" />
    </div>
  ),
  clarification_requested: (
    <div className="p-1.5 bg-purple-50 border border-purple-100 rounded-md">
      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
    </div>
  ),
  clarification_provided: (
    <div className="p-1.5 bg-sky-50 border border-sky-100 rounded-md">
      <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
    </div>
  ),
  auto_notify: (
    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md">
      <Activity className="w-3.5 h-3.5 text-slate-400" />
    </div>
  ),
};

export default function WorkflowTrailPanel({ isOpen, onClose, history = [] }) {
  const [activeTab, setActiveTab] = useState("workflow"); // 'workflow' or 'audit'

  if (!isOpen) return null;

  const workflowLogs = history.filter(
    (log) => log.StageStatus !== "auto_notify",
  );
  const auditLogs = history.filter((log) => log.StageStatus === "auto_notify");

  const currentLogs = activeTab === "workflow" ? workflowLogs : auditLogs;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Timeline
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Transaction History
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 p-1 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all rounded ${
              activeTab === "workflow"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Workflow
            {workflowLogs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                {workflowLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all rounded ${
              activeTab === "audit"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            System Audit
            {auditLogs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {currentLogs.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Clock className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">
                No logs found in this category.
              </p>
            </div>
          ) : (
            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {currentLogs.map((log, idx) => (
                <div key={log._id || idx} className="relative pl-8">
                  <div className="absolute left-[-2px] top-1 z-10">
                    {ACTION_ICONS[log.StageStatus] || ACTION_ICONS.submit}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {log.StageStatus === "auto_notify"
                          ? "System Event"
                          : `Stage ${log.StageNo}`}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(log.createdAt))} ago
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.StageStatus} />
                    </div>

                    <div className="bg-slate-50/50 rounded p-3 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                          <User className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {log.userId?.fullName || "System Automated"}
                        </span>
                      </div>

                      {log.comments && (
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {log.comments}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-widest rounded shadow-sm"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
