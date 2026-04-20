import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  Save,
  X,
  Database,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Edit2,
  History,
  Send,
  RotateCcw,
  Plus as PlusIcon,
  Trash2,
  HelpCircle,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { apiRegistry } from "../../config/apiRegistry";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../store/features/uiSlice";
import AsyncSelect from "../../components/ui/AsyncSelect";
import CsvDownload from "../../components/ui/CsvDownload";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import { format } from "date-fns";

// Core UI Components
import { cn } from "../../lib/utils";
import StatusBadge from "../../components/ui/StatusBadge";
import { Checkbox } from "../../components/ui/Checkbox";
import { Switch } from "../../components/ui/Switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";

// Unified Form Architecture
import FormPage from "../../components/form/FormPage";
import FormHeader from "../../components/form/FormHeader";
import FormSection from "../../components/form/FormSection";
import FormField from "../../components/form/FormField";
import FormActionBar from "../../components/form/FormActionBar";
import { useFormContext } from "../../components/form/FormContext";
import { Accordion } from "../../components/ui/Accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/DropdownMenu";

export default function MasterForm() {
  const { module, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const moduleKey = Object.keys(apiRegistry).find(
    (key) =>
      key.toLowerCase() === module?.toLowerCase() ||
      apiRegistry[key].endpoint.replace(/^\//, "").toLowerCase() ===
        module?.toLowerCase(),
  );
  const config = moduleKey ? apiRegistry[moduleKey] : null;
  const isEdit = !!id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);

  // Sync viewing mode with route
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);
  const [recordData, setRecordData] = useState(null);
  const [isAmending, setIsAmending] = useState(false);
  const [isConfirmAmendOpen, setIsConfirmAmendOpen] = useState(false);

  const useSections = config?.formSections && config.formSections.length > 0;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: config && config.schema ? zodResolver(config.schema) : undefined,
    defaultValues: { isActive: true },
  });

  // Watch for dynamic changes in field dependencies
  const watchAllFields = watch();

  const menu = user?.userRole?.menus?.find((m) => {
    const checkId = typeof m.menuId === "object" ? m.menuId?.menuId : m.menuId;
    return checkId === moduleKey || checkId === module;
  });

  const hasEditPermission = menu?.permissions?.some((p) =>
    ["edit", "all", "submit", "approve"].includes(p.toLowerCase()),
  );

  const status =
    recordData?.transactionStatus || recordData?.workflowStatus || "draft";
  const isLocked = [
    "submitted",
    "approved",
    "completed",
    "pending_approval",
    "pending",
  ].includes(status.toLowerCase());
  const isReadOnly = isViewing || !hasEditPermission || isLocked;

  // Redirect if module not found
  useEffect(() => {
    if (!config) {
      toast.error(`Module '${module}' not found.`);
      navigate("/dashboard");
    }
  }, [module, config, navigate]);

  // Ref to programmatically submit the form from header Save button
  const formRef = React.useRef(null);

  // Set Page Context Title & Actions
  useEffect(() => {
    if (config) {
      const mode = id === "new" ? "New" : isViewing ? "View" : "Edit";

      const headerActions = [];

      if (isEdit && isViewing && hasEditPermission && !isLocked) {
        headerActions.push({
          label: "Edit",
          onClick: () => navigate(`/${module}/${id}/edit`),
          variant: "primary",
        });
      }

      if (!isViewing && !isReadOnly) {
        headerActions.push({
          label: "Cancel",
          onClick: () => (isEdit ? setIsViewing(true) : navigate(`/${module}`)),
          variant: "secondary",
        });
        headerActions.push({
          label: isEdit ? "Update" : "Save",
          onClick: () => formRef.current?.requestSubmit(),
          variant: "primary",
          icon: "save",
        });
      }

      dispatch(
        setPageContext({
          title: isEdit
            ? `${isViewing ? "View" : "Edit"} ${config.singularTitle || config.title}`
            : `Add New ${config.singularTitle || config.title}`,
          actions: headerActions,
        }),
      );
    }
  }, [
    module,
    config,
    id,
    isViewing,
    dispatch,
    hasEditPermission,
    isLocked,
    isReadOnly,
  ]);

  const fetchRecord = async () => {
    if (isEdit && config) {
      setLoading(true);
      dispatch(setGlobalLoading(true));
      try {
        const res = await api.get(`${config.endpoint}/${id}`);
        const data = res.data.data;
        setRecordData(data);

        const formData = { ...data };

        // ── Audit fields → display strings ──────────────────────────────────
        if (data.createdBy && typeof data.createdBy === "object")
          formData.createdBy = data.createdBy.fullName || data.createdBy._id;
        if (data.updatedBy && typeof data.updatedBy === "object")
          formData.updatedBy = data.updatedBy.fullName || data.updatedBy._id;
        if (data.approvedBy && typeof data.approvedBy === "object")
          formData.approvedBy = data.approvedBy.fullName || data.approvedBy._id;

        if (data.createdAt)
          formData.createdAt = format(
            new Date(data.createdAt),
            "dd-MMM-yyyy HH:mm:ss",
          );
        if (data.updatedAt)
          formData.updatedAt = format(
            new Date(data.updatedAt),
            "dd-MMM-yyyy HH:mm:ss",
          );
        if (data.approvedDate)
          formData.approvedDate = format(
            new Date(data.approvedDate),
            "dd-MMM-yyyy HH:mm:ss",
          );

        // ── AsyncSelect fields → extract _id only ───────────────────────────
        const allFields = useSections
          ? config.formSections.flatMap((s) => s.fields)
          : config.formFields || [];

        const asyncSelectFieldNames = new Set(
          allFields.filter((f) => f.type === "asyncSelect").map((f) => f.name),
        );

        allFields.forEach((field) => {
          if (
            field.type === "asyncSelect" &&
            formData[field.name] &&
            typeof formData[field.name] === "object"
          ) {
            formData[field.name] = formData[field.name]._id;
          }
        });

        // ── Safe flattening — only unexpected remaining populated objects ────
        const auditFields = new Set([
          "createdBy",
          "updatedBy",
          "approvedBy",
          "createdAt",
          "updatedAt",
          "approvedDate",
        ]);

        Object.keys(formData).forEach((key) => {
          if (auditFields.has(key)) return; // already handled
          if (asyncSelectFieldNames.has(key)) return; // already extracted _id

          const val = formData[key];

          if (Array.isArray(val)) return; // leave arrays untouched
          if (!val || typeof val !== "object" || val instanceof Date) return;

          if (val._id) formData[key] = val._id; // flatten remaining refs
          // no else — leave unknown objects as-is
        });

        reset(formData);
      } catch (err) {
        toast.error(err.message || "Failed to fetch record data");
        navigate(`/${module}`);
      } finally {
        setLoading(false);
        dispatch(setGlobalLoading(false));
      }
    } else {
      setLoading(false);
      reset({ isActive: true });
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [isEdit, id, config]);

  const handleAmend = async () => {
    setIsConfirmAmendOpen(false);
    setIsAmending(true);
    try {
      await api.post("/workflows/amend", {
        transactionId: recordData._id,
        transactionModel: module,
      });
      toast.success("Transaction amended successfully. You can now edit.");
      fetchRecord();
      setIsViewing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Amendment failed");
    } finally {
      setIsAmending(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      const {
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        approvedBy,
        approvedDate,
        ...payload
      } = values;

      if (isEdit) {
        await api.patch(`${config.endpoint}/${id}`, payload);
        toast.success(
          `${config.singularTitle || config.title} updated successfully`,
        );
        navigate(`/${module}/${id}`, { replace: true });
      } else {
        const res = await api.post(config.endpoint, payload);
        toast.success(
          `New ${config.singularTitle || config.title} created successfully`,
        );
        const newRecord = res.data.data;
        const navId = newRecord[config.displayIdField] || newRecord._id;
        navigate(`/${module}/${navId}`);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Submission failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const renderArrayField = (field) => {
    return (
      <ArrayFieldEditor
        key={field.name}
        field={field}
        control={control}
        register={register}
        errors={errors}
        disabled={isReadOnly}
      />
    );
  };

  const renderField = (field) => {
    if (field.type === "array") return renderArrayField(field);
    const fieldDisabled =
      isReadOnly ||
      field.disabled ||
      (isEdit ? field.disabledOnEdit : field.disabledOnCreate);

    // Email Template Special Handling: Show preview alongside the body
    if (module === "emailTemplate" && field.name === "htmlBody") {
      return (
        <div key={field.name} className="md:col-span-2 lg:col-span-3 space-y-4">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex gap-4 h-[450px]">
            <div className="flex-1">
              <textarea
                {...register(field.name)}
                disabled={fieldDisabled}
                className="w-full h-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-mono text-xs resize-none"
                placeholder="Enter HTML body..."
              />
            </div>
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative overflow-hidden flex flex-col">
              <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Live Preview
                </span>
              </div>
              <iframe
                title="email-preview"
                srcDoc={
                  watchAllFields[field.name] ||
                  "<p style='color: #94a3b8; text-align: center; margin-top: 40px;'>No content to preview</p>"
                }
                className="w-full flex-1 border-none"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <FormField
        key={field.name}
        label={field.label}
        help={field.help}
        required={field.required}
        error={errors[field.name]}
        className={
          field.type === "textarea" || field.multiple
            ? "md:col-span-2 lg:col-span-3"
            : ""
        }
      >
        {field.type === "asyncSelect" ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <AsyncSelect
                endpoint={field.endpoint}
                labelFormat={field.labelFormat}
                value={value}
                onChange={onChange}
                disabled={fieldDisabled}
                placeholder={`Select ${field.label.toLowerCase()}...`}
                error={errors[field.name]}
              />
            )}
          />
        ) : field.type === "select" ? (
          field.multiple ? (
            <Controller
              name={field.name}
              control={control}
              render={({ field: { value = [], onChange } }) => (
                <div className="flex flex-wrap gap-2.5 p-1">
                  {field.options?.map((opt) => {
                    const isChecked =
                      Array.isArray(value) && value.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none",
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                            : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200",
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...value, opt.value]
                              : value.filter((v) => v !== opt.value);
                            onChange(newValue);
                          }}
                          disabled={fieldDisabled}
                          className={
                            isChecked
                              ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                              : ""
                          }
                        />
                        <span className="text-xs font-bold tracking-tight">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
          ) : (
            <select
              {...register(field.name)}
              disabled={fieldDisabled}
              className={`flex h-11 w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors[field.name]
                  ? "border-red-400"
                  : "border-slate-200 focus:border-indigo-400"
              }`}
            >
              <option value="">Select Option</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        ) : field.type === "checkbox" ? (
          <div className="flex items-center gap-3 pt-1">
            <Controller
              name={field.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onCheckedChange={onChange}
                  disabled={fieldDisabled}
                />
              )}
            />
            <span className="text-sm font-medium text-slate-600 transition-colors">
              {watchAllFields[field.name]
                ? "Enabled / Active"
                : "Disabled / Inactive"}
            </span>
          </div>
        ) : field.type === "textarea" ? (
          <textarea
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled={fieldDisabled}
            {...register(field.name)}
            className={`flex w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors[field.name]
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-400"
            }`}
          />
        ) : (
          <input
            type={field.type}
            min={field.type === "number" ? (field.min ?? 0) : undefined}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled={fieldDisabled}
            {...register(field.name)}
            className={`flex h-11 w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors[field.name]
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-400"
            }`}
          />
        )}
      </FormField>
    );
  };

  if (loading || !config) return null;

  const displayIdField = config.displayIdField;
  const displayIdValue = recordData?.[displayIdField];
  const formTitle = isEdit
    ? displayIdValue
      ? `${config.singularTitle || config.title}: ${displayIdValue}`
      : `Modify ${config.singularTitle || config.title}`
    : `Add New ${config.singularTitle || config.title}`;

  const allSectionIds = useSections
    ? config.formSections.map((_, i) => `item-${i}`)
    : ["general"];

  return (
    <FormPage allSectionIds={allSectionIds} defaultOpenSections={allSectionIds}>
      <MasterFormInner
        config={config}
        isEdit={isEdit}
        isViewing={isViewing}
        formTitle={formTitle}
        recordData={recordData}
        hasEditPermission={hasEditPermission}
        isLocked={isLocked}
        status={status}
        isAmending={isAmending}
        isConfirmAmendOpen={isConfirmAmendOpen}
        setIsConfirmAmendOpen={setIsConfirmAmendOpen}
        handleAmend={handleAmend}
        setIsHistoryOpen={setIsHistoryOpen}
        setIsWfTrailOpen={setIsWfTrailOpen}
        isHistoryOpen={isHistoryOpen}
        isWfTrailOpen={isWfTrailOpen}
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        submitting={submitting}
        isDirty={isDirty}
        isReadOnly={isReadOnly}
        module={module}
        id={id}
        navigate={navigate}
        renderField={renderField}
        useSections={useSections}
        getValues={getValues}
      />
    </FormPage>
  );
}

function MasterFormInner({
  config,
  isEdit,
  isViewing,
  formTitle,
  recordData,
  hasEditPermission,
  isLocked,
  status,
  isAmending,
  isConfirmAmendOpen,
  setIsConfirmAmendOpen,
  handleAmend,
  setIsHistoryOpen,
  setIsWfTrailOpen,
  isHistoryOpen,
  isWfTrailOpen,
  register,
  control,
  errors,
  handleSubmit,
  onSubmit,
  submitting,
  isDirty,
  isReadOnly,
  module,
  id,
  navigate,
  renderField,
  useSections,
  getValues,
}) {
  const { expandedIds, setExpandedIds } = useFormContext();

  return (
    <>
      <FormHeader
        title={formTitle}
        subtitle={
          isEdit && recordData?.transactionId
            ? `Record ID: ${recordData.transactionId}`
            : `Create a new ${config.singularTitle || config.title}`
        }
        breadcrumbs={[config.title, isEdit ? "Update" : "New"]}
        onBack={() => navigate(`/${module}`)}
      >
        {isEdit &&
          isViewing &&
          recordData?.workflowStatus?.toLowerCase() === "approved" &&
          hasEditPermission && (
            <button
              onClick={() => setIsConfirmAmendOpen(true)}
              disabled={isAmending}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              {isAmending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Amend
            </button>
          )}

        {isEdit && isViewing && hasEditPermission && !isLocked && (
          <button
            onClick={() => navigate(`/${module}/${id}/edit`)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}

        {isEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setIsHistoryOpen(true)}
                className="cursor-pointer"
              >
                <History className="mr-2 h-4 w-4 text-slate-500" />
                Audit History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsWfTrailOpen(true)}
                className="cursor-pointer"
              >
                <Send className="mr-2 h-4 w-4 text-slate-500" />
                Workflow Trail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <CsvDownload
                data={[getValues()]}
                columns={config.columns}
                filename={`${module}_${recordData?._id}.csv`}
                asDropdownItem={true}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </FormHeader>

      {isEdit && (
        <AlertDialog
          open={isConfirmAmendOpen}
          onOpenChange={setIsConfirmAmendOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Amend Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to amend this approved transaction? This
                will reset the workflow and allow editing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAmend}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Confirm Amendment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="multiple"
          value={expandedIds}
          onValueChange={setExpandedIds}
          className="space-y-6"
        >
          {useSections ? (
            config.formSections.map((section, sidx) => (
              <FormSection
                key={sidx}
                id={`item-${sidx}`}
                title={section.title}
                icon={section.icon || "Database"}
              >
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map((field) => renderField(field))}
                </div>
              </FormSection>
            ))
          ) : (
            <FormSection
              id="general"
              title={`${config?.title || module} Information`}
              icon={config.icon || "Database"}
            >
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {(config.formFields || []).map((field) => renderField(field))}
              </div>
            </FormSection>
          )}
        </Accordion>

        <FormActionBar
          isDirty={isDirty}
          isSubmitting={submitting}
          onCancel={() =>
            isViewing
              ? navigate(`/${module}`)
              : isEdit
                ? setIsViewing(true)
                : navigate(`/${module}`)
          }
          submitLabel={isEdit ? "Update Record" : "Create Record"}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          cancelLabel={isReadOnly ? "Return to List" : "Cancel Changes"}
        />
      </form>

      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail
          recordId={recordData?._id}
          collectionName={module?.toLowerCase()}
        />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail
          transactionId={recordData?._id}
          transactionModel={module}
        />
      </Drawer>
    </>
  );
}

function ArrayFieldEditor({ field, control, register, errors, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  return (
    <div className="col-span-full space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
          {field.label}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => append({})}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <PlusIcon size={14} /> Add {field.label.singular || "Item"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium italic">
              No {field.label.toLowerCase()} added yet
            </p>
          </div>
        )}

        {fields.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <Trash2 size={12} />
              </button>
            )}

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {field.schema.fields.map((subField) => (
                <div
                  key={subField.name}
                  className={cn(
                    "space-y-1.5",
                    subField.multiple ? "col-span-full" : "",
                  )}
                >
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {subField.label}
                  </label>

                  {subField.type === "asyncSelect" ? (
                    <Controller
                      name={`${field.name}.${index}.${subField.name}`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <AsyncSelect
                          endpoint={subField.endpoint}
                          labelFormat={subField.labelFormat}
                          value={value}
                          onChange={onChange}
                          disabled={disabled}
                          placeholder={`Select...`}
                          error={errors?.[field.name]?.[index]?.[subField.name]}
                        />
                      )}
                    />
                  ) : subField.multiple ? (
                    <Controller
                      name={`${field.name}.${index}.${subField.name}`}
                      control={control}
                      render={({ field: { value = [], onChange } }) => (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {subField.options?.map((opt) => {
                            const isChecked =
                              Array.isArray(value) && value.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200",
                                )}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...value, opt.value]
                                      : value.filter((v) => v !== opt.value);
                                    onChange(newValue);
                                  }}
                                  disabled={disabled}
                                  className={
                                    isChecked
                                      ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600 w-3 h-3"
                                      : "w-3 h-3"
                                  }
                                />
                                <span className="text-[10px] font-bold">
                                  {opt.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  ) : subField.type === "select" ? (
                    <select
                      {...register(`${field.name}.${index}.${subField.name}`)}
                      disabled={disabled}
                      className={`flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 disabled:opacity-60 transition-all`}
                    >
                      <option value="">Select...</option>
                      {subField.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : subField.type === "checkbox" ? (
                    <div className="flex items-center gap-2 pt-2">
                      <Controller
                        name={`${field.name}.${index}.${subField.name}`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Switch
                            checked={value}
                            onCheckedChange={onChange}
                            disabled={disabled}
                            className="scale-75 origin-left"
                          />
                        )}
                      />
                      <span className="text-[10px] font-medium text-slate-500">
                        Enabled
                      </span>
                    </div>
                  ) : (
                    <input
                      type={subField.type || "text"}
                      min={
                        subField.type === "number"
                          ? (subField.min ?? 0)
                          : undefined
                      }
                      {...register(`${field.name}.${index}.${subField.name}`)}
                      disabled={disabled}
                      placeholder={`Enter ${subField.label.toLowerCase()}...`}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 disabled:opacity-60 transition-all"
                    />
                  )}

                  {errors?.[field.name]?.[index]?.[subField.name] && (
                    <span className="text-[10px] text-red-500 font-bold">
                      {errors[field.name][index][subField.name].message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
