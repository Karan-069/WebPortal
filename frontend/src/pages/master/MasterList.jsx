import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useFeatures } from "../../hooks/useFeatures";
import {
  Plus,
  Search,
  RefreshCw,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  History,
  Clock,
} from "lucide-react";
import { apiRegistry } from "../../config/apiRegistry";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../store/features/uiSlice";
import { cn } from "../../lib/utils";
import { hasPermission, getMenuPermissions } from "../../lib/permissions";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import CsvDownload from "../../components/ui/CsvDownload";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

// Resolve nested accessor strings like 'stateCode.description'
function getNestedValue(obj, path) {
  if (typeof path === "function") return path(obj);
  if (!path) return "-";
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export default function MasterList() {
  const { isEnabled } = useFeatures();
  const { module } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuPerms = getMenuPermissions(user, module);

  const moduleKey = apiRegistry
    ? Object.keys(apiRegistry).find(
        (key) =>
          key?.toLowerCase() === module?.toLowerCase() ||
          apiRegistry[key]?.endpoint?.replace(/^\//, "")?.toLowerCase() ===
            module?.toLowerCase(),
      )
    : null;
  const config = moduleKey ? apiRegistry[moduleKey] : null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDocs: 0,
    limit: 10,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfOpen, setIsWfOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState(null);

  // Debounced search effect
  useEffect(() => {
    if (!config) return;

    const handler = setTimeout(() => {
      fetchData(1, limit, search);
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [search, config]);

  // Initial load + module change
  useEffect(() => {
    if (config) {
      setPage(1);
      setLimit(10);
      setSearch(""); // Clear search on module change
      dispatch(
        setPageContext({
          title: config.title,
          actions: [],
        }),
      );
    }
  }, [module, config]);

  const fetchData = async (
    pageNum = 1,
    currentLimit = limit,
    searchTerm = search,
  ) => {
    setLoading(true);
    dispatch(setGlobalLoading(true));
    try {
      const res = await api.get(
        `${config.endpoint}?page=${pageNum}&limit=${currentLimit}&search=${searchTerm}`,
      );
      const fetchedData = res.data.data;

      if (fetchedData && (fetchedData.docs || Array.isArray(fetchedData))) {
        setData(
          Array.isArray(fetchedData) ? fetchedData : fetchedData.docs || [],
        );
        setPagination({
          totalPages: fetchedData.totalPages || 1,
          totalDocs: fetchedData.totalDocs || 0,
          limit: currentLimit,
        });
      } else {
        const rawData = fetchedData ? [fetchedData] : [];
        setData(rawData);
        setPagination({
          totalPages: 1,
          totalDocs: rawData.length,
          limit: rawData.length || currentLimit,
        });
      }
      setPage(pageNum);
      setLimit(currentLimit);
    } catch (err) {
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
      setIsRefreshing(false);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    fetchData(1, newLimit);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1);
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

  const openAuditTrail = (id) => {
    setActiveRecordId(id);
    setIsHistoryOpen(true);
  };

  const openWfTrail = (id) => {
    setActiveRecordId(id);
    setIsWfOpen(true);
  };

  if (!config) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-full">
      {/* Premium Subtle Plate Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-2xl shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {config.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Manage and monitor all{" "}
              <span className="text-indigo-600 font-bold">
                {config.title.toLowerCase()}
              </span>{" "}
              records across the system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CsvDownload
              data={data}
              columns={config.columns}
              filename={`${module}_export_${new Date().toISOString().split("T")[0]}.csv`}
            />
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />
            {(!config?.featureFlags?.creation ||
              isEnabled(config.featureFlags.creation)) &&
              hasPermission(menuPerms, "add") && (
                <Button
                  onClick={() => navigate(`/${module}/new`)}
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  className="px-6 shadow-lg shadow-indigo-100"
                >
                  Add New Record
                </Button>
              )}
          </div>
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
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setIsRefreshing(true);
                fetchData(page);
              }}
              className="w-9 h-9"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-slate-400",
                  isRefreshing && "animate-spin",
                )}
              />
            </Button>
          </div>
        </div>

        {/* Card Content (Table) */}
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={col.className}
                  style={{
                    minWidth: col.minWidth ? `${col.minWidth}px` : "auto",
                  }}
                >
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900 group">
                    {col.header}
                    <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {config.columns.map((_, idx) => (
                      <TableCell key={idx}>
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={config.columns.length + 1}
                  className="py-12 text-center text-slate-400 italic"
                >
                  {search
                    ? `No records match "${search}"`
                    : `No records found. Click "Add New" to create one.`}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const isInactive = item.isActive === false;
                const navId = item[config.displayIdField] || item._id;
                return (
                  <TableRow
                    key={item._id}
                    isClickable={true}
                    className={isInactive ? "opacity-75 bg-slate-50/40" : ""}
                    onClick={() => navigate(`/${module}/${navId}`)}
                  >
                    {config.columns.map((col, idx) => (
                      <TableCell
                        key={idx}
                        className={col.className}
                        data-label={col.header}
                      >
                        {col.type === "boolean" || col.type === "badge" ? (
                          <div className="flex items-center gap-2">
                            <StatusBadge
                              status={getNestedValue(item, col.accessor)}
                            />
                          </div>
                        ) : col.type === "date" ? (
                          <div className="text-[13px] text-slate-600 font-medium">
                            {(() => {
                              const val = getNestedValue(item, col.accessor);
                              if (!val) return "-";
                              const d = new Date(val);
                              return isFinite(d)
                                ? format(d, "dd-MMM-yyyy")
                                : String(val);
                            })()}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "truncate",
                              isInactive ? "text-slate-400" : "text-slate-700",
                              col.className,
                            )}
                            style={{
                              maxWidth: col.maxWidth
                                ? `${col.maxWidth}px`
                                : "none",
                            }}
                            title={String(getNestedValue(item, col.accessor))}
                          >
                            {(() => {
                              const val = getNestedValue(item, col.accessor);
                              const isCode =
                                col.header?.toLowerCase().includes("code") ||
                                col.header?.toLowerCase().includes("id") ||
                                (typeof col.accessor === "string" &&
                                  col.accessor.toLowerCase().includes("code"));

                              if (
                                val &&
                                typeof val === "object" &&
                                !Array.isArray(val)
                              ) {
                                return (
                                  val.description ||
                                  val.fullName ||
                                  val.name ||
                                  val.code ||
                                  val._id ||
                                  "[Object]"
                                );
                              }

                              if (isCode && val) {
                                return (
                                  <code className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50 inline-block">
                                    {String(val)}
                                  </code>
                                );
                              }

                              return val || "-";
                            })()}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      className="text-right"
                      data-label="Actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openAuditTrail(item._id)}
                          className="text-slate-400 hover:text-amber-600"
                          title="View Audit History"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        {config.featureFlags?.workflow &&
                          isEnabled(config.featureFlags.workflow) && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => openWfTrail(item._id)}
                              className="text-slate-400 hover:text-indigo-600"
                              title="View Workflow Trail"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => toggleStatus(item._id)}
                          className="text-slate-400 hover:text-slate-900"
                          title={item.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {item.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="p-6 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalDocs={pagination.totalDocs}
            limit={limit}
            onPageChange={(p) => fetchData(p, limit)}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={activeRecordId} collectionName={moduleKey} />
      </Drawer>

      <Drawer
        isOpen={isWfOpen}
        onClose={() => setIsWfOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail
          transactionId={activeRecordId}
          transactionModel={moduleKey}
        />
      </Drawer>
    </div>
  );
}
