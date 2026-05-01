import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useFeatures } from "../../hooks/useFeatures";
import { useWorkflowState } from "../../hooks/useWorkflowState";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight,
  Save,
  Send,
  X,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Calculator,
  History,
  Info,
  CheckCircle,
  XCircle,
  ChevronDown,
  HelpCircle,
  UserPlus,
  RefreshCcw,
  Edit,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../store/features/uiSlice";
// Core UI Components
import { cn } from "../../lib/utils";
import StatusBadge from "../../components/ui/StatusBadge";
import Drawer from "../../components/ui/Drawer";
import AsyncSelect from "../../components/ui/AsyncSelect";
import CsvDownload from "../../components/ui/CsvDownload";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import WorkflowActionDialog from "../../components/common/WorkflowActionDialog";
import Button from "../../components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

// Unified Form Architecture
import FormPage from "../../components/form/FormPage";
import FormHeader from "../../components/form/FormHeader";
import FormSection from "../../components/form/FormSection";
import FormField from "../../components/form/FormField";
import FormActionBar from "../../components/form/FormActionBar";
import { useFormContext } from "../../components/form/FormContext";
import { Accordion } from "../../components/ui/Accordion";

// Helper schema to allow either a string ID or a populated object for lookups (AsyncSelect)
const lookupSchema = z.union([
  z.string().min(1, "Required"),
  z.object({ _id: z.string() }).passthrough(),
]);

