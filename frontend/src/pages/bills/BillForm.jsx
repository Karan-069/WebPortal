import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Receipt,
  AlertCircle,
  FileText,
  Calculator,
  History,
  Info,
} from "lucide-react";
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
import WorkflowTrail from "../../components/common/WorkflowTrail";

// Unified Form Architecture
import FormPage from "../../components/form/FormPage";
import FormHeader from "../../components/form/FormHeader";
import FormSection from "../../components/form/FormSection";
import FormField from "../../components/form/FormField";
import FormActionBar from "../../components/form/FormActionBar";
import { useFormContext } from "../../components/form/FormContext";
import { Accordion } from "../../components/ui/Accordion";

// Zod Schema for validation - reflecting bill.model.js
const billSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  department: z.string().min(1, "Department is required"),
  subsidiary: z.string().optional(),
  invoiceNo: z.string().min(1, "Invoice No is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  invoiceType: z.string().optional(),
  invoiceClassification: z.enum(["opex", "capex"]),
  remarks: z.string().optional(),
  attachmentUrl: z.string().optional(),
  itemDetails: z
    .array(
      z.object({
        itemCode: z.string().min(1, "Item required"),
        uom: z.string().min(1, "UOM required"),
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
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isEdit = !!id && id !== "new";
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [billData, setBillData] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
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
    ["edit", "all", "submit", "approve"].includes(p.toLowerCase()),
  );

  const submitToWorkflow = async () => {
    if (isDirty) {
      toast.error("Please save your changes before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/bills/${id}/submit`);
      toast.success("Bill submitted for approval");
      navigate("/bills");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch bill data if editing
  useEffect(() => {
    if (isEdit) {
      const fetchBill = async () => {
        setLoading(true);
        dispatch(setGlobalLoading(true));
        try {
          const res = await api.get(`/bills/${id}`);
          const data = res.data.data;
          setBillData(data);

          dispatch(
            setPageContext({
              title: `${data.transactionStatus !== "draft" ? "View" : "Edit"} Bill: ${data.transactionId}`,
              actions:
                data.transactionStatus === "draft" && hasEditPermission
                  ? [
                      {
                        label: "Submit for Approval",
                        onClick: submitToWorkflow,
                        variant: "primary",
                      },
                    ]
                  : [],
            }),
          );

          const histRes = await api.get(`/bills/${id}/workflow-history`);
          setHistory(histRes.data.data);

          const formatted = {
            ...data,
            vendor: data.vendor?._id || data.vendor,
            department: data.department?._id || data.department,
            subsidiary: data.subsidiary?._id || data.subsidiary,
            invoiceDate: data.invoiceDate ? data.invoiceDate.split("T")[0] : "",
            billTotalAmount:
              data.billTotalAmount?.$numberDecimal || data.billTotalAmount || 0,
            itemDetails: data.itemDetails.map((item) => ({
              ...item,
              itemCode: item.itemCode?._id || item.itemCode,
              uom: item.uom?._id || item.uom,
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
      };
      fetchBill();
    } else {
      dispatch(
        setPageContext({
          title: "New Expenditure Bill",
          actions: [],
        }),
      );
      setLoading(false);
    }
  }, [id, isEdit, reset, navigate, dispatch, hasEditPermission]);

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
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      const payload = {
        ...values,
        billTotalAmount: totals.grandTotal,
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

  const isReadOnly =
    (billData && billData.transactionStatus !== "draft") || !hasEditPermission;

  const sectionIds = ["header", "items"];

  return (
    <FormPage allSectionIds={sectionIds} defaultOpenSections={sectionIds}>
      <BillFormInner
        isEdit={isEdit}
        isReadOnly={isReadOnly}
        billData={billData}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
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
}) {
  const { expandedIds, setExpandedIds } = useFormContext();

  return (
    <>
      <FormHeader
        title={
          isEdit
            ? isReadOnly
              ? "View Bill"
              : "Edit Bill"
            : "New Expenditure Bill"
        }
        subtitle={billData?.transactionId || "Draft ID: Pending"}
        breadcrumbs={["Expenditure", "Bills", isEdit ? "Detail" : "New"]}
        onBack={() => navigate("/bills")}
      >
        {isEdit && (
          <div className="flex items-center gap-3">
            <CsvDownload
              data={[getValues()]}
              columns={[
                { header: "Trans ID", accessor: "transactionId" },
                { header: "Invoice No", accessor: "invoiceNo" },
                { header: "Amount", accessor: "billTotalAmount" },
                { header: "Status", accessor: "workflowStatus" },
              ]}
              filename={`bill_${id}.csv`}
            />
            <div className="w-px h-6 bg-slate-200" />
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-all px-3 py-2"
            >
              <History className="w-4 h-4" />
              History
            </button>
            {!isReadOnly && (
              <>
                <div className="w-px h-6 bg-slate-200" />
                <button
                  type="button"
                  onClick={submitToWorkflow}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
              </>
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
                required
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
                required
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
                className="md:col-span-2"
                error={errors.vendor}
                required
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
                className="md:col-span-2"
                error={errors.department}
                required
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
                <button
                  type="button"
                  onClick={() =>
                    append({
                      quantity: 0,
                      rate: 0,
                      taxRate: 18,
                      taxAmount: 0,
                      totalAmount: 0,
                    })
                  }
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all p-2 hover:bg-indigo-50 rounded"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense Row
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                      Item *
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left w-32">
                      UOM *
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">
                      Qty *
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-28">
                      Rate *
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-20">
                      Tax %
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">
                      Line Total
                    </th>
                    {!isReadOnly && <th className="px-6 py-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-6 py-3 align-top min-w-[200px]">
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
                      </td>
                      <td className="px-6 py-3 align-top">
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
                      </td>
                      <td className="px-6 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          disabled={isReadOnly}
                          {...register(`itemDetails.${index}.quantity`)}
                          className="w-full h-10 px-2 py-2 text-sm bg-white border border-slate-200 rounded-xl text-right transition-all outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                        />
                      </td>
                      <td className="px-6 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          disabled={isReadOnly}
                          {...register(`itemDetails.${index}.rate`)}
                          className="w-full h-10 px-2 py-2 text-sm bg-white border border-slate-200 rounded-xl text-right transition-all outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                        />
                      </td>
                      <td className="px-6 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          disabled={isReadOnly}
                          {...register(`itemDetails.${index}.taxRate`)}
                          className="w-full h-10 px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-right text-slate-500 font-bold outline-none"
                        />
                      </td>
                      <td className="px-6 py-3 align-top text-right">
                        <div className="h-10 px-2 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl select-none flex items-center justify-end">
                          ₹
                          {fields[index].totalAmount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      {!isReadOnly && (
                        <td className="px-6 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 px-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mt-1 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer of Line Items - Totals Section */}
            <div className="bg-slate-900 text-white p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-1">
                        Taxation Summary
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium capitalize">
                        Values are automatically computed based on standard GST
                        rates and item quantatative definitions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-4">
                  <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">
                      ₹
                      {totals.subTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
                    <span>Total Tax (GST)</span>
                    <span className="font-bold text-indigo-400">
                      + ₹
                      {totals.totalTax.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Grand Total
                    </span>
                    <span className="text-3xl font-black tracking-tighter text-white">
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
          onCancel={() => navigate("/bills")}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          isSubmitting={submitting}
          submitLabel={isEdit ? "Update Draft" : "Save as Draft"}
          cancelLabel={isReadOnly ? "Return to List" : "Discard / Cancel"}
        />
      </form>

      {/* History Panel */}
      <Drawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <WorkflowTrail transactionId={id} transactionModel="bill" />
      </Drawer>
    </>
  );
}
