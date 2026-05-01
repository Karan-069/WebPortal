import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Plus,
  Trash2,
  Shield,
  Layers,
  Loader2,
  AlertCircle,
  Settings,
  History,
  MoreVertical,
  Check,
  Lock,
  Send,
  GitBranch,
  Info,
  ArrowRight,
  Edit2,
  ChevronDown,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setLoading as setGlobalLoading } from "../../store/features/uiSlice";

import Button from "../../components/ui/Button";
import AsyncSelect from "../../components/ui/AsyncSelect";
import FormPage from "../../components/form/FormPage";
import FormHeader from "../../components/form/FormHeader";
import FormSection from "../../components/form/FormSection";
import FormActionBar from "../../components/form/FormActionBar";
import { Switch } from "../../components/ui/Switch";
import { cn } from "../../lib/utils";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import CsvDownload from "../../components/ui/CsvDownload";
import { useFormContext } from "../../components/form/FormContext";
import { Accordion } from "../../components/ui/Accordion";
import { evaluateCondition } from "../../lib/conditions";
import MultiAsyncSelect from "../../components/ui/MultiAsyncSelect";
import SearchableSelect from "../../components/ui/SearchableSelect";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/DropdownMenu";
import { apiRegistry } from "../../config/apiRegistry";

import { useFeatures } from "../../hooks/useFeatures";
import * as Popover from "@radix-ui/react-popover";

export default function WorkflowManager() {
  const { isEnabled } = useFeatures();
  const { id, module: moduleName } = useParams();
  const location = useLocation();
  const isRoleMode = location.pathname.includes("/workflowRole");
  const allIds = isRoleMode
    ? ["roleInfo", "capabilities", "system"]
    : ["general", "stages", "system"];

  return (
    <FormPage allSectionIds={allIds} defaultOpenSections={allIds}>
      <WorkflowManagerInner />
    </FormPage>
  );
}

