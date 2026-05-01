import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useFeatures } from "../../../hooks/useFeatures";
import { useWorkflowState } from "../../../hooks/useWorkflowState";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database,
  Loader2,
  Edit2,
  History,
  Send,
  MoreVertical,
  CheckCircle,
  XCircle,
  HelpCircle,
  UserPlus,
  RefreshCcw,
  Edit,
  Eye,
  Save,
  ChevronDown,
} from "lucide-react";

import { apiRegistry } from "../../../config/apiRegistry";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading as setGlobalLoading,
  setPageContext,
} from "../../../store/features/uiSlice";
import AsyncSelect from "../../../components/ui/AsyncSelect";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import CsvDownload from "../../../components/ui/CsvDownload";

import Drawer from "../../../components/ui/Drawer";
import AuditTrail from "../../../components/common/AuditTrail";
import WorkflowTrail from "../../../components/common/WorkflowTrail";
import WorkflowActionDialog from "../../../components/common/WorkflowActionDialog";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import { Switch } from "../../../components/ui/Switch";
import Button from "../../../components/ui/Button";

// Unified Form Architecture
import FormPage from "../../../components/form/FormPage";
import FormHeader from "../../../components/form/FormHeader";
import FormSection from "../../../components/form/FormSection";
import FormField from "../../../components/form/FormField";
import FormActionBar from "../../../components/form/FormActionBar";
import { useFormContext } from "../../../components/form/FormContext";
import { Accordion } from "../../../components/ui/Accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../components/ui/DropdownMenu";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const config = apiRegistry.item;
  const isEdit = !!id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);

  // Sync viewing mode with route changes
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const { isEnabled } = useFeatures();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [wfComments, setWfComments] = useState("");
  const [isActioning, setIsActioning] = useState(false);
  const [isAmending, setIsAmending] = useState(false);
  const [isConfirmAmendOpen, setIsConfirmAmendOpen] = useState(false);
  const [delegatedToUserId, setDelegatedToUserId] = useState(null);

  const { workflowState, refresh: refreshWf } = useWorkflowState(
    itemData?._id,
    "Item",
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: config.schema ? zodResolver(config.schema) : undefined,
    defaultValues: { isActive: true, canBeFulfilled: true },
  });

  // Determine read-only based on permissions and component state
  const menu = user?.userRole?.menus?.find((m) => {
    const checkId = typeof m.menuId === "object" ? m.menuId?.menuId : m.menuId;
    return checkId?.toLowerCase() === "item";
  });
  const hasEditPermission = menu?.permissions?.some((p) =>
    ["edit", "all"].includes(p.toLowerCase()),
  );

  // A record is read-only if we are in viewing mode OR if it's locked by workflow
  // (unless the workflow specifically allows editing for this stage/user)
  const isLockedByWf =
    itemData?.transactionStatus &&
    !["draft", "rejected", "recalled"].includes(itemData.transactionStatus) &&
    !workflowState?.canEdit;
  const isReadOnly = isViewing || !hasEditPermission || isLockedByWf;

  useEffect(() => {
    fetchRecord();
  }, [isEdit, id, config, reset]);

  // Set Page Context Actions
  useEffect(() => {
    if (config) {
      const headerActions = [];

      // canEdit from workflow overrides menu-level permission (e.g. for Approvers with mandatory fields)
      const canEditThisRecord =
        workflowState?.canEdit ||
        (hasEditPermission &&
          (!itemData?.transactionStatus ||
            ["draft", "rejected", "recalled"].includes(
              itemData?.transactionStatus,
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
              fetchRecord();
            } else {
              navigate("/item");
            }
          },
          variant: "secondary",
        });
      }

      dispatch(
        setPageContext({
          title: isEdit
            ? `${isViewing ? "View" : "Edit"} Item: ${itemData?.itemCode || id}`
            : "Create New Item",
          actions: headerActions,
        }),
      );
    }
  }, [
    isEdit,
    id,
    isViewing,
    itemData,
    workflowState,
    hasEditPermission,
    dispatch,
    navigate,
  ]);

  const fetchHistory = () => setIsHistoryOpen(true);
  const fetchWorkflowTrail = () => setIsWfTrailOpen(true);

  const onSubmit = async (values) => {
    // Dynamic Mandatory Fields Check (Stage-specific)
    const missingFields = (workflowState?.mandatoryFields || []).filter((f) => {
      const val = values[f];
      return val === undefined || val === null || val === "";
    });

    if (missingFields.length > 0) {
      const allFields = config.formSections.flatMap((s) => s.fields);
      const labels = missingFields.map(
        (f) => allFields.find((af) => af.name === f)?.label || f,
      );
      toast.error(`Workflow Mandatory Fields Missing: ${labels.join(", ")}`);
      return;
    }

    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      const flattenPayload = (obj) => {
        if (!obj || typeof obj !== "object" || obj instanceof Date) {
          return obj;
        }
        if (Array.isArray(obj)) return obj.map(flattenPayload);

        if (obj._id || obj.value) {
          return obj._id || obj.value;
        }

        const newObj = {};
        Object.keys(obj).forEach((key) => {
          newObj[key] = flattenPayload(obj[key]);
        });
        return newObj;
      };

      const { createdBy, updatedBy, createdAt, updatedAt, _id, __v, ...rest } =
        values;
      const payload = {};
      Object.keys(rest).forEach((key) => {
        payload[key] = flattenPayload(rest[key]);
      });

      // If auto-generate is on and we are creating, remove empty itemCode to let backend handle it
      if (!isEdit && isEnabled("AUTOID_ITEM")) {
        if (!payload.itemCode) delete payload.itemCode;

        // Ensure prefix source (itemType) is present
        if (!payload.itemType) {
          toast.error("Please select an Item Type for auto-code generation");
          setSubmitting(false);
          dispatch(setGlobalLoading(false));
          return;
        }
      }

      if (isEdit) {
        await api.patch(`${config.endpoint}/${id}`, payload);
        toast.success(`Item updated successfully`);
        setIsViewing(true);
      } else {
        const res = await api.post(config.endpoint, payload);
        toast.success(`New item created successfully`);
        const newRecord = res.data.data;
        let navId = newRecord[config.displayIdField] || newRecord._id;

        // Prevent navigating to "undefined-XXX" URLs if backend auto-id failed
        if (String(navId).includes("undefined")) {
          navId = newRecord._id;
        }

        navigate(`/item/${navId}`);
        return;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Submission failed";
      toast.error(message);
      console.error("Submission error details:", err.response?.data);
    } finally {
      setSubmitting(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      await api.patch(`${config.endpoint}/${id}/submit`);
      toast.success("Item submitted for approval");
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
        transactionId: itemData._id,
        transactionModel: "Item",
        action: activeAction,
        comments: wfComments,
      };

      if (activeAction === "delegate") {
        payload.delegatedToUserId = delegatedToUserId;
      }

      await api.post(`/workflows/action`, payload);
      toast.success(`Item ${activeAction?.replace("_", " ")}d successfully`);
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

  const handleAmend = async () => {
    setIsAmending(true);
    dispatch(setGlobalLoading(true));
    try {
      await api.post("/workflows/amend", {
        transactionId: itemData._id,
        transactionModel: "Item",
      });
      toast.success("Transaction amended successfully. You can now edit.");
      fetchRecord();
      refreshWf();
      setIsViewing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Amendment failed");
    } finally {
      setIsAmending(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const fetchRecord = async () => {
    if (isEdit && config) {
      setLoading(true);
      dispatch(setGlobalLoading(true));
      try {
        const res = await api.get(`${config.endpoint}/${id}`);
        const data = res.data.data;
        setItemData(data);

        const formData = { ...data };

        if (data.createdBy && typeof data.createdBy === "object") {
          formData.createdBy = data.createdBy.fullName || data.createdBy._id;
        }
        if (data.updatedBy && typeof data.updatedBy === "object") {
          formData.updatedBy = data.updatedBy.fullName || data.updatedBy._id;
        }
        if (data.approvedBy && typeof data.approvedBy === "object") {
          formData.approvedBy = data.approvedBy.fullName || data.approvedBy._id;
        }

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

        reset(formData);
      } catch (err) {
        toast.error(err.message || "Failed to fetch item data");
        navigate("/item");
      } finally {
        setLoading(false);
        dispatch(setGlobalLoading(false));
      }
    }
  };

  if (loading || !config) return null;

  const allSectionIds = config.formSections.map((_, i) => `item-${i}`);

  return (
    <FormPage allSectionIds={allSectionIds} defaultOpenSections={allSectionIds}>
      <ItemFormInner
        config={config}
        isEdit={isEdit}
        isViewing={isViewing}
        setIsViewing={setIsViewing}
        itemData={itemData}
        hasEditPermission={hasEditPermission}
        isReadOnly={isReadOnly}
        isEnabled={isEnabled}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        isWfTrailOpen={isWfTrailOpen}
        setIsWfTrailOpen={setIsWfTrailOpen}
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        submitting={submitting}
        isDirty={isDirty}
        navigate={navigate}
        getValues={getValues}
        setValue={setValue}
        watch={watch}
        handleSubmitForApproval={handleSubmitForApproval}
        workflowState={workflowState}
        id={id}
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

function ItemFormInner(props) {
  const {
    config,
    isEdit,
    isViewing,
    setIsViewing,
    itemData,
    hasEditPermission,
    isReadOnly,
    isEnabled,
    isHistoryOpen,
    setIsHistoryOpen,
    isWfTrailOpen,
    setIsWfTrailOpen,
    register,
    control,
    errors,
    watch,
    onSubmit,
    submitting,
    isDirty,
    navigate,
    getValues,
    setValue,
    handleSubmit,
    handleSubmitForApproval,
    workflowState,
    id,
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
  } = props;

  const { expandedIds, setExpandedIds } = useFormContext();

  const renderField = (field) => {
    const fieldDisabled =
      isReadOnly ||
      field.disabled ||
      (isEdit ? field.disabledOnEdit : field.disabledOnCreate);
    const isWorkflowMandatory = workflowState?.mandatoryFields?.includes(
      field.name,
    );
    const isRequired =
      (field.required || isWorkflowMandatory) && !fieldDisabled;

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
                placeholder={`Select ${field.label.toLowerCase()}...`}
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
                placeholder={`Select ${field.label.toLowerCase()}...`}
              />
            )}
          />
        ) : field.type === "select" ? (
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
        ) : field.type === "checkbox" ? (
          <div className="flex items-center gap-3 pt-1">
            <Controller
              name={field.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <Switch
                    checked={value}
                    onCheckedChange={onChange}
                    disabled={fieldDisabled}
                  />
                  <span className="text-sm font-medium text-slate-600">
                    {value ? "Enabled / Active" : "Disabled / Inactive"}
                  </span>
                </>
              )}
            />
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
            placeholder={
              field.name === "itemCode" && isEnabled("AUTOID_ITEM")
                ? "Auto-generated on save"
                : `Enter ${field.label.toLowerCase()}...`
            }
            disabled={
              fieldDisabled ||
              (field.name === "itemCode" && isEnabled("AUTOID_ITEM") && !isEdit)
            }
            {...register(field.name, {
              onChange: (e) => {
                if (field.name === "itemCode") {
                  const upper = e.target.value.toUpperCase();
                  e.target.value = upper; // Visual sync
                  setValue(field.name, upper); // Form state sync
                }
              },
            })}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-slate-50/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60",
              field.name === "itemCode" && "uppercase font-bold tracking-wider",
              errors[field.name]
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-400",
            )}
          />
        )}
      </FormField>
    );
  };

  return (
    <>
      <FormHeader
        title={
          isEdit ? (
            getValues().itemCode ? (
              <div className="flex items-center gap-2">
                Item{" "}
                <code className="text-[0.7em] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {getValues().itemCode}
                </code>
              </div>
            ) : (
              "Update Item"
            )
          ) : (
            "Create New Item"
          )
        }
        subtitle={
          isEdit && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Status:
                </span>
                <StatusBadge status={itemData?.transactionStatus || "Draft"} />
              </div>

              {isEnabled("WF_ITEM") && workflowState?.currentStageName && (
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
        breadcrumbs={["Item Master", isEdit ? "Update" : "New"]}
        onBack={() => navigate("/item")}
      >
        {isEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl"
              >
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
              {isEnabled("WF_ITEM") && (
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
                columns={config.columns}
                filename={`item_${getValues().itemCode || id}.csv`}
                asDropdownItem={true}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </FormHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="multiple"
          value={expandedIds}
          onValueChange={setExpandedIds}
          className="space-y-6"
        >
          {config.formSections.map((section, sidx) => (
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
          ))}
        </Accordion>

        <FormActionBar
          isDirty={isDirty}
          isSubmitting={submitting}
          onCancel={() => navigate("/item")}
          submitLabel={isEdit ? "Save as Draft" : "Create Record"}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          cancelLabel="Return to List"
        >
          {/* Integrated Workflow Actions - Enterprise Flow */}
          <div className="flex items-center gap-2 mr-4">
            {/* 1. Submission Flow */}
            {isEnabled("WF_ITEM") &&
              isEdit &&
              isViewing &&
              (!itemData?.transactionStatus ||
                ["draft", "rejected", "recalled"].includes(
                  itemData?.transactionStatus?.toLowerCase(),
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
                itemData?.transactionStatus?.toLowerCase(),
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
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={itemData?._id} collectionName="item" />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail transactionId={itemData?._id} transactionModel="Item" />
      </Drawer>
    </>
  );
}
