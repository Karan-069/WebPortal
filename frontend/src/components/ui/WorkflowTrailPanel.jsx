import React from "react";
import {
  X,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  UserPlus,
  HelpCircle,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

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
      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
    </div>
  ),
  auto_notify: (
    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md">
      <Activity className="w-3.5 h-3.5 text-slate-400" />
    </div>
  ),
};

export default function WorkflowTrailPanel({ isOpen, onClose, history = [] }) {
  if (!isOpen) return null;

  const logs = history.filter((log) => log.StageStatus !== "auto_notify");

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
              Workflow Trail
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Approval Path
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-10 h-10 p-0 text-slate-400 hover:text-slate-900 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {logs.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Clock className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">
                No workflow history recorded.
              </p>
            </div>
          ) : (
            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {logs.map((log, idx) => (
                <div key={log._id || idx} className="relative pl-8">
                  <div className="absolute left-[-2px] top-1 z-10">
                    {ACTION_ICONS[log.StageStatus] || ACTION_ICONS.submit}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Stage {log.StageNo}
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
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-xs font-black uppercase tracking-widest h-10"
          >
            Close Trail
          </Button>
        </div>
      </div>
    </div>
  );
}
