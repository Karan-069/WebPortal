import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { apiRegistry } from "../../config/apiRegistry";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../store/features/uiSlice";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import CsvDownload from "../../components/ui/CsvDownload";

// Resolve nested accessor strings like 'stateCode.description'
function getNestedValue(obj, path) {
  if (typeof path === "function") return path(obj);
  if (!path) return "-";
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export default function MasterList() {
  const { module } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const moduleKey = Object.keys(apiRegistry).find(
    (key) =>
      key.toLowerCase() === module?.toLowerCase() ||
      apiRegistry[key].endpoint.replace(/^\//, "").toLowerCase() ===
        module?.toLowerCase(),
  );
  const config = moduleKey ? apiRegistry[moduleKey] : null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
    limit: 10,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if module not in registry
  useEffect(() => {
    if (!config) {
      toast.error(`Module '${module}' not found.`);
      navigate("/dashboard");
    }
  }, [module, config, navigate]);

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    dispatch(setGlobalLoading(true));
    try {
      // No search param — filtering is done on the frontend
      const res = await api.get(`${config.endpoint}?page=${pageNum}&limit=10`);
      const result = res.data.data;

      if (result && result.docs) {
        setData(result.docs);
        setPagination({
          totalPages: result.totalPages || 1,
          totalDocs: result.totalDocs || 0,
          limit: result.limit || 10,
        });
      } else {
        const rawData = Array.isArray(result) ? result : result ? [result] : [];
        setData(rawData);
        setPagination({
          totalPages: 1,
          totalDocs: rawData.length,
          limit: rawData.length || 10,
        });
      }
      setPage(pageNum);
    } catch (err) {
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
      setIsRefreshing(false);
    }
  };

  // Initial load + module change
  useEffect(() => {
    if (config) {
      fetchData(1);
      dispatch(
        setPageContext({
          title: config.title,
          actions: [],
        }),
      );
    }
  }, [module, config]);

  // Frontend filter across all displayed columns using config.columns + getNestedValue
  const filteredData = data.filter(
    (row) =>
      search.trim() === "" ||
      config.columns.some((col) => {
        const val = getNestedValue(row, col.accessor);
        return String(val ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
  );

  const handleSearch = (e) => {
    e.preventDefault(); // prevent page reload on Enter
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`${config.endpoint}/${id}/toggle-status`);
      toast.success("Status updated successfully");
      fetchData(page);
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (!config) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage all {config.title.toLowerCase()} configurations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CsvDownload
            data={data}
            columns={config.columns}
            filename={`${module}_export_${new Date().toISOString().split("T")[0]}.csv`}
          />
          <button
            onClick={() => navigate(`/${module}/new`)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col h-full">
        {/* Card Header (Search & Count) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 pb-3">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-medium"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchData(page);
              }}
              className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${isRefreshing ? "animate-spin-once" : ""}`}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
            {/* Show filtered count when searching, total otherwise */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              {search.trim()
                ? `${filteredData.length} of ${pagination.totalDocs} records`
                : `${pagination.totalDocs} ${pagination.totalDocs === 1 ? "record" : "records"}`}
            </span>
          </div>
        </div>

        {/* Card Content (Table) */}
        <div className="p-6 pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                {config.columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="pb-2 font-medium text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900 group">
                      {col.header}
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                ))}
                <th className="pb-2 font-medium text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse border-b">
                      {config.columns.map((_, idx) => (
                        <td key={idx} className="py-4">
                          <div className="h-4 bg-slate-100 rounded w-24"></div>
                        </td>
                      ))}
                      <td className="py-4">
                        <div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 1}
                    className="py-12 text-center text-slate-400 italic text-sm"
                  >
                    {search
                      ? `No records match "${search}"`
                      : `No records found. Click "Add New" to create one.`}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isInactive = item.isActive === false;
                  const navId = item[config.displayIdField] || item._id;
                  return (
                    <tr
                      key={item._id}
                      className={`border-b last:border-0 transition-colors hover:bg-slate-50 cursor-pointer ${isInactive ? "bg-slate-50/40 opacity-75" : ""}`}
                      onClick={() => navigate(`/${module}/${navId}`)}
                    >
                      {config.columns.map((col, idx) => (
                        <td key={idx} className="py-3 whitespace-nowrap">
                          {col.type === "boolean" ? (
                            <div className="flex items-center gap-2">
                              {isInactive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              )}
                              <StatusBadge
                                status={getNestedValue(item, col.accessor)}
                              />
                            </div>
                          ) : (
                            <span
                              className={`text-sm font-semibold ${isInactive ? "text-slate-500" : "text-slate-700"}`}
                            >
                              {getNestedValue(item, col.accessor) || "-"}
                            </span>
                          )}
                        </td>
                      ))}
                      <td
                        className="py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleStatus(item._id)}
                            title={item.isActive ? "Deactivate" : "Reactivate"}
                            className="p-1.5 border border-transparent rounded hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"
                          >
                            {item.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalDocs={pagination.totalDocs}
            limit={pagination.limit}
            onPageChange={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