function WorkflowManagerInner() {
  const { isEnabled } = useFeatures();
  const { id: rawId } = useParams();
  const id =
    typeof rawId === "string"
      ? rawId.replace(/^"(.*)"$/, "$1").replace(/"/g, "")
      : rawId;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isRoleMode = location.pathname.includes("/workflowRole");
  const isEdit = id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);

  // Sync viewing mode with route changes
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const { expandedIds, setExpandedIds } = useFormContext();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [watchCategory, setWatchCategory] = useState("master");
  const [fieldSearch, setFieldSearch] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      workflowCode: "",
      workflowType: "transaction",
      transactionType: "",
      description: "",
      isActive: true,
      initiatorRole: "",
      WorkflowStage: [],
      wfRoleCode: "",
      roleName: "",
      wfRoleType: [],
      moduleContext: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "WorkflowStage",
  });

  const getModuleFields = (moduleKey) => {
    if (!moduleKey) return [];
    const config = apiRegistry[moduleKey.toLowerCase()];
    if (!config) return [];

    const fieldMap = new Map();

    // 1. Process Columns (Table View)
    if (config.columns) {
      config.columns.forEach((col) => {
        const val =
          typeof col.accessor === "function" ? col.header : col.accessor;
        // Skip common metadata/system fields
        if (
          val &&
          !/active|createdAt|updatedAt|createdBy|updatedBy|_id|__v/i.test(val)
        ) {
          fieldMap.set(val, col.header || val);
        }
      });
    }

    // 2. Process Form Fields (Direct)
    if (config.formFields) {
      config.formFields.forEach((f) => {
        if (
          f.name &&
          !fieldMap.has(f.name) &&
          !/active|createdAt|updatedAt|createdBy|updatedBy|_id|__v/i.test(
            f.name,
          )
        ) {
          fieldMap.set(f.name, f.label || f.name);
        }
      });
    }

    // 3. Process Form Sections (Nested fields)
    if (config.formSections) {
      config.formSections.forEach((section) => {
        if (section.fields) {
          section.fields.forEach((f) => {
            if (
              f.name &&
              !fieldMap.has(f.name) &&
              !/active|createdAt|updatedAt|createdBy|updatedBy|_id|__v/i.test(
                f.name,
              )
            ) {
              fieldMap.set(f.name, f.label || f.name);
            }
          });
        }
      });
    }

    return Array.from(fieldMap.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  };

  const allWorkflowModules = useMemo(() => {
    return Object.entries(apiRegistry)
      .filter(([key, config]) => config.featureFlags?.workflow)
      .map(([key, config]) => {
        const wfFlag = config.featureFlags.workflow;
        // Categorize based on explicit flag or key-based heuristic
        const isTransaction =
          config.isTransaction ||
          config.displayIdField === "transactionId" ||
          /bill|expense|purchase|payment|journal|invoice/i.test(key);

        return {
          label: config.title || config.singularTitle || key,
          value: key,
          feature: wfFlag,
          category: isTransaction ? "transaction" : "master",
        };
      });
  }, []);

  const availableModules = useMemo(() => {
    const watchType = watch("workflowType");
    return allWorkflowModules.filter(
      (m) => m.category === watchType && isEnabled(m.feature),
    );
  }, [watch("workflowType"), isEnabled, allWorkflowModules]);

  const watchTransactionType = watch("transactionType");

  // Auto-Code Logic Synchronization with Feature Flags
  useEffect(() => {
    if (!isEdit && watchTransactionType) {
      // Find the module in apiRegistry
      const moduleKey = apiRegistry
        ? Object.keys(apiRegistry).find((key) => {
            const config = apiRegistry[key];
            return (
              config.singularTitle === watchTransactionType ||
              config.title === watchTransactionType ||
              key === watchTransactionType?.toLowerCase()
            );
          })
        : null;

      if (moduleKey) {
        const config = apiRegistry[moduleKey];
        const autoIdFlag = config?.featureFlags?.autoId;
        if (autoIdFlag) {
          const autoIdEnabled = isEnabled(autoIdFlag);
          // Sync the hidden form value
          setValue("isAutoGenerated", autoIdEnabled);
        } else {
          setValue("isAutoGenerated", false);
        }
      } else {
        setValue("isAutoGenerated", false);
      }
    }
  }, [watchTransactionType, isEdit, isEnabled, setValue]);

  // Derived state for UI visibility
  const currentModuleConfig = Object.values(apiRegistry).find(
    (c) =>
      c.singularTitle === watchTransactionType ||
      c.title === watchTransactionType,
  );
  const isAutoIdEnabledByFeature = currentModuleConfig?.featureFlags?.autoId
    ? isEnabled(currentModuleConfig.featureFlags.autoId)
    : false;

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        setLoading(true);
        dispatch(setGlobalLoading(true));
        try {
          const endpoint = isRoleMode
            ? `/workflow-roles/${id}`
            : `/workflows/${id}`;
          const res = await api.get(endpoint);
          const fetchedData = res.data.data;
          setData(fetchedData);

          const formData = { ...fetchedData };

          // Standardization: Format Audit Fields
          if (
            fetchedData.createdBy &&
            typeof fetchedData.createdBy === "object"
          ) {
            formData.createdBy =
              fetchedData.createdBy.fullName || fetchedData.createdBy._id;
          }
          if (
            fetchedData.updatedBy &&
            typeof fetchedData.updatedBy === "object"
          ) {
            formData.updatedBy =
              fetchedData.updatedBy.fullName || fetchedData.updatedBy._id;
          }
          if (fetchedData.createdAt)
            formData.createdAt = format(
              new Date(fetchedData.createdAt),
              "dd-MMM-yyyy HH:mm:ss",
            );
          if (fetchedData.updatedAt)
            formData.updatedAt = format(
              new Date(fetchedData.updatedAt),
              "dd-MMM-yyyy HH:mm:ss",
            );

          if (!isRoleMode) {
            // Preservation: Keep objects for rich lookup hydration
            formData.initiatorRole = fetchedData.initiatorRole;
            formData.workflowType = fetchedData.workflowType || "transaction";
            formData.isAutoGenerated = fetchedData.isAutoGenerated !== false;
            formData.codePrefix = fetchedData.codePrefix || "";
            const initializedStages = (fetchedData.WorkflowStage || []).map(
              (s) => ({
                ...s,
                stageApproverRole: s.stageApproverRole,
                specificApprovers: s.specificApprovers || [],
                isStatic: !!s.isStatic,
                approvalType: s.approvalType || "any",
                slaHours: s.slaHours || 24,
                isNotificationOnly: !!s.isNotificationOnly,
                mandatoryFields: s.mandatoryFields || [],
                _enableMandatory: (s.mandatoryFields || []).length > 0, // Hydrate UI toggle
                notificationEmailsRaw: (s.notificationRecipients || [])
                  .map((r) => r.email)
                  .join(", "),
              }),
            );

            // Initialize category based on transactionType
            if (fetchedData.transactionType) {
              const modConfig = Object.values(apiRegistry).find(
                (c) => c.value === fetchedData.transactionType,
              );
              if (modConfig) {
                setWatchCategory(
                  modConfig.isTransaction ? "transaction" : "master",
                );
              }
            }

            reset({ ...formData, WorkflowStage: initializedStages });
          } else {
            reset({ ...formData });
          }
        } catch (err) {
          toast.error(`Failed to load ${isRoleMode ? "role" : "workflow"}`);
          navigate(isRoleMode ? "/workflowRole" : "/workflow");
        } finally {
          setLoading(false);
          dispatch(setGlobalLoading(false));
        }
      };
      fetchData();
    } else {
      reset({
        isActive: true,
        WorkflowStage: [],
        wfRoleType: [],
        initiatorRole: "",
      });
    }
  }, [id, isEdit, isRoleMode, reset, navigate, dispatch]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const flattenPayload = (obj) => {
        if (!obj || typeof obj !== "object" || obj instanceof Date) {
          return obj;
        }
        if (Array.isArray(obj)) return obj.map(flattenPayload);

        // Handle objects with _id or value (like from AsyncSelect references)
        // BUT don't flatten if it's a subdocument with its own fields (like a Workflow Stage)
        const isReference =
          (obj._id || obj.value) &&
          !obj.stageName &&
          !obj.fieldName &&
          !obj.roleName &&
          !obj.email;
        if (isReference) {
          return obj._id || obj.value;
        }

        const newObj = {};
        Object.keys(obj).forEach((key) => {
          newObj[key] = flattenPayload(obj[key]);
        });
        return newObj;
      };

      const endpoint = isRoleMode ? "/workflow-roles" : "/workflows";
      const { createdBy, updatedBy, createdAt, updatedAt, _id, __v, ...rest } =
        values;

      // Manual payload construction to avoid recursive flattening issues with stages
      const payload = {
        ...rest,
        // Flatten top-level objects
        initiatorRole: flattenPayload(rest.initiatorRole),
        WorkflowStage: (rest.WorkflowStage || []).map((s) => {
          const {
            notificationEmailsRaw,
            _enableMandatory,
            createdAt,
            updatedAt,
            __v,
            id,
            ...sRest
          } = s;

          // Clean up numeric fields
          const minAmount = isNaN(parseFloat(s.minAmount))
            ? 0
            : parseFloat(s.minAmount);
          const maxAmount = isNaN(parseFloat(s.maxAmount))
            ? 0
            : parseFloat(s.maxAmount);
          const slaHours = isNaN(parseInt(s.slaHours))
            ? 24
            : parseInt(s.slaHours);
          const stageNumber = isNaN(parseInt(s.stageNumber))
            ? 1
            : parseInt(s.stageNumber);

          return {
            ...sRest,
            stageNumber,
            minAmount,
            maxAmount,
            slaHours,
            stageApproverRole: flattenPayload(s.stageApproverRole),
            specificApprovers: flattenPayload(s.specificApprovers || []),
            mandatoryFields: s.mandatoryFields || [],
            notificationRecipients: (notificationEmailsRaw || "")
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
              .map((e) => ({ email: e, type: "to" })),
          };
        }),
      };

      console.log("[WorkflowManager] Submitting Payload:", payload);

      const cleanedId =
        typeof id === "string"
          ? id.replace(/^"(.*)"$/, "$1").replace(/"/g, "")
          : id;

      if (isEdit) {
        await api.patch(`${endpoint}/${cleanedId}`, payload);
        toast.success(`${isRoleMode ? "Role" : "Workflow"} updated`);
        navigate(`${isRoleMode ? "/workflowRole" : "/workflow"}/${cleanedId}`);
      } else {
        const res = await api.post(endpoint, payload);
        toast.success(`${isRoleMode ? "Role" : "Workflow"} created`);
        const newDoc = res.data.data;
        const navId = newDoc[isRoleMode ? "roleCode" : "wfCode"] || newDoc._id;
        navigate(`${isRoleMode ? "/workflowRole" : "/workflow"}/${navId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = isViewing;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            Workflow Logic
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
            Initializing Stage Architect
          </p>
        </div>
      </div>
    );
  }

  const moduleTitle = isRoleMode ? "Workflow Role" : "Workflow Designer";
  const displayCode = isRoleMode ? watch("wfRoleCode") : watch("workflowCode");

  return (
    <>
      <FormHeader
        mode={isEdit ? (isViewing ? "VIEW" : "EDIT") : "NEW"}
        title={
          isEdit
            ? displayCode
              ? `${moduleTitle}: ${displayCode}`
              : `Update ${moduleTitle}`
            : `Create New ${moduleTitle}`
        }
        subtitle={
          isEdit
            ? `Record ID: ${displayCode || id}`
            : `Define a new ${isRoleMode ? "security role" : "approval logic"}`
        }
        breadcrumbs={[
          isRoleMode ? "Workflow Roles" : "Workflows",
          isEdit ? "Update" : "New",
        ]}
        onBack={() => navigate(isRoleMode ? "/workflowRole" : "/workflow")}
        backTo={isRoleMode ? "/workflowRole" : "/workflow"}
      >
        <div className="flex items-center gap-3">
          {isEdit && isViewing && (
            <Button
              variant="primary"
              onClick={() => navigate(`${location.pathname}/edit`)}
              leftIcon={<Edit2 size={16} />}
              className="px-5"
            >
              Edit {isRoleMode ? "Role" : "Workflow"}
            </Button>
          )}

          {isEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-xl"
                >
                  <MoreVertical size={18} />
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
                {isEnabled("WF_WORKFLOW") && (
                  <DropdownMenuItem
                    onClick={() => setIsWfTrailOpen(true)}
                    className="cursor-pointer"
                  >
                    <Send className="mr-2 h-4 w-4 text-slate-500" />
                    Workflow Trail
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <CsvDownload
                  data={[getValues()]}
                  filename={`${isRoleMode ? "role" : "workflow"}_${displayCode}.csv`}
                  asDropdownItem={true}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </FormHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="multiple"
          value={expandedIds}
          onValueChange={setExpandedIds}
          className="space-y-6"
        >
          {!isRoleMode ? (
            <>
              <FormSection id="general" title="Workflow Logic" icon="GitBranch">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Sequence Configuration - Strictly driven by Feature Flags */}
                  {isAutoIdEnabledByFeature && (
                    <div className="md:col-span-3 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/20 relative overflow-hidden mb-2">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-50">
                            <Layers size={20} />
                          </div>
                          <div>
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] [word-spacing:0.1em] italic">
                              Auto-Sequence Enabled
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              Automatic ID Generation Active
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                          <div className="relative group">
                            <label className="absolute -top-2 left-3 px-2 bg-white text-[9px] font-black uppercase text-indigo-500 tracking-widest z-10">
                              Custom Prefix (Optional)
                            </label>
                            <input
                              {...register("codePrefix")}
                              disabled={isReadOnly || isEdit}
                              placeholder="e.g. VEN-ST-"
                              className="w-full h-11 px-4 rounded-xl border border-indigo-200/60 bg-white text-sm font-black focus:ring-4 focus:ring-indigo-500/5 outline-none placeholder:font-normal placeholder:text-slate-300 transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex items-center text-[10px] text-slate-500 font-medium bg-white/50 px-4 py-2 rounded-lg border border-slate-100">
                          <span className="mr-2">ℹ️</span>
                          Prefix will be prepended to the auto-generated number.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Workflow Code
                    </label>
                    <input
                      {...register("workflowCode", {
                        onChange: (e) => {
                          const upper = e.target.value.toUpperCase();
                          e.target.value = upper;
                          setValue("workflowCode", upper);
                        },
                      })}
                      disabled={isEdit}
                      placeholder="Auto-generated if empty"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-bold disabled:opacity-60 uppercase tracking-widest"
                    />
                  </div>

                  {!isRoleMode && isEdit && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                          Version
                        </label>
                        <input
                          {...register("version")}
                          disabled={true}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold disabled:opacity-60"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                          Amendment No.
                        </label>
                        <input
                          {...register("amendmentNumber")}
                          disabled={true}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold disabled:opacity-60"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Workflow Type
                    </label>
                    <Controller
                      name="workflowType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <SearchableSelect
                          value={value}
                          onChange={onChange}
                          disabled={isReadOnly}
                          options={[
                            {
                              label: "Transaction Workflow",
                              value: "transaction",
                            },
                            { label: "Master Data Workflow", value: "master" },
                          ]}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      {watch("workflowType") === "master"
                        ? "Master Model"
                        : "Transaction Model"}
                    </label>
                    <Controller
                      name="transactionType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => {
                        const options = availableModules;

                        const filteredOptions = options.filter(
                          (opt) => !opt.feature || isEnabled(opt.feature),
                        );

                        return (
                          <SearchableSelect
                            value={value}
                            onChange={onChange}
                            disabled={isReadOnly}
                            options={filteredOptions}
                            placeholder="Select Module..."
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Description
                    </label>
                    <input
                      {...register("description", { required: true })}
                      disabled={isReadOnly}
                      placeholder="e.g. Standard Bill Approval Cycle"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Initiator Role
                    </label>
                    <Controller
                      name="initiatorRole"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <AsyncSelect
                          endpoint="/workflow-roles"
                          queryParams={{ wfRoleType: "submit" }}
                          labelFormat={(r) =>
                            r ? `${r.wfRoleCode} - ${r.description}` : ""
                          }
                          value={value}
                          onChange={onChange}
                          disabled={isReadOnly}
                          placeholder="Who can start this?"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Organizational Context (Optional)
                    </label>
                    <Controller
                      name="moduleContext"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <AsyncSelect
                          endpoint="/subsidaries"
                          labelFormat={(s) =>
                            s ? `${s.subCode} - ${s.description}` : ""
                          }
                          value={value}
                          onChange={onChange}
                          disabled={isReadOnly}
                          placeholder="Link to Subsidiary..."
                        />
                      )}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection id="stages" title="Approval Sequence" icon="Layers">
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative pl-12 group">
                      {index < fields.length - 1 && (
                        <div className="absolute left-[23px] top-12 bottom-[-16px] w-0.5 bg-slate-100 transition-colors" />
                      )}

                      <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                        <input
                          type="hidden"
                          {...register(`WorkflowStage.${index}.stageNumber`)}
                        />
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-200 z-10">
                          {index + 1}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-all relative">
                        {!isReadOnly && (
                          <div className="absolute top-4 right-4 animate-in fade-in duration-300">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => remove(index)}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )}

                        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                          {/* 1. Toggles First (Per Request) */}
                          <div className="space-y-3 pb-2 border-r border-slate-100 pr-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                Static Approver
                              </label>
                              <Controller
                                name={`WorkflowStage.${index}.isStatic`}
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                  <Switch
                                    checked={value}
                                    onCheckedChange={onChange}
                                    disabled={isReadOnly}
                                  />
                                )}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                Notify Only
                              </label>
                              <Controller
                                name={`WorkflowStage.${index}.isNotificationOnly`}
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                  <Switch
                                    checked={value}
                                    onCheckedChange={onChange}
                                    disabled={isReadOnly}
                                  />
                                )}
                              />
                            </div>
                          </div>

                          {/* 2. Stage Name & Approver Logic */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] flex items-center justify-between">
                              Stage Name
                              {errors?.WorkflowStage?.[index]?.stageName && (
                                <span className="text-red-500 text-[10px] font-bold tracking-[0.1em] [word-spacing:0.05em] animate-pulse">
                                  Required!
                                </span>
                              )}
                            </label>
                            <input
                              {...register(`WorkflowStage.${index}.stageName`, {
                                required: "Stage name is mandatory",
                              })}
                              disabled={isReadOnly}
                              placeholder="e.g. Dept Head Review"
                              className={cn(
                                "w-full h-11 px-4 rounded-xl border transition-all text-sm font-bold disabled:opacity-60",
                                errors?.WorkflowStage?.[index]?.stageName
                                  ? "border-red-200 bg-red-50/30 focus:border-red-400"
                                  : "border-slate-200 bg-slate-50/50 focus:border-indigo-300 focus:bg-white",
                              )}
                            />
                          </div>

                          {!watch(`WorkflowStage.${index}.isStatic`) &&
                            !watch(
                              `WorkflowStage.${index}.isNotificationOnly`,
                            ) && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Approver Role
                                </label>
                                <Controller
                                  name={`WorkflowStage.${index}.stageApproverRole`}
                                  control={control}
                                  render={({ field: { value, onChange } }) => (
                                    <AsyncSelect
                                      endpoint="/workflow-roles"
                                      queryParams={{ wfRoleType: "approve" }}
                                      labelFormat={(r) =>
                                        r
                                          ? `${r.wfRoleCode} - ${r.roleName || r.description}`
                                          : ""
                                      }
                                      value={value}
                                      onChange={onChange}
                                      disabled={isReadOnly}
                                      placeholder="Select Role..."
                                    />
                                  )}
                                />
                              </div>
                            )}

                          {watch(`WorkflowStage.${index}.isStatic`) &&
                            !watch(
                              `WorkflowStage.${index}.isNotificationOnly`,
                            ) && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Specific Approver
                                </label>
                                <Controller
                                  name={`WorkflowStage.${index}.specificApprovers`}
                                  control={control}
                                  render={({ field: { value, onChange } }) => (
                                    <AsyncSelect
                                      endpoint="/users"
                                      queryParams={{ isActive: true }}
                                      labelFormat={(u) =>
                                        u ? `${u.fullName} (${u.email})` : ""
                                      }
                                      value={
                                        Array.isArray(value) ? value[0] : value
                                      }
                                      onChange={(val) =>
                                        onChange(val ? [val] : [])
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Select One User..."
                                    />
                                  )}
                                />
                              </div>
                            )}

                          {/* Approval Mode (Only for Role-based workflows) */}
                          {!watch(`WorkflowStage.${index}.isStatic`) &&
                            !watch(
                              `WorkflowStage.${index}.isNotificationOnly`,
                            ) && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Approval Mode
                                </label>
                                <select
                                  {...register(
                                    `WorkflowStage.${index}.approvalType`,
                                  )}
                                  disabled={isReadOnly}
                                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold disabled:opacity-60"
                                >
                                  <option value="any">Any can approve</option>
                                  <option value="all">All must approve</option>
                                </select>
                              </div>
                            )}

                          {/* Amount Rules (Hide if Notification Only) */}
                          {!watch(
                            `WorkflowStage.${index}.isNotificationOnly`,
                          ) && (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Min Amount
                                </label>
                                <input
                                  type="number"
                                  {...register(
                                    `WorkflowStage.${index}.minAmount`,
                                    { valueAsNumber: true },
                                  )}
                                  disabled={isReadOnly}
                                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-black disabled:opacity-60"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Max Amount
                                </label>
                                <input
                                  type="number"
                                  {...register(
                                    `WorkflowStage.${index}.maxAmount`,
                                    { valueAsNumber: true },
                                  )}
                                  disabled={isReadOnly}
                                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-black disabled:opacity-60"
                                />
                              </div>
                            </>
                          )}

                          {/* Advanced Stage Rules */}
                          <div className="md:col-span-4 border-t border-slate-50 pt-4 mt-2">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Column 1: SLA & Toggles */}
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                    SLA Hours
                                  </label>
                                  <input
                                    type="number"
                                    {...register(
                                      `WorkflowStage.${index}.slaHours`,
                                      { valueAsNumber: true },
                                    )}
                                    disabled={isReadOnly}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-black disabled:opacity-60"
                                  />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                  <label className="text-[10px] font-black uppercase text-slate-900 tracking-wider">
                                    Enforce Fields?
                                  </label>
                                  <Switch
                                    checked={
                                      (watch(
                                        `WorkflowStage.${index}.mandatoryFields`,
                                      )?.length || 0) > 0 ||
                                      !!watch(
                                        `WorkflowStage.${index}._enableMandatory`,
                                      )
                                    }
                                    onCheckedChange={(val) => {
                                      if (isReadOnly) return;
                                      if (!val)
                                        setValue(
                                          `WorkflowStage.${index}.mandatoryFields`,
                                          [],
                                        );
                                      setValue(
                                        `WorkflowStage.${index}._enableMandatory`,
                                        val,
                                      );
                                    }}
                                    disabled={isReadOnly}
                                  />
                                </div>
                              </div>

                              {/* Column 2 & 3: Notification Emails */}
                              <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                                  Notification Recipients (Comma Separated)
                                </label>
                                <textarea
                                  {...register(
                                    `WorkflowStage.${index}.notificationEmailsRaw`,
                                  )}
                                  disabled={isReadOnly}
                                  placeholder="email1@company.com, email2@company.com"
                                  className="w-full h-[100px] p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-[11px] font-medium resize-none transition-all outline-none focus:ring-4 focus:ring-indigo-500/5 placeholder:font-normal"
                                />
                              </div>

                              {/* Full Width Row: Mandatory Fields Badge Cloud */}
                              {(watch(
                                `WorkflowStage.${index}._enableMandatory`,
                              ) ||
                                (watch(`WorkflowStage.${index}.mandatoryFields`)
                                  ?.length || 0) > 0) && (
                                <div className="col-span-full space-y-2 animate-in fade-in slide-in-from-top-2">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] flex items-center gap-2">
                                    <Shield
                                      size={12}
                                      className="text-indigo-500"
                                    />
                                    Required Fields for Approval
                                  </label>

                                  <Popover.Root>
                                    <Popover.Trigger asChild>
                                      <div
                                        className={cn(
                                          "min-h-[80px] w-full p-4 rounded-2xl border transition-all flex flex-wrap gap-2 items-start",
                                          isReadOnly
                                            ? "bg-slate-50 border-slate-200 cursor-default opacity-80"
                                            : "bg-white border-slate-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-500/5 cursor-pointer shadow-sm",
                                        )}
                                      >
                                        {watch(
                                          `WorkflowStage.${index}.mandatoryFields`,
                                        ) &&
                                        watch(
                                          `WorkflowStage.${index}.mandatoryFields`,
                                        ).length > 0 ? (
                                          watch(
                                            `WorkflowStage.${index}.mandatoryFields`,
                                          ).map((f, fIdx) => {
                                            const field = getModuleFields(
                                              watchTransactionType,
                                            ).find(
                                              (opt) =>
                                                opt.value === f.fieldName,
                                            );
                                            return (
                                              <span
                                                key={fIdx}
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100 uppercase tracking-tight shadow-sm"
                                              >
                                                {field?.label || f.fieldName}
                                              </span>
                                            );
                                          })
                                        ) : (
                                          <div className="flex flex-col items-center justify-center w-full py-2 text-slate-400 space-y-1">
                                            <Plus
                                              size={20}
                                              className="text-slate-200"
                                            />
                                            <span className="text-[11px] font-medium italic">
                                              Click to define mandatory
                                              fields...
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </Popover.Trigger>
                                    {!isReadOnly && (
                                      <Popover.Portal>
                                        <Popover.Content
                                          side="bottom"
                                          align="start"
                                          sideOffset={8}
                                          className="z-[100] w-[450px] bg-white border border-slate-200 rounded-3xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95"
                                        >
                                          {/* Header & Search */}
                                          <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                                            <div className="flex items-center justify-between mb-3">
                                              <div>
                                                <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">
                                                  Select Required Fields
                                                </h4>
                                                <p className="text-[9px] text-slate-400 font-medium">
                                                  Fields selected here must be
                                                  filled before approval
                                                </p>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="ghost"
                                                  size="xs"
                                                  className="text-[9px] h-6 px-2 text-indigo-600 hover:bg-indigo-50 font-bold uppercase tracking-[0.1em]"
                                                  onClick={() => {
                                                    const allFields =
                                                      getModuleFields(
                                                        watchTransactionType,
                                                      ).map((f) => ({
                                                        fieldName: f.value,
                                                      }));
                                                    setValue(
                                                      `WorkflowStage.${index}.mandatoryFields`,
                                                      allFields,
                                                      { shouldDirty: true },
                                                    );
                                                  }}
                                                >
                                                  Select All
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="xs"
                                                  className="text-[9px] h-6 px-2 text-red-600 hover:bg-red-50 font-bold uppercase tracking-[0.1em]"
                                                  onClick={() =>
                                                    setValue(
                                                      `WorkflowStage.${index}.mandatoryFields`,
                                                      [],
                                                      { shouldDirty: true },
                                                    )
                                                  }
                                                >
                                                  Clear
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="relative">
                                              <Search
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={12}
                                              />
                                              <input
                                                placeholder="Search available fields..."
                                                value={fieldSearch}
                                                onChange={(e) =>
                                                  setFieldSearch(e.target.value)
                                                }
                                                className="w-full h-8 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-[11px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all"
                                              />
                                            </div>
                                          </div>

                                          <div className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-1">
                                              {getModuleFields(
                                                watchTransactionType,
                                              ).filter(
                                                (f) =>
                                                  !fieldSearch ||
                                                  f.label
                                                    .toLowerCase()
                                                    .includes(
                                                      fieldSearch.toLowerCase(),
                                                    ),
                                              ).length > 0 ? (
                                                getModuleFields(
                                                  watchTransactionType,
                                                )
                                                  .filter(
                                                    (f) =>
                                                      !fieldSearch ||
                                                      f.label
                                                        .toLowerCase()
                                                        .includes(
                                                          fieldSearch.toLowerCase(),
                                                        ),
                                                  )
                                                  .map((field) => {
                                                    const fieldPath = `WorkflowStage.${index}.mandatoryFields`;
                                                    const currentMandatory =
                                                      watch(fieldPath) || [];
                                                    const isSelected =
                                                      currentMandatory.some(
                                                        (f) =>
                                                          f.fieldName ===
                                                          field.value,
                                                      );

                                                    return (
                                                      <div
                                                        key={field.value}
                                                        onClick={() => {
                                                          if (isReadOnly)
                                                            return;
                                                          let newList = [
                                                            ...currentMandatory,
                                                          ];
                                                          if (isSelected) {
                                                            newList =
                                                              newList.filter(
                                                                (f) =>
                                                                  f.fieldName !==
                                                                  field.value,
                                                              );
                                                          } else {
                                                            newList.push({
                                                              fieldName:
                                                                field.value,
                                                            });
                                                          }
                                                          setValue(
                                                            fieldPath,
                                                            newList,
                                                            {
                                                              shouldDirty: true,
                                                            },
                                                          );
                                                        }}
                                                        className={cn(
                                                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border group",
                                                          isSelected
                                                            ? "bg-indigo-50/50 border-indigo-100 text-indigo-700"
                                                            : "hover:bg-slate-50 border-transparent text-slate-500 hover:text-slate-900",
                                                        )}
                                                      >
                                                        <div
                                                          className={cn(
                                                            "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0",
                                                            isSelected
                                                              ? "bg-indigo-600 border-indigo-600 shadow-sm"
                                                              : "border-slate-200 group-hover:border-slate-300 bg-white",
                                                          )}
                                                        >
                                                          {isSelected && (
                                                            <Check
                                                              size={10}
                                                              className="text-white stroke-[4px]"
                                                            />
                                                          )}
                                                        </div>
                                                        <span className="text-[10px] font-bold truncate leading-tight uppercase tracking-tight">
                                                          {field.label}
                                                        </span>
                                                      </div>
                                                    );
                                                  })
                                              ) : (
                                                <div className="col-span-2 py-8 text-center">
                                                  <p className="text-[10px] text-slate-400 font-medium italic">
                                                    No fields match your search
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </Popover.Content>
                                      </Popover.Portal>
                                    )}
                                  </Popover.Root>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!isReadOnly && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="soft"
                        onClick={() =>
                          append({
                            stageName: "",
                            stageNumber: fields.length + 1,
                            minAmount: 0,
                            maxAmount: 0,
                            mandatoryFields: [],
                            notificationEmailsRaw: "",
                            isStatic: false,
                            isNotificationOnly: false,
                            slaHours: 24,
                          })
                        }
                        className="rounded-full"
                        leftIcon={<Plus size={16} />}
                      >
                        Add Approval Stage
                      </Button>
                    </div>
                  )}
                </div>
              </FormSection>
            </>
          ) : (
            <>
              <FormSection
                id="roleInfo"
                title="Workflow Role Details"
                icon="Shield"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Role Code
                    </label>
                    <input
                      {...register("wfRoleCode", {
                        required: true,
                        onChange: (e) => {
                          const upper = e.target.value.toUpperCase();
                          e.target.value = upper;
                          setValue("wfRoleCode", upper);
                        },
                      })}
                      disabled={isEdit}
                      placeholder="e.g. APPROVER_LV1"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold disabled:opacity-60 uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Role Name
                    </label>
                    <input
                      {...register("roleName", { required: true })}
                      disabled={isReadOnly}
                      placeholder="e.g. Level 1 Approver"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Description
                    </label>
                    <textarea
                      {...register("description", { required: true })}
                      disabled={isReadOnly}
                      placeholder="Describe the purpose of this role..."
                      className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium disabled:opacity-60 resize-none"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                id="capabilities"
                title="Capability Matrix"
                icon="Lock"
              >
                <div className="bg-white border border-slate-100 rounded-3xl p-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      {
                        value: "submit",
                        label: "Submit",
                        color: "bg-indigo-500",
                        icon: Plus,
                      },
                      {
                        value: "approve",
                        label: "Approve",
                        color: "bg-green-500",
                        icon: Shield,
                      },
                      {
                        value: "reject",
                        label: "Reject",
                        color: "bg-red-500",
                        icon: Trash2,
                      },
                      {
                        value: "delegate",
                        label: "Delegate",
                        color: "bg-amber-500",
                        icon: ArrowRight,
                      },
                      {
                        value: "admin",
                        label: "Admin",
                        color: "bg-slate-900",
                        icon: Settings,
                      },
                    ].map((cap) => {
                      const currentCaps = watch("wfRoleType") || [];
                      const isActive = currentCaps.includes(cap.value);
                      const Icon = cap.icon;

                      return (
                        <button
                          key={cap.value}
                          type="button"
                          onClick={() => {
                            if (isReadOnly) return;
                            const next = isActive
                              ? currentCaps.filter((c) => c !== cap.value)
                              : [...currentCaps, cap.value];
                            reset(
                              { ...watch(), wfRoleType: next },
                              { keepDefaultValues: true },
                            );
                          }}
                          className={cn(
                            "group flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all duration-300 relative overflow-hidden",
                            isActive
                              ? `${cap.color} border-transparent text-white shadow-lg`
                              : "bg-slate-50/50 border-slate-100 text-slate-400 hover:border-indigo-100",
                          )}
                        >
                          <Icon size={24} />
                          <span className="text-xs font-bold">{cap.label}</span>
                          {isActive && (
                            <Check
                              size={12}
                              className="absolute top-2 right-2 text-white/50"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FormSection>
            </>
          )}

          <FormSection id="system" title="System Information" icon="Settings">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onCheckedChange={onChange}
                        disabled={isReadOnly}
                      />
                    )}
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {watch("isActive") ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
              <div className="grid gap-6 grid-cols-2 md:col-span-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Created By
                  </label>
                  <div className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    {watch("createdBy") || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Created At
                  </label>
                  <div className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    {watch("createdAt") || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Updated By
                  </label>
                  <div className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    {watch("updatedBy") || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Updated At
                  </label>
                  <div className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    {watch("updatedAt") || "-"}
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </Accordion>

        <FormActionBar
          isDirty={isDirty}
          isSubmitting={submitting}
          onCancel={() => navigate(isRoleMode ? "/workflowRole" : "/workflow")}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          submitLabel={
            isRoleMode
              ? isEdit
                ? "Update Role"
                : "Create Role"
              : isEdit
                ? "Update Workflow"
                : "Create Workflow"
          }
          cancelLabel="Back to List"
        />
      </form>

      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail
          recordId={data?._id}
          collectionName={isRoleMode ? "workflowrole" : "workflow"}
        />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail
          transactionId={data?._id}
          transactionModel={isRoleMode ? "WorkflowRole" : "Workflow"}
        />
      </Drawer>
    </>
  );
}
