import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
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
  XCircle,
  MoreVertical,
  Key,
  ShieldAlert,
  Eye,
  Edit,
  CheckCircle,
  ChevronDown,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import { apiRegistry } from "../../config/apiRegistry";
import api from "../../services/api";
import { evaluateCondition } from "../../lib/conditions";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";
import { hasPermission, getMenuPermissions } from "../../lib/permissions";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../store/features/uiSlice";
import AsyncSelect from "../../components/ui/AsyncSelect";
import SearchableSelect from "../../components/ui/SearchableSelect";
import CsvDownload from "../../components/ui/CsvDownload";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import WorkflowActionDialog from "../../components/common/WorkflowActionDialog";
import { format } from "date-fns";
import Skeleton from "../../components/ui/Skeleton";

// Core UI Components
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

import { useFeatures } from "../../hooks/useFeatures";
import { useWorkflowState } from "../../hooks/useWorkflowState";

export default function MasterForm() {
  const { isEnabled } = useFeatures();
  const { module, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const moduleKey = apiRegistry
    ? Object.keys(apiRegistry).find(
        (key) =>
          key.toLowerCase() === module?.toLowerCase() ||
          apiRegistry[key]?.endpoint?.replace(/^\//, "")?.toLowerCase() ===
            module?.toLowerCase(),
      )
    : null;
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
  const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [resettingPwd, setResettingPwd] = useState(false);
  const [recordData, setRecordData] = useState(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [wfComments, setWfComments] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [isActioning, setIsActioning] = useState(false);
  const [delegatedToUserId, setDelegatedToUserId] = useState(null);

  const wfModel =
    config?.moduleName ||
    (moduleKey ? moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1) : "");
  const { workflowState, refresh: refreshWf } = useWorkflowState(
    recordData?._id,
    wfModel,
  );

  const looksLikeId = (val) => {
    if (typeof val !== "string") return false;
    if (val.includes(" ")) return false;
    if (val.length < 5) return false;
    // Hex (MongoID) or UUID or Code (alphanumeric)
    return (
      /^[a-f0-9]{24}$/i.test(val) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val,
      ) ||
      /^[A-Z0-9_-]+$/i.test(val)
    );
  };
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

  // Special logic for User module role assignments: Sync default selection to main fields
  useEffect(() => {
    if (moduleKey === "user" && Array.isArray(watchAllFields.roleAssignments)) {
      const defaultRA = watchAllFields.roleAssignments.find(
        (ra) => ra.isDefault,
      );
      if (defaultRA) {
        // Sync userRole if changed
        if (
          defaultRA.userRole &&
          JSON.stringify(defaultRA.userRole) !==
            JSON.stringify(getValues("userRole"))
        ) {
          setValue("userRole", defaultRA.userRole, { shouldDirty: true });
        }
        // Sync workflowRole if changed
        if (
          defaultRA.workflowRole &&
          JSON.stringify(defaultRA.workflowRole) !==
            JSON.stringify(getValues("workflowRole"))
        ) {
          setValue("workflowRole", defaultRA.workflowRole, {
            shouldDirty: true,
          });
        }
      }
    }
  }, [watchAllFields.roleAssignments, moduleKey, setValue, getValues]);

  const menu = user?.userRole?.menus?.find((m) => {
    const checkId = typeof m.menuId === "object" ? m.menuId?.menuId : m.menuId;
    return checkId === moduleKey || checkId === module;
  });

  const menuPerms = getMenuPermissions(user, module);
  const hasEditPermission = hasPermission(menuPerms, "edit");
  const hasDeletePermission = hasPermission(menuPerms, "delete");

  const status = recordData?.transactionStatus || recordData?.status || "";

  // A record is locked if it's in a processing state and the workflow doesn't explicitly allow editing
  const isLockedByWf =
    [
      "submitted",
      "approved",
      "completed",
      "pending_approval",
      "pending",
    ].includes(status?.toLowerCase()) && !workflowState?.canEdit;
  const isReadOnly = isViewing || !hasEditPermission || isLockedByWf;

  // Redirect if module not found
  useEffect(() => {
    if (!config) {
      toast.error(`Module '${module}' not found.`);
      navigate("/dashboard");
    }
  }, [module, config, navigate]);

  // Ref to programmatically submit the form from header Save button
  const formRef = React.useRef(null);

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      await api.post(`/workflows/initiate`, {
        transactionId: recordData._id,
        transactionModel: moduleKey || module,
        amount: 0,
      });
      toast.success("Submitted for approval successfully");
      refreshWf();
      fetchRecord();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
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
        transactionId: recordData._id,
        transactionModel: moduleKey || module,
        action: activeAction,
        comments: wfComments,
      };

      if (activeAction === "delegate") {
        payload.delegatedToUserId = delegatedToUserId;
      }

      await api.post(`/workflows/action`, payload);
      toast.success(
        `Transaction ${activeAction?.replace("_", " ")}d successfully`,
      );
      setIsActionDialogOpen(false);
      setWfComments("");
      setDelegatedToUserId(null);
      refreshWf();
      fetchRecord();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsActioning(false);
      dispatch(setGlobalLoading(false));
    }
  };

  // Set Page Context Title & Actions
  useEffect(() => {
    if (config) {
      const headerActions = [];
      // canEdit from workflow overrides menu-level permission (e.g. for Approvers with mandatory fields)
      const canEditThisRecord =
        workflowState?.canEdit ||
        (hasEditPermission &&
          (!status ||
            ["draft", "rejected", "recalled"].includes(status?.toLowerCase())));

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
              fetchRecord();
            } else {
              navigate(`/${module}`);
            }
          },
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
          title: `${isViewing ? "View" : isEdit ? "Edit" : "New"} ${config.singularTitle || config.title}`,
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
    status,
    recordData,
    workflowState,
    isEdit,
    navigate,
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
          formData.createdBy =
            data.createdBy.fullName ||
            data.createdBy.email ||
            data.createdBy._id;
        if (data.updatedBy && typeof data.updatedBy === "object")
          formData.updatedBy =
            data.updatedBy.fullName ||
            data.updatedBy.email ||
            data.updatedBy._id;
        if (data.performedBy && typeof data.performedBy === "object")
          formData.performedBy =
            data.performedBy.fullName ||
            data.performedBy.email ||
            data.performedBy._id;
        if (data.approvedBy && typeof data.approvedBy === "object")
          formData.approvedBy =
            data.approvedBy.fullName ||
            data.approvedBy.email ||
            data.approvedBy._id;

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
          const value = formData[field.name];
          if (
            field.type === "asyncSelect" &&
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            // Keep the object so AsyncSelect can show the label immediately
            formData[field.name] = value;
          } else if (
            field.type === "asyncSelect" &&
            typeof value === "string"
          ) {
            // If it's a string ID, keep it
            formData[field.name] = value;
          } else if (field.type === "date" && value) {
            const d = new Date(value);
            if (isFinite(d)) {
              formData[field.name] = format(d, "yyyy-MM-dd");
            }
          }
        });

        // ── Preserve objects for AsyncSelect — no manual ID stripping needed ────
        // The global api.js request interceptor will handle sanitization on save.
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
      refreshWf();
      setIsViewing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Amendment failed");
    } finally {
      setIsAmending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!tempPassword) {
      toast.error("Please enter a temporary password");
      return;
    }
    setResettingPwd(true);
    try {
      await api.post("/users/reset-password", {
        userId: recordData._id,
        tempPassword,
      });
      toast.success(
        "User password has been reset successfully. User will be forced to change it on next login.",
      );
      setIsResetPwdOpen(false);
      setTempPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setResettingPwd(false);
    }
  };

  const onSubmit = async (values) => {
    // Dynamic Mandatory Fields Check (Stage-specific)
    const missingFields = (workflowState?.mandatoryFields || []).filter((f) => {
      const val = values[f];
      return val === undefined || val === null || val === "";
    });

    if (missingFields.length > 0) {
      const allFields = config.formSections
        ? config.formSections.flatMap((s) => s.fields)
        : config.formFields || [];
      const labels = missingFields.map(
        (f) => allFields.find((af) => af.name === f)?.label || f,
      );
      toast.error(`Workflow Mandatory Fields Missing: ${labels.join(", ")}`);
      return;
    }

    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      const flatten = (obj) => {
        if (!obj || typeof obj !== "object" || obj instanceof Date) {
          return obj;
        }

        if (Array.isArray(obj)) return obj.map(flatten);

        // If it's a lookup object (from AsyncSelect or API), extract its ID
        if (obj._id || obj.value) {
          return obj._id || obj.value;
        }

        // Recursively handle nested objects
        const newObj = {};
        Object.keys(obj).forEach((key) => {
          newObj[key] = flatten(obj[key]);
        });
        return newObj;
      };

      const {
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        approvedBy,
        approvedDate,
        _id,
        __v,
        ...rest
      } = values;
      const payload = {};
      Object.keys(rest).forEach((key) => {
        payload[key] = flatten(rest[key]);
      });

      // Avoid sending empty password on edit (preserves existing password)
      if (isEdit && payload.password === "") {
        delete payload.password;
      }

      // DEBUG: Log the final payload to console for inspection
      console.log(
        "Final Submission Payload:",
        JSON.stringify(payload, null, 2),
      );
      window.last_payload = payload;

      if (isEdit) {
        // Use the URL param `id` (domain code e.g. cityCode, deptCode) as the patch identifier.
        // Fall back to the MongoDB _id only when the URL param is the _id itself.
        const patchId = id || recordData?._id;
        await api.patch(`${config.endpoint}/${patchId}`, payload);
        toast.success(
          `${config.singularTitle || config.title} updated successfully`,
        );
        setIsViewing(true);
        fetchRecord();
        navigate(`/${module}/${id}`, { replace: true });
      } else {
        const res = await api.post(config.endpoint, payload);
        toast.success(
          `New ${config.singularTitle || config.title} created successfully`,
        );
        const newRecord = res.data.data;
        let navId = newRecord[config.displayIdField] || newRecord._id;
        if (String(navId).includes("undefined")) {
          navId = newRecord._id;
        }
        navigate(`/${module}/${navId}`);
      }
    } catch (err) {
      console.error("FULL_SUBMISSION_ERROR:", err);
      if (err.response) {
        console.error("ERROR_RESPONSE_DATA:", err.response.data);
        console.error("ERROR_RESPONSE_STATUS:", err.response.status);
        console.error("ERROR_RESPONSE_HEADERS:", err.response.headers);
      }
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
        setValue={setValue}
        errors={errors}
        disabled={isReadOnly}
      />
    );
  };

  const renderField = (field) => {
    // ── Admin-Only Gating ────────────────────────────────────────────────
    if (field.isAdminOnly && !user?.isSuperAdmin) {
      return null;
    }

    // Conditional Visibility Check
    if (field.showIf && !evaluateCondition(field.showIf, watchAllFields)) {
      return null;
    }

    if (field.type === "array") return renderArrayField(field);

    // Feature Flag Override for Auto-ID
    const autoIdFeature = config.featureFlags?.autoId;
    const isAutoIdEnabled = autoIdFeature ? isEnabled(autoIdFeature) : false; // Default to false (manual) if no flag mapped

    let fieldDisabled =
      isReadOnly ||
      field.disabled ||
      (isEdit ? field.disabledOnEdit : field.disabledOnCreate);
    let placeholder =
      field.placeholder || `Enter ${field.label.toLowerCase()}...`;
    let isRequired =
      (field.required ||
        workflowState?.mandatoryFields?.includes(field.name)) &&
      !fieldDisabled;

    if (field.name === config.displayIdField && !isEdit) {
      fieldDisabled = isAutoIdEnabled;
      placeholder = isAutoIdEnabled
        ? "Auto-generated"
        : `Enter ${field.label}...`;
      if (!isAutoIdEnabled) isRequired = true;
    }

    // Email Template Special Handling: Show preview alongside the body
    if (module === "emailTemplate" && field.name === "htmlBody") {
      return (
        <div key={field.name} className="md:col-span-2 lg:col-span-3 space-y-4">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
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
                <span className="text-sm font-medium text-slate-500">
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
        required={isRequired}
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
                placeholder={placeholder}
                error={errors[field.name]}
              />
            )}
          />
        ) : field.type === "searchableSelect" ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchableSelect
                options={field.options}
                value={value}
                onChange={onChange}
                disabled={fieldDisabled}
                placeholder={placeholder}
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
              className={`flex h-11 w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 ${
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
            placeholder={placeholder}
            disabled={fieldDisabled}
            {...register(field.name, { required: isRequired })}
            className={`flex w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors[field.name]
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-400"
            }`}
          />
        ) : (
          <input
            type={field.type || "text"}
            min={field.type === "number" ? (field.min ?? 0) : undefined}
            placeholder={placeholder}
            disabled={fieldDisabled}
            {...register(field.name, {
              required: isRequired,
              onChange: (e) => {
                if (field.name === config.displayIdField) {
                  const upper = e.target.value.toUpperCase();
                  e.target.value = upper;
                  setValue(field.name, upper);
                }
              },
            })}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60",
              field.name === config.displayIdField &&
                "uppercase font-bold tracking-wider",
              errors[field.name]
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-400",
            )}
          />
        )}
      </FormField>
    );
  };

  if (!config) return null;

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="space-y-3 p-6 bg-white border border-slate-50 rounded-[32px]"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayIdField = config.displayIdField;
  // Prioritize recordCode for Audit Logs or the configured displayIdField
  const displayIdValue = recordData?.recordCode || recordData?.[displayIdField];

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
        isLocked={isLockedByWf}
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
        isEnabled={isEnabled}
        watch={watch}
        workflowState={workflowState}
        isResetPwdOpen={isResetPwdOpen}
        setIsResetPwdOpen={setIsResetPwdOpen}
        tempPassword={tempPassword}
        setTempPassword={setTempPassword}
        resettingPwd={resettingPwd}
        handleResetPassword={handleResetPassword}
        moduleKey={moduleKey}
        isActionDialogOpen={isActionDialogOpen}
        setIsActionDialogOpen={setIsActionDialogOpen}
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        wfComments={wfComments}
        setWfComments={setWfComments}
        isActioning={isActioning}
        handleWorkflowAction={handleWorkflowAction}
        handleSubmitForApproval={handleSubmitForApproval}
        delegatedToUserId={delegatedToUserId}
        setDelegatedToUserId={setDelegatedToUserId}
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
  watch,
  module,
  id,
  navigate,
  renderField,
  useSections,
  getValues,
  isEnabled,
  workflowState,
  isResetPwdOpen,
  setIsResetPwdOpen,
  tempPassword,
  setTempPassword,
  resettingPwd,
  handleResetPassword,
  moduleKey,
  isActionDialogOpen,
  setIsActionDialogOpen,
  activeAction,
  setActiveAction,
  wfComments,
  setWfComments,
  isActioning,
  handleWorkflowAction,
  handleSubmitForApproval,
  delegatedToUserId,
  setDelegatedToUserId,
}) {
  const { expandedIds, setExpandedIds } = useFormContext();
  const mode = id === "new" ? "NEW" : isViewing ? "VIEW" : "EDIT";
  const entityTitle = config.singularTitle || config.title;
  const displayIdValue = recordData?.[config.displayIdField];

  return (
    <>
      <FormHeader
        mode={mode}
        title={
          displayIdValue ? (
            <div className="flex items-center gap-2">
              {entityTitle}{" "}
              <code className="text-[0.7em] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
                {displayIdValue}
              </code>
            </div>
          ) : (
            entityTitle
          )
        }
        subtitle={
          isEdit && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Status:
                </span>
                <StatusBadge status={status || "Draft"} />
              </div>

              {config.featureFlags?.workflow &&
                isEnabled(config.featureFlags.workflow) &&
                workflowState?.currentStageName && (
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Stage:
                    </span>
                    <StatusBadge status={workflowState.currentStageName} />
                  </div>
                )}
            </div>
          )
        }
        breadcrumbs={[config.title, isEdit ? "Update" : "New"]}
        onBack={() => navigate(`/${module}`)}
        backTo={`/${module}`}
      >
        {isEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-11 px-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setIsHistoryOpen(true)}
                className="cursor-pointer"
              >
                <History className="mr-2 h-4 w-4 text-slate-500" />
                Audit History
              </DropdownMenuItem>
              {isEnabled(config.featureFlags?.workflow) && (
                <DropdownMenuItem
                  onClick={() => setIsWfTrailOpen(true)}
                  className="cursor-pointer"
                >
                  <Send className="mr-2 h-4 w-4 text-slate-500" />
                  Workflow Trail
                </DropdownMenuItem>
              )}
              {moduleKey === "user" && (
                <DropdownMenuItem
                  onClick={() => setIsResetPwdOpen(true)}
                  className="cursor-pointer text-amber-600"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset User Password
                </DropdownMenuItem>
              )}
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

      {moduleKey === "user" && (
        <AlertDialog open={isResetPwdOpen} onOpenChange={setIsResetPwdOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Administrative Password Reset
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to reset the password for{" "}
                <span className="font-bold text-slate-900">
                  {recordData?.fullName}
                </span>
                . The user will be required to change this temporary password
                immediately upon their next login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                Set Temporary Password
              </label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="e.g. Temp123!"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-mono"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 italic">
                Provide this password to the user via a secure channel.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTempPassword("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleResetPassword();
                }}
                disabled={!tempPassword || resettingPwd}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {resettingPwd ? "Resetting..." : "Reset & Enforce Change"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
          onCancel={() => navigate(`/${module}`)}
          submitLabel={isEdit ? "Save as Draft" : "Create Record"}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          cancelLabel="Return to List"
        >
          <div className="flex items-center gap-2 mr-4">
            {config.featureFlags?.workflow &&
              isEnabled(config.featureFlags.workflow) &&
              isEdit &&
              isViewing &&
              (!status ||
                ["draft", "rejected", "recalled"].includes(
                  status?.toLowerCase(),
                )) && (
                <Button
                  type="button"
                  variant="primary"
                  className="bg-amber-600 hover:bg-amber-700 border-none"
                  onClick={handleSubmitForApproval}
                  size="sm"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit for Approval
                </Button>
              )}

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

            {isViewing &&
              ["approved", "rejected"].includes(status?.toLowerCase()) && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setIsConfirmAmendOpen(true)}
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Amend Transaction
                </Button>
              )}
          </div>
        </FormActionBar>
      </form>

      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={recordData?._id} collectionName={moduleKey} />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail
          transactionId={recordData?._id}
          transactionModel={moduleKey}
        />
      </Drawer>
    </>
  );
}

function ArrayFieldEditor({
  field,
  control,
  register,
  setValue,
  errors,
  disabled,
}) {
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => append({})}
            leftIcon={<PlusIcon size={14} />}
            className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700"
          >
            Add {field.label.singular || "Item"}
          </Button>
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
              <Button
                variant="ghost"
                size="xs"
                onClick={() => remove(index)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <Trash2 size={12} />
              </Button>
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
                            onCheckedChange={(checked) => {
                              onChange(checked);
                              // If this is an 'isDefault' checkbox, uncheck all others in the array
                              if (checked && subField.name === "isDefault") {
                                fields.forEach((_, i) => {
                                  if (i !== index) {
                                    setValue(
                                      `${field.name}.${i}.isDefault`,
                                      false,
                                    );
                                  }
                                });
                              }
                            }}
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
                    <span className="text-[10px] text-red-500 font-bold tracking-[0.1em] [word-spacing:0.05em]">
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
