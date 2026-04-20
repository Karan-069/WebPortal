import React, { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";
import { toast } from "react-hot-toast";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">
          Fetching workflow trail...
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-slate-400 font-medium">No workflow activity found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, lidx) => (
        <div
          key={lidx}
          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                {log.userId?.fullName?.[0] || "U"}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  {log.userId?.fullName || "System"}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                  Stage {log.StageNo} •{" "}
                  {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                log.StageStatus === "approve" || log.StageStatus === "approved"
                  ? "bg-green-100 text-green-700"
                  : log.StageStatus === "submit" ||
                      log.StageStatus === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : log.StageStatus === "reject" ||
                        log.StageStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
              }`}
            >
              {log.StageStatus}
            </span>
          </div>
          {log.comments && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 italic border-l-4 border-slate-200">
              "{log.comments}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
