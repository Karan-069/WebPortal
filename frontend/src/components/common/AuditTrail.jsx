import React, { useState, useEffect } from "react";
import { History, Search, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { apiRegistry } from "../../config/apiRegistry";

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
      {logs.map((log, lidx) => {
        const dateObj = new Date(log.timestamp);
        const displayDate = isValid(dateObj)
          ? format(dateObj, "dd MMM yyyy, HH:mm")
          : "Unknown Date";

        return (
          <div
            key={lidx}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Header: User, Action, Time */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white text-[11px] font-bold">
                  {log.performedBy?.fullName?.[0] || "U"}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 tracking-tight leading-tight">
                    {log.performedBy?.fullName || "System"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] leading-none">
                    {displayDate}
                  </div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${
                  log.action === "CREATE"
                    ? "bg-emerald-50 text-emerald-700"
                    : log.action === "UPDATE"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {log.action}
              </span>
            </div>

            {/* Changes Section */}
            <div className="space-y-6">
              {/* Header Changes */}
              {(log.changes || []).filter((c) => !c.isLineItem).length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    Header Changes
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                  <div className="space-y-4">
                    {log.changes
                      .filter((c) => !c.isLineItem)
                      .map((change, cidx) => (
                        <ChangeRow
                          key={cidx}
                          change={change}
                          collectionName={collectionName}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Line Level Changes */}
              {(log.changes || []).filter((c) => c.isLineItem).length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.15em] [word-spacing:0.1em] mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-indigo-50"></div>
                    Detail Changes
                    <div className="h-px flex-1 bg-indigo-50"></div>
                  </div>
                  <div className="space-y-4">
                    {log.changes
                      .filter((c) => c.isLineItem)
                      .map((change, cidx) => (
                        <ChangeRow
                          key={cidx}
                          change={change}
                          isLine={true}
                          collectionName={collectionName}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChangeRow({ change, isLine = false, collectionName }) {
  if (!change) return null;

  const renderValue = (val) => {
    if (val === null || val === undefined || val === "None")
      return <span className="text-slate-300 italic font-medium">None</span>;
    if (val === "")
      return <span className="text-slate-300 italic font-medium">Empty</span>;
    return String(val);
  };

  const getEnterpriseLabel = (path) => {
    const clean = path
      .replace(/\[\d+\]/g, "")
      .replace(/\s\[.*?\]/g, "")
      .trim();

    // 1. Dynamic Registry Lookup
    if (collectionName && apiRegistry) {
      const config =
        apiRegistry[collectionName.toLowerCase()] ||
        Object.values(apiRegistry).find(
          (c) =>
            c.endpoint?.replace(/^\//, "").toLowerCase() ===
            collectionName.toLowerCase(),
        );

      if (config) {
        const allFields = config.formSections
          ? config.formSections.flatMap((s) => s.fields)
          : config.formFields || [];

        const regField = allFields.find((f) => f.name === clean);
        if (regField?.label) return regField.label;
      }
    }

    // 2. Enterprise Acronym Map (Fallback for specific overrides or non-master models)
    const map = {
      lineOfBusiness: "LON (Line of Business)",
      incomeAccount: "COA (Income)",
      expenseAccount: "COA (Expense)",
      assetAccount: "COA (Asset)",
      cogsAccount: "COA (COGS)",
      gainLossAccount: "COA (Gain/Loss)",
      priceVarianceAccount: "COA (Price Var)",
      quantityVarianceAccount: "COA (Qty Var)",
      vendorReturnAccount: "COA (Vendor Ret)",
      customerReturnAccount: "COA (Cust Ret)",
      pricePurchaseVarianceAccount: "COA (PPV)",
      itemType: "Nature of Item",
      inventoryType: "Inventory Classification",
      shName: "Internal Name (SH)",
      hsnCode: "HSN/SAC Code",
      gstRate: "GST Percentage",
    };

    if (map[clean]) return map[clean];

    return path
      .replace(/\[(\d+)\]/g, (match, p1) => ` - Line ${parseInt(p1) + 1} - `)
      .replace(/\./g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*\[\s*(.*?)\s*\]\s*/g, " [$1] ");
  };

  const fieldLabel = getEnterpriseLabel(change.field || "Unknown Field");

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex items-center gap-2 mb-2 ml-1">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isLine ? "bg-indigo-400" : "bg-amber-400"}`}
        />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
          {fieldLabel}
        </span>
        {isLine && (
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.1em] border border-indigo-100/50">
            Line Item
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
        {/* Old Value */}
        <div className="relative overflow-hidden bg-slate-50/50 border border-slate-100 rounded-xl p-3 group-hover:bg-slate-50 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">
            Old Value
          </div>
          <div className="text-[13px] text-slate-400 line-through decoration-slate-200 decoration-1">
            {renderValue(change.oldDisplayValue || change.oldValue)}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center z-10">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:scale-125 transition-transform" />
          </div>
        </div>

        {/* New Value */}
        <div
          className={`relative overflow-hidden rounded-xl p-3 border shadow-sm transition-all ${
            isLine
              ? "bg-indigo-50/20 border-indigo-100 group-hover:bg-indigo-50/40"
              : "bg-white border-slate-200 group-hover:border-indigo-200"
          }`}
        >
          <div
            className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5 ${isLine ? "text-indigo-400" : "text-slate-400"}`}
          >
            New Value
          </div>
          <div
            className={`text-[13px] font-bold ${isLine ? "text-indigo-700" : "text-slate-900"}`}
          >
            {renderValue(change.newDisplayValue || change.newValue)}
          </div>
          {/* Subtle highlight bar */}
          <div
            className={`absolute top-0 right-0 w-1 h-full ${isLine ? "bg-indigo-400/20" : "bg-amber-400/20"}`}
          />
        </div>
      </div>
    </div>
  );
}