// Zod Schema for validation - reflecting bill.model.js
const billSchema = z.object({
  vendor: lookupSchema,
  department: lookupSchema,
  subsidiary: lookupSchema.optional(),
  invoiceNo: z.string().min(1, "Invoice No is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  invoiceType: z.string().optional(),
  invoiceClassification: z.enum(["opex", "capex"]),
  remarks: z.string().optional(),
  attachmentUrl: z.string().optional(),
  itemDetails: z
    .array(
      z.object({
        itemCode: lookupSchema,
        uom: lookupSchema,
        quantity: z.coerce.number().min(0.01, "Min 0.01"),
        rate: z.coerce.number().min(0.01, "Min 0.01"),
        taxRate: z.coerce.number().min(0).max(100),
        taxAmount: z.coerce.number().optional(),
        totalAmount: z.coerce.number().optional(),
        remarks: z.string().optional(),
      }),
    )
    .min(1, "At least one item is required"),
});

export default function BillForm() {
  const { id: rawId } = useParams();
  const id =
    typeof rawId === "string"
      ? rawId.replace(/^"(.*)"$/, "$1").replace(/"/g, "")
      : rawId;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isEnabled } = useFeatures();
  const { user } = useSelector((state) => state.auth);
  const isEdit = !!id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);

  // Sync viewing mode with route changes
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [billData, setBillData] = useState(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [wfComments, setWfComments] = useState("");
  const [isActioning, setIsActioning] = useState(false);
  const [isAmending, setIsAmending] = useState(false);
  const [delegatedToUserId, setDelegatedToUserId] = useState(null);
  const { workflowState, refresh: refreshWf } = useWorkflowState(
    billData?._id,
    "Bill",
  );

  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: {
      invoiceClassification: "opex",
      itemDetails: [
        { quantity: 0, rate: 0, taxRate: 18, taxAmount: 0, totalAmount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemDetails",
  });

  // Watch items for auto-calc
  const watchItems = useWatch({
    control,
    name: "itemDetails",
  });

  // Determine permissions early for use in header actions
  const billMenu = user?.userRole?.menus?.find((m) => {
    const mid = typeof m.menuId === "object" ? m.menuId?._id : m.menuId;
    return (
      mid === "bills" ||
      mid?.toString().toLowerCase() === "bills" ||
      mid === "bill"
    );
  });
  const hasEditPermission = billMenu?.permissions?.some((p) =>
    ["edit", "all"].includes(p.toLowerCase()),
  );

  const submitToWorkflow = async () => {
    if (isDirty) {
      toast.error("Please save your changes before submitting");
      return;
    }
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      await api.post(`/bills/${id}/submit`);
      toast.success("Bill submitted for approval");
      refreshWf();
      fetchBill();
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const handleWorkflowAction = async () => {
    if (!activeAction) return;
    setIsActioning(true);
    dispatch(setGlobalLoading(true));
    try {
      const payload = {
        transactionId: billData._id,
        transactionModel: "Bill",
        action: activeAction,
        comments: wfComments,
      };

      if (activeAction === "delegate") {
        payload.delegatedToUserId = delegatedToUserId;
      }

      await api.post(`/workflows/action`, payload);
      toast.success(`Bill ${activeAction?.replace("_", " ")}d successfully`);
      setIsActionDialogOpen(false);
      setWfComments("");
      setDelegatedToUserId(null);
      refreshWf();
      fetchBill();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsActioning(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const handleAmend = async () => {
    setIsAmending(true);
    dispatch(setGlobalLoading(true));
    try {
      await api.post("/workflows/amend", {
        transactionId: billData._id,
        transactionModel: "Bill",
      });
      toast.success("Transaction amended successfully. You can now edit.");
      fetchBill();
      refreshWf();
      setIsViewing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Amendment failed");
    } finally {
      setIsAmending(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const fetchBill = async () => {
    if (isEdit) {
      setLoading(true);
      dispatch(setGlobalLoading(true));
      try {
        const res = await api.get(`/bills/${id}`);
        const data = res.data.data;
        setBillData(data);

        const histRes = await api.get(`/bills/${id}/workflow-history`);
        setHistory(histRes.data.data);

        const formatted = {
          ...data,
          vendor: data.vendor,
          department: data.department,
          subsidiary: data.subsidiary,
          invoiceDate: data.invoiceDate ? data.invoiceDate.split("T")[0] : "",
          billTotalAmount:
            data.billTotalAmount?.$numberDecimal || data.billTotalAmount || 0,
          itemDetails: data.itemDetails.map((item) => ({
            ...item,
            itemCode: item.itemCode,
            uom: item.uom,
            quantity: item.quantity,
            rate: item.rate?.$numberDecimal || item.rate || 0,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount?.$numberDecimal || item.taxAmount || 0,
            totalAmount:
              item.totalAmount?.$numberDecimal || item.totalAmount || 0,
          })),
        };
        reset(formatted);
      } catch (err) {
        toast.error("Failed to load bill data");
      } finally {
        setLoading(false);
        dispatch(setGlobalLoading(false));
      }
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id, isEdit]);

  // Set Page Context Actions
  useEffect(() => {
    const headerActions = [];

    // canEdit from workflow overrides menu-level permission (e.g. for Approvers with mandatory fields)
    const canEditThisRecord =
      workflowState?.canEdit ||
      (hasEditPermission &&
        (!billData?.transactionStatus ||
          ["draft", "rejected", "recalled"].includes(
            billData?.transactionStatus,
          )));

    if (isEdit && isViewing && canEditThisRecord) {
      headerActions.push({
        label: "Edit",
        onClick: () => setIsViewing(false),
        variant: "primary",
        icon: "edit",
      });
    }

    if (!isViewing) {
      headerActions.push({
        label: "Cancel",
        onClick: () => {
          if (isEdit) {
            setIsViewing(true);
            fetchBill();
          } else {
            navigate("/bills");
          }
        },
        variant: "secondary",
      });
      headerActions.push({
        label: isEdit ? "Update" : "Create",
        onClick: () => handleSubmit(onSubmit)(),
        variant: "primary",
        icon: "save",
      });
    }

    dispatch(
      setPageContext({
        title: isEdit
          ? `${isViewing ? "View" : "Edit"} Bill: ${billData?.transactionId || id}`
          : "New Expenditure Bill",
        actions: headerActions,
      }),
    );
  }, [
    isEdit,
    id,
    isViewing,
    billData,
    workflowState,
    hasEditPermission,
    dispatch,
    navigate,
  ]);

  // Total Calculation Logic
  const totals = useMemo(() => {
    let subTotal = 0;
    let totalTax = 0;

    const calculatedItems =
      watchItems?.map((item, idx) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const taxR = parseFloat(item.taxRate) || 0;

        const lineSub = qty * rate;
        const lineTax = lineSub * (taxR / 100);
        const lineTotal = lineSub + lineTax;

        subTotal += lineSub;
        totalTax += lineTax;

        return { lineTax, lineTotal };
      }) || [];

    return {
      subTotal,
      totalTax,
      grandTotal: subTotal + totalTax,
      calculatedItems,
    };
  }, [watchItems]);

  // Update hidden calc fields
  useEffect(() => {
    totals.calculatedItems.forEach((calc, idx) => {
      if (watchItems[idx]) {
        // Only update if changed to avoid loop
        if (watchItems[idx].taxAmount !== calc.lineTax)
          setValue(`itemDetails.${idx}.taxAmount`, calc.lineTax);
        if (watchItems[idx].totalAmount !== calc.lineTotal)
          setValue(`itemDetails.${idx}.totalAmount`, calc.lineTotal);
      }
    });
  }, [totals, setValue]);

  const onSubmit = async (values) => {
    // Dynamic Mandatory Fields Check (Stage-specific)
    const missingFields = (workflowState?.mandatoryFields || []).filter((f) => {
      const val = values[f];
      return val === undefined || val === null || val === "";
    });

    if (missingFields.length > 0) {
      const labelMap = {
        invoiceDate: "Invoice Date",
        invoiceNo: "Invoice No",
        subsidiary: "Subsidiary",
        vendor: "Vendor",
        department: "Department",
      };
      const labels = missingFields.map((f) => labelMap[f] || f);
      toast.error(`Workflow Mandatory Fields Missing: ${labels.join(", ")}`);
      return;
    }

    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      const flattenLookup = (val) => {
        if (val && typeof val === "object" && val._id) return val._id;
        if (val === "" || val === undefined || val === null) return null;
        return val;
      };

      const payload = {
        ...values,
        billTotalAmount: totals.grandTotal,
        vendor: flattenLookup(values.vendor),
        department: flattenLookup(values.department),
        subsidiary: flattenLookup(values.subsidiary),
        itemDetails: values.itemDetails.map((item) => ({
          ...item,
          itemCode: flattenLookup(item.itemCode),
          uom: flattenLookup(item.uom),
        })),
      };

      if (isEdit) {
        await api.patch(`/bills/${id}`, payload);
        toast.success("Bill saved successfully");
      } else {
        const res = await api.post("/bills", payload);
        toast.success("Bill created as draft");
        navigate(`/bills/${res.data.data.transactionId}`);
      }
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSubmitting(false);
      dispatch(setGlobalLoading(false));
    }
  };

  if (loading) return null;

  const isLockedByWf =
    billData?.transactionStatus &&
    !["draft", "rejected", "recalled"].includes(billData.transactionStatus) &&
    !workflowState?.canEdit;
  const isReadOnly = isViewing || !hasEditPermission || isLockedByWf;

  const sectionIds = ["header", "items"];

  return (
    <FormPage allSectionIds={sectionIds} defaultOpenSections={sectionIds}>
      <BillFormInner
        isEdit={isEdit}
        isReadOnly={isReadOnly}
        billData={billData}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        isWfTrailOpen={isWfTrailOpen}
        setIsWfTrailOpen={setIsWfTrailOpen}
        submitting={submitting}
        submitToWorkflow={submitToWorkflow}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        control={control}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
        totals={totals}
        getValues={getValues}
        isDirty={isDirty}
        id={id}
        navigate={navigate}
        isEnabled={isEnabled}
        watch={watch}
        workflowState={workflowState}
        isActionDialogOpen={isActionDialogOpen}
        setIsActionDialogOpen={setIsActionDialogOpen}
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        wfComments={wfComments}
        setWfComments={setWfComments}
        isActioning={isActioning}
        handleWorkflowAction={handleWorkflowAction}
        handleAmend={handleAmend}
        delegatedToUserId={delegatedToUserId}
        setDelegatedToUserId={setDelegatedToUserId}
      />
    </FormPage>
  );
}

function BillFormInner({
  isEdit,
  isReadOnly,
  billData,
  historyOpen,
  setHistoryOpen,
  isWfTrailOpen,
  setIsWfTrailOpen,
  submitting,
  submitToWorkflow,
  handleSubmit,
  onSubmit,
  register,
  control,
  errors,
  fields,
  append,
  remove,
  totals,
  getValues,
  isDirty,
  id,
  navigate,
  isEnabled,
  watch,
  workflowState,
  isActionDialogOpen,
  setIsActionDialogOpen,
  activeAction,
  setActiveAction,
  wfComments,
  setWfComments,
  isActioning,
  handleWorkflowAction,
  handleAmend,
  delegatedToUserId,
  setDelegatedToUserId,
}) {
  const { expandedIds, setExpandedIds } = useFormContext();
  const checkMandatory = (name, base = false) =>
    base || workflowState?.mandatoryFields?.includes(name);

  return (
    <>
      <FormHeader
        title={
          isEdit ? (
            <div className="flex items-center gap-2">
              {isReadOnly ? "View Bill" : "Edit Bill"}
              {billData?.transactionId && (
                <code className="text-[0.7em] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {billData.transactionId}
                </code>
              )}
            </div>
          ) : (
            "New Expenditure Bill"
          )
        }
        subtitle={
          isEdit && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Status:
                </span>
                <StatusBadge status={billData?.transactionStatus || "Draft"} />
              </div>

              {isEnabled("WF_BILL") && workflowState?.currentStageName && (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Stage:
                  </span>
                  <StatusBadge status={workflowState.currentStageName} />
                </div>
              )}

              <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Amount:
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  ₹
                  {(
                    billData?.billTotalAmount?.$numberDecimal ||
                    billData?.billTotalAmount ||
                    0
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )
        }
        breadcrumbs={["Expenditure", "Bills", isEdit ? "Detail" : "New"]}
        onBack={() => navigate("/bills")}
      >
        {isEdit && (
          <div className="flex items-center gap-4">
            <CsvDownload
              data={[billData]}
              columns={[
                { header: "Trans ID", accessor: "transactionId" },
                { header: "Invoice No", accessor: "invoiceNo" },
                { header: "Amount", accessor: "billTotalAmount" },
                { header: "Status", accessor: "workflowStatus" },
                { header: "Stage", accessor: "currentStageName" },
              ]}
              filename={`bill_${id}.csv`}
            />
            <div className="w-px h-6 bg-slate-200" />
            {isEnabled("WF_BILL") && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryOpen(true)}
                  leftIcon={<History className="w-4 h-4" />}
                  className="text-slate-500 hover:text-slate-900"
                >
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWfTrailOpen(true)}
                  leftIcon={<Send className="w-4 h-4 text-amber-500" />}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Workflow Trail
                </Button>
              </div>
            )}
          </div>
        )}
      </FormHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="multiple"
          value={expandedIds}
          onValueChange={setExpandedIds}
          className="space-y-6"
        >
          {/* Basic Information Section */}
          <FormSection id="header" title="Transaction Header" icon="Info">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
              <FormField
                label="Invoice Date"
                error={errors.invoiceDate}
                className="md:col-span-1"
                required={checkMandatory("invoiceDate", true)}
              >
                <input
                  type="date"
                  disabled={isReadOnly}
                  {...register("invoiceDate")}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 disabled:opacity-70",
                    errors.invoiceDate && "border-red-300",
                  )}
                />
              </FormField>

              <FormField
                label="Invoice No"
                error={errors.invoiceNo}
                className="md:col-span-1"
                required={checkMandatory("invoiceNo", true)}
              >
                <input
                  type="text"
                  disabled={isReadOnly}
                  {...register("invoiceNo")}
                  placeholder="INV-XXX"
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 disabled:opacity-70",
                    errors.invoiceNo && "border-red-300",
                  )}
                />
              </FormField>

              <FormField label="Classification" className="md:col-span-1">
                <select
                  disabled={isReadOnly}
                  {...register("invoiceClassification")}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 disabled:opacity-70"
                >
                  <option value="opex">OPEX</option>
                  <option value="capex">CAPEX</option>
                </select>
              </FormField>

              <FormField
                label="Subsidiary"
                className="md:col-span-1"
                error={errors.subsidiary}
                required={checkMandatory("subsidiary")}
              >
                <Controller
                  name="subsidiary"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AsyncSelect
                      endpoint="/subsidaries"
                      placeholder="Select Entity..."
                      value={value}
                      onChange={onChange}
                      disabled={isReadOnly}
                      error={errors.subsidiary}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Vendor"
                className="md:col-span-1"
                error={errors.vendor}
                required={checkMandatory("vendor")}
              >
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AsyncSelect
                      endpoint="/vendors"
                      placeholder="Search Vendor..."
                      labelField="fullName"
                      value={value}
                      onChange={onChange}
                      disabled={isReadOnly}
                      error={errors.vendor}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Department"
                className="md:col-span-1"
                error={errors.department}
                required={checkMandatory("department")}
              >
                <Controller
                  name="department"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <AsyncSelect
                      endpoint="/departments"
                      placeholder="Search Department..."
                      value={value}
                      onChange={onChange}
                      disabled={isReadOnly}
                      error={errors.department}
                    />
                  )}
                />
              </FormField>

              <FormField label="Remarks" className="md:col-span-4">
                <textarea
                  disabled={isReadOnly}
                  {...register("remarks")}
                  rows={1}
                  placeholder="Internal notes about this expenditure..."
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 disabled:opacity-70 resize-none"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Line Items Section */}
          <FormSection
            id="items"
            title="Line Item Details"
            icon="Calculator"
            className="p-0"
          >
            {!isReadOnly && (
              <div className="flex justify-end p-4 border-b border-slate-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      quantity: 0,
                      rate: 0,
                      taxRate: 18,
                      taxAmount: 0,
                      totalAmount: 0,
                    })
                  }
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest"
                >
                  Add Expense Row
                </Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                      Item *
                    </div>
                  </TableHead>
                  <TableHead className="text-left w-32">UOM *</TableHead>
                  <TableHead className="text-right w-24">Qty *</TableHead>
                  <TableHead className="text-right w-28">Rate *</TableHead>
                  <TableHead className="text-right w-20">Tax %</TableHead>
                  <TableHead className="text-right w-32">Line Total</TableHead>
                  {!isReadOnly && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="align-top min-w-[200px]">
                      <Controller
                        name={`itemDetails.${index}.itemCode`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <AsyncSelect
                            endpoint="/items"
                            placeholder="Item..."
                            value={value}
                            onChange={onChange}
                            disabled={isReadOnly}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <Controller
                        name={`itemDetails.${index}.uom`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <AsyncSelect
                            endpoint="/uoms"
                            placeholder="UOM..."
                            value={value}
                            onChange={onChange}
                            disabled={isReadOnly}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={isReadOnly}
                        {...register(`itemDetails.${index}.quantity`)}
                        className="w-full h-10 px-2 py-2 text-sm bg-white border border-slate-200 rounded-xl text-right transition-all outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={isReadOnly}
                        {...register(`itemDetails.${index}.rate`)}
                        className="w-full h-10 px-2 py-2 text-sm bg-white border border-slate-200 rounded-xl text-right transition-all outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <input
                        type="number"
                        min="0"
                        disabled={isReadOnly}
                        {...register(`itemDetails.${index}.taxRate`)}
                        className="w-full h-10 px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-right text-slate-500 font-bold outline-none"
                      />
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="h-10 px-2 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl select-none flex items-center justify-end">
                        ₹
                        {fields[index].totalAmount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="align-top">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => remove(index)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer of Line Items - Totals Section */}
            <div className="bg-slate-100/80 p-8 border-t border-slate-200/60 relative overflow-hidden">
              {/* Decorative Accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4 text-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-1 text-slate-900">
                        Taxation Summary
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium capitalize">
                        Values are automatically computed based on standard GST
                        rates and item quantatative definitions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-4">
                  <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">
                      ₹
                      {totals.subTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
                    <span>Total Tax (GST)</span>
                    <span className="font-bold text-indigo-600">
                      + ₹
                      {totals.totalTax.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Grand Total
                    </span>
                    <span className="text-3xl font-black tracking-[0.1em] text-indigo-600">
                      ₹
                      {totals.grandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </Accordion>

        <FormActionBar
          isDirty={isDirty}
          isSubmitting={submitting}
          onCancel={() => navigate("/bills")}
          submitLabel={isEdit ? "Save as Draft" : "Create Record"}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          cancelLabel="Return to List"
        >
          {/* Integrated Workflow Actions - Enterprise Flow */}
          <div className="flex items-center gap-2 mr-4">
            {/* 1. Submission Flow */}
            {isEnabled("WF_BILL") &&
              isEdit &&
              isViewing &&
              (!billData?.transactionStatus ||
                ["draft", "rejected", "recalled"].includes(
                  billData?.transactionStatus?.toLowerCase(),
                )) && (
                <Button
                  type="button"
                  variant="primary"
                  className="bg-amber-600 hover:bg-amber-700 border-none"
                  onClick={submitToWorkflow}
                  size="sm"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit for Approval
                </Button>
              )}

            {/* 2. Approval Flow */}
            {isViewing && (
              <>
                {workflowState?.canApprove && (
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 border-none"
                    onClick={() => {
                      setActiveAction("approve");
                      setIsActionDialogOpen(true);
                    }}
                    size="sm"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Approve
                  </Button>
                )}
                {workflowState?.canReject && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setActiveAction("reject");
                      setIsActionDialogOpen(true);
                    }}
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                )}

                {(workflowState?.canAction || workflowState?.canDelegate) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        Workflow Actions
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {workflowState?.canAction && (
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveAction("clarify");
                            setIsActionDialogOpen(true);
                          }}
                        >
                          <HelpCircle className="w-4 h-4 mr-2 text-amber-500" />
                          Request Clarification
                        </DropdownMenuItem>
                      )}
                      {workflowState?.canDelegate && (
                        <DropdownMenuItem
                          onClick={() => {
                            setActiveAction("delegate");
                            setIsActionDialogOpen(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2 text-indigo-500" />
                          Delegate Transaction
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            {/* 3. Clarification Flow */}
            {workflowState?.status === "clarification_requested" &&
              isViewing && (
                <Button
                  type="button"
                  variant="primary"
                  className="bg-indigo-600 hover:bg-indigo-700 border-none"
                  onClick={() => {
                    setActiveAction("clarification_provided");
                    setIsActionDialogOpen(true);
                  }}
                  size="sm"
                  leftIcon={<RefreshCcw className="w-4 h-4" />}
                >
                  Provide Clarification
                </Button>
              )}

            {/* 4. Amendment Flow */}
            {isViewing &&
              ["approved", "rejected"].includes(
                billData?.transactionStatus?.toLowerCase(),
              ) && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={handleAmend}
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Amend Transaction
                </Button>
              )}
          </div>
        </FormActionBar>
      </form>

      <WorkflowActionDialog
        isOpen={isActionDialogOpen}
        onClose={setIsActionDialogOpen}
        action={activeAction}
        comments={wfComments}
        setComments={setWfComments}
        onConfirm={handleWorkflowAction}
        isLoading={isActioning}
        delegatedToUserId={delegatedToUserId}
        setDelegatedToUserId={setDelegatedToUserId}
      />

      <Drawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={billData?._id} collectionName="bill" />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail transactionId={billData?._id} transactionModel="Bill" />
      </Drawer>
    </>
  );
}
