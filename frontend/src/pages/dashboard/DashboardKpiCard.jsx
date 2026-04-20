import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import api from "../../services/api";
import { Loader2 } from "lucide-react";

export default function DashboardKpiCard({ cardConfig }) {
  const navigate = useNavigate();
  const [data, setData] = useState({ value: 0, desc: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dynamically extract the lucide icon, fallback to Database
  const IconComponent = LucideIcons[cardConfig.icon] || LucideIcons.Database;

  useEffect(() => {
    let isMounted = true;
    const fetchMetric = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(cardConfig.apiEndpoint);
        if (isMounted && res.data?.success) {
          setData({
            value: res.data.data?.value || 0,
            desc: res.data.data?.desc || cardConfig.desc || "",
          });
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (cardConfig.apiEndpoint) {
      fetchMetric();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [cardConfig.apiEndpoint]);

  return (
    <div
      onClick={() => navigate(cardConfig.clickRoute)}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h3 className="text-sm font-bold text-slate-500">{cardConfig.title}</h3>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${cardConfig.bgClass}`}
        >
          <IconComponent className={`h-4 w-4 ${cardConfig.colorClass}`} />
        </div>
      </div>
      <div className="p-6 pt-0">
        {loading ? (
          <div className="flex items-center h-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        ) : error ? (
          <div className="text-sm font-medium text-red-400">Failed to load</div>
        ) : (
          <div
            className={`font-mono text-2xl font-bold ${cardConfig.colorClass}`}
          >
            {data.value}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1 min-h-4">
          {loading ? "Crunching numbers..." : data.desc}
        </p>
      </div>
    </div>
  );
}
