import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  RefreshCw,
  Receipt,
  History,
  CheckCircle2,
  Clock,
} from "lucide-react";
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
import Button from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { apiRegistry } from "../../config/apiRegistry";
import WorkflowTrailPanel from "../../components/ui/WorkflowTrailPanel";
import WorkflowActionModal from "../../components/ui/WorkflowActionModal";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

export default function BillList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const config = apiRegistry.bill;

  // URL Filters
  const wfStatusFilter = searchParams.get("wfStatus");
  const transactionStatusFilter = searchParams.get("status");

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

  // Permission calculation
  const billMenu = user?.userRole?.menus?.find((m) => {
    const checkId = typeof m.menuId === "object" ? m.menuId?.menuId : m.menuId;
    return checkId?.toLowerCase() === "bill";
  });
  const menuPerms = billMenu?.permissions?.map((p) => p.toLowerCase()) || [];
  const hasPermission = (perm) =>
    menuPerms.includes(perm) || menuPerms.includes("all");
  const hasAddPermission = hasPermission("add");
  const hasEditPermission = hasPermission("edit");
  const hasApprovePermission = hasPermission("approve");

  // Workflow states
  const [isWfOpen, setIsWfOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [activeBillId, setActiveBillId] = useState(null);
  const [activeHistory, setActiveHistory] = useState([]);
  const [actionModal, setActionModal] = useState({
    open: false,
    action: "",
    billId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async (pageNum = 1, currentLimit = limit) => {
    setLoading(true);
    dispatch(setGlobalLoading(true));
    try {
      let queryUrl = `${config.endpoint}?page=${pageNum}&limit=${currentLimit}&search=${search}`;
      if (wfStatusFilter) queryUrl += `&wfStatus=${wfStatusFilter}`;
      if (transactionStatusFilter)
        queryUrl += `&status=${transactionStatusFilter}`;

      const res = await api.get(queryUrl);
      const {
        docs,
        totalPages,
        totalDocs,
        limit: fetchedLimit,
      } = res.data.data;
      setData(docs);
      setPagination({ totalPages, totalDocs, limit: fetchedLimit });
      setPage(pageNum);
      setLimit(fetchedLimit);
    } catch (err) {
      toast.error(err.message || "Failed to fetch bills");
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

  useEffect(() => {
    fetchData(1);
    dispatch(
      setPageContext({
        title: wfStatusFilter
          ? `Bills: ${wfStatusFilter.toUpperCase()}`
          : "Bill Transaction Master",
        actions: [],
      }),
    );
  }, [dispatch, wfStatusFilter, transactionStatusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const openWfTrail = async (billId) => {
    try {
      const res = await api.get(
        `${config.endpoint}/${billId}/workflow-history`,
      );
      setActiveHistory(res.data.data);
      setIsWfOpen(true);
    } catch (err) {
      toast.error("Failed to load workflow trail");
    }
  };

  const openAuditTrail = (mongoId) => {
    setActiveBillId(mongoId);
    setIsAuditOpen(true);
  };

  const handleWorkflowAction = async ({ comments, delegatedToUserId }) => {
    setActionLoading(true);
    try {
      await api.post(
        `${config.endpoint}/${actionModal.billId}/workflow-action`,
        {
          action: actionModal.action,
          comments,
          delegatedToUserId,
        },
      );
      toast.success(`Action '${actionModal.action}' processed successfully`);
      setActionModal({ open: false, action: "", billId: null });
      fetchData(page);
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const submitToWorkflow = async (billId) => {
    try {
      await api.post(`${config.endpoint}/${billId}/submit`);
      toast.success("Bill submitted for approval");
      fetchData(page);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  // Helper to check if current user can take workflow action
  const canAct = (bill) => {
    if (
      bill.transactionStatus !== "submitted" ||
      bill.workflowStatus !== "pending"
    )
      return false;
    // Approvers must have explicit 'approve' or 'all' permission for the bill module
    return hasApprovePermission;
  };

  const columns = config.columns;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Subtle Plate Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-2xl shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 items-center justify-center bg-indigo-50 rounded-xl text-indigo-600 shadow-inner">
              <Receipt size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {config.title}
              </h1>
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] [word-spacing:0.1em] italic">
                Auto-Sequence Enabled
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                Automatic ID Generation Active
              </p>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Manage incoming{" "}
                <span className="text-indigo-600 font-bold">
                  Invoices & Payables
                </span>{" "}
                with full workflow traceability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CsvDownload
              data={data}
              columns={columns}
              filename="bills_export.csv"
            />
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />
            {hasAddPermission && (
              <Button
                onClick={() => navigate(`/bills/new`)}
                variant="primary"
                leftIcon={<Plus size={16} />}
                className="px-6 shadow-lg shadow-indigo-100"
              >
                Create New Bill
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or Invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-medium"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Invoice Details</TableHead>
              <TableHead className="hidden md:table-cell">
                Vendor & Dept
              </TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Stage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
                      <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-sm font-bold text-slate-900 tracking-tight">
                        Fetching Records
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                        Initializing Data Stream
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-20 text-center text-slate-400 italic"
                >
                  No bills found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((bill) => {
                const isPending = bill.workflowStatus === "pending";
                return (
                  <TableRow
                    key={bill._id}
                    onDoubleClick={() =>
                      navigate(`/bills/${bill.transactionId}`)
                    }
                    isClickable={true}
                    className={isPending ? "bg-amber-50/20" : ""}
                  >
                    <TableCell data-label="Transaction ID">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        )}
                        <code className="text-[12px] font-bold font-mono text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
                          {bill.transactionId}
                        </code>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1.5 ml-1">
                        Created{" "}
                        {new Date(bill.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell data-label="Invoice Details">
                      <div className="text-[13px] font-bold text-slate-700">
                        {bill.invoiceNo}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">
                        INV Date:{" "}
                        {bill.invoiceDate
                          ? new Date(bill.invoiceDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" },
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell"
                      data-label="Vendor & Dept"
                    >
                      <div className="text-sm font-medium text-slate-700">
                        {bill.vendor?.fullName}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {bill.department?.deptCode}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" data-label="Amount">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(
                          parseFloat(
                            bill.billTotalAmount?.$numberDecimal ||
                              bill.billTotalAmount ||
                              0,
                          ),
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell"
                      data-label="Status"
                    >
                      <StatusBadge
                        status={bill.workflowStatus || bill.transactionStatus}
                      />
                    </TableCell>
                    <TableCell
                      className="hidden sm:table-cell"
                      data-label="Stage"
                    >
                      <StatusBadge status={bill.currentStageName || "Draft"} />
                    </TableCell>
                    <TableCell className="text-right" data-label="Actions">
                      <div className="flex items-center justify-end gap-1">
                        {bill.transactionStatus === "draft" ? (
                          <>
                            {hasEditPermission && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  navigate(`/bills/${bill.transactionId}`)
                                }
                                className="text-slate-400 hover:text-slate-900"
                                title="Edit Draft"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                submitToWorkflow(bill.transactionId)
                              }
                              className="text-slate-400 hover:text-emerald-600"
                              title="Submit for Approval"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                navigate(`/bills/${bill.transactionId}`)
                              }
                              className="text-slate-400 hover:text-slate-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => openAuditTrail(bill._id)}
                              className="text-slate-400 hover:text-amber-600"
                              title="View Audit History"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => openWfTrail(bill.transactionId)}
                              className="text-slate-400 hover:text-indigo-600"
                              title="View Workflow Trail"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {canAct(bill) && (
                          <div className="w-px h-6 bg-slate-100 mx-1" />
                        )}

                        {canAct(bill) && (
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm ml-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white h-7 px-2 uppercase tracking-[0.15em] [word-spacing:0.1em] shadow-none"
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  action: "approve",
                                  billId: bill.transactionId,
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-[11px] font-bold text-red-600 hover:bg-red-600 hover:text-white h-7 px-2 uppercase tracking-[0.15em] [word-spacing:0.1em] shadow-none"
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  action: "reject",
                                  billId: bill.transactionId,
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          totalDocs={pagination.totalDocs}
          limit={limit}
          onPageChange={(p) => fetchData(p, limit)}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Slide-overs & Modals */}
      <WorkflowTrailPanel
        isOpen={isWfOpen}
        onClose={() => setIsWfOpen(false)}
        history={activeHistory}
      />

      <Drawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={activeBillId} collectionName="bill" />
      </Drawer>

      <WorkflowActionModal
        isOpen={actionModal.open}
        action={actionModal.action}
        isLoading={actionLoading}
        onClose={() =>
          setActionModal({ open: false, action: "", billId: null })
        }
        onConfirm={handleWorkflowAction}
      />
    </div>
  );
}
