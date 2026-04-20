import React, { useState, useEffect } from "react";
import { History, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function AuditTrail({ recordId, collectionName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!recordId || recordId === "new") return;
      setLoading(true);
      try {
        const res = await api.get(
          `/audit-logs?recordId=${recordId}${collectionName ? `&collectionName=${collectionName}` : ""}`,
        );
        setLogs(res.data.data.docs || []);
      } catch (err) {
        toast.error("Failed to fetch audit history");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [recordId, collectionName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">
          Fetching history...
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-slate-400 font-medium">No history recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log, lidx) => (
        <div
          key={lidx}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Header: User, Action, Time */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-black">
                {log.performedBy?.fullName?.[0] || "U"}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 tracking-tight">
                  {log.performedBy?.fullName || "System"}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                  {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm")}
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                log.action === "CREATE"
                  ? "bg-green-100 text-green-700"
                  : log.action === "UPDATE"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {log.action}
            </span>
          </div>

          {/* Changes Section */}
          <div className="space-y-4">
            {log.changes.map((change, cidx) => (
              <div key={cidx} className="group">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                  {change.field.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 line-through decoration-slate-300 border border-slate-100/50 break-words opacity-60 group-hover:opacity-100 transition-opacity">
                    {change.oldDisplayValue ||
                      String(change.oldValue ?? "None")}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    </div>
                  </div>
                  <div className="bg-indigo-50/30 rounded-xl p-3 text-xs text-indigo-700 font-bold border border-indigo-100/50 break-words shadow-sm">
                    {change.newDisplayValue ||
                      String(change.newValue ?? "None")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
