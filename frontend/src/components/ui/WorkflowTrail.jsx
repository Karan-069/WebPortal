import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function WorkflowTrail({ status, logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded p-6 mt-6">
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          Workflow Trail
        </h3>
        <p className="text-slate-500 italic">
          No workflow history available for this transaction yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border text-sm border-slate-200 rounded p-6 mt-6 shadow-sm">
      <h3 className="text-lg font-medium text-slate-800 mb-6 border-b pb-2">
        Workflow Trail
      </h3>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
              ${log.action === "approve" ? "bg-green-100 text-green-600" : ""}
              ${log.action === "reject" ? "bg-red-100 text-red-600" : ""}
              ${log.action === "submit" ? "bg-sky-100 text-sky-600" : ""}
            `}
            >
              {log.action === "approve" && <CheckCircle2 className="w-5 h-5" />}
              {log.action === "reject" && <XCircle className="w-5 h-5" />}
              {log.action === "submit" && <Clock className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-100 bg-slate-50 shadow-sm">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-slate-800">{log.stageName}</div>
                <time className="font-medium text-slate-500 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </time>
              </div>
              <div className="text-slate-600 text-xs mb-2">
                Processed by:{" "}
                <span className="font-medium">{log.processedBy}</span>
              </div>
              {log.comments && (
                <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 italic text-xs">
                  "{log.comments}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
