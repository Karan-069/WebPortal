import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database,
  Loader2,
  Edit2,
  History,
  Send,
  MoreVertical,
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
import CsvDownload from "../../../components/ui/CsvDownload";

import Drawer from "../../../components/ui/Drawer";
import AuditTrail from "../../../components/common/AuditTrail";
import WorkflowTrail from "../../../components/common/WorkflowTrail";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import { Switch } from "../../../components/ui/Switch";

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

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const config = apiRegistry.item;
  const isEdit = !!id && id !== "new";
  const [isViewing, setIsViewing] = useState(isEdit);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [features, setFeatures] = useState({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);
  const [itemData, setItemData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: config.schema ? zodResolver(config.schema) : undefined,
    defaultValues: { isActive: true, canBeFulfilled: true },
  });

  // Fetch Features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get("/features");
        const featureObj = {};
        res.data.data.forEach((f) => {
          featureObj[f.name] = f.isEnabled;
        });
        setFeatures(featureObj);
      } catch (err) {
        console.error("Failed to fetch features", err);
      }
    };
    fetchFeatures();
  }, []);

  // Fetch record for edit/view mode
  useEffect(() => {
    const fetchRecord = async () => {
      if (isEdit && config) {
        setLoading(true);
        dispatch(setGlobalLoading(true));
        try {
          const res = await api.get(`${config.endpoint}/${id}`);
          const data = res.data.data;
          setItemData(data);

          dispatch(
            setPageContext({
              title: `${isViewing ? "View" : "Edit"} Item: ${data.itemCode || data._id}`,
              actions: [],
            }),
          );

          const formData = { ...data };

          if (data.createdBy && typeof data.createdBy === "object") {
            formData.createdBy = data.createdBy.fullName || data.createdBy._id;
          }
          if (data.updatedBy && typeof data.updatedBy === "object") {
            formData.updatedBy = data.updatedBy.fullName || data.updatedBy._id;
          }
          if (data.approvedBy && typeof data.approvedBy === "object") {
            formData.approvedBy =
              data.approvedBy.fullName || data.approvedBy._id;
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

          config.formSections.forEach((section) => {
            section.fields.forEach((field) => {
              if (
                field.type === "asyncSelect" &&
                data[field.name] &&
                typeof data[field.name] === "object"
              ) {
                formData[field.name] = data[field.name]._id;
              }
            });
          });

          reset(formData);
        } catch (err) {
          toast.error(err.message || "Failed to fetch item data");
          navigate("/item");
        } finally {
          setLoading(false);
          dispatch(setGlobalLoading(false));
        }
      } else {
        dispatch(
          setPageContext({
            title: "Create New Item",
            actions: [],
          }),
        );
      }
    };

    fetchRecord();
  }, [isEdit, id, config, reset, dispatch, navigate, isViewing]);

  const fetchHistory = () => setIsHistoryOpen(true);
  const fetchWorkflowTrail = () => setIsWfTrailOpen(true);

  const onSubmit = async (values) => {
    setSubmitting(true);
    dispatch(setGlobalLoading(true));
    try {
      // Remove metadata fields that should not be sent to the backend
      const { createdBy, updatedBy, createdAt, updatedAt, ...payload } = values;

      // If auto-generate is on and we are creating, remove empty itemCode to let backend handle it
      if (!isEdit && features.itemCodeAutoGenerate && !payload.itemCode) {
        delete payload.itemCode;
      }

      if (isEdit) {
        await api.patch(`${config.endpoint}/${id}`, payload);
        toast.success(`Item updated successfully`);
        setIsViewing(true);
      } else {
        const res = await api.post(config.endpoint, payload);
        toast.success(`New item created successfully`);
        const newRecord = res.data.data;
        const navId = newRecord[config.displayIdField] || newRecord._id;
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
    try {
      await api.patch(`${config.endpoint}/${id}/submit`);
      toast.success("Item submitted for approval");
      navigate("/item");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Determine read-only based on permissions and component state
  const menu = user?.userRole?.menus?.find((m) => {
    const checkId = typeof m.menuId === "object" ? m.menuId?.menuId : m.menuId;
    return checkId?.toLowerCase() === "item";
  });
  const hasEditPermission = menu?.permissions?.some((p) =>
    ["edit", "all", "submit", "approve"].includes(p.toLowerCase()),
  );
  const isReadOnly =
    isViewing ||
    !hasEditPermission ||
    (itemData?.transactionStatus &&
      !["draft", "rejected"].includes(itemData.transactionStatus));

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
        features={features}
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
        handleSubmitForApproval={handleSubmitForApproval}
        id={id}
      />
    </FormPage>
  );
}

function ItemFormInner({
  config,
  isEdit,
  isViewing,
  setIsViewing,
  itemData,
  hasEditPermission,
  isReadOnly,
  features,
  isHistoryOpen,
  setIsHistoryOpen,
  isWfTrailOpen,
  setIsWfTrailOpen,
  register,
  control,
  errors,
  handleSubmit,
  onSubmit,
  submitting,
  isDirty,
  navigate,
  getValues,
  handleSubmitForApproval,
  id,
}) {
  const { expandedIds, setExpandedIds } = useFormContext();

  const renderField = (field) => {
    const fieldDisabled =
      isReadOnly ||
      field.disabled ||
      (isEdit ? field.disabledOnEdit : field.disabledOnCreate);

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
              field.name === "itemCode" && features.itemCodeAutoGenerate
                ? "Auto-generated on save"
                : `Enter ${field.label.toLowerCase()}...`
            }
            disabled={
              fieldDisabled ||
              (field.name === "itemCode" &&
                features.itemCodeAutoGenerate &&
                !isEdit)
            }
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

  return (
    <>
      <FormHeader
        title={
          isEdit
            ? getValues().itemCode
              ? `Item: ${getValues().itemCode}`
              : "Update Item"
            : "Create New Item"
        }
        subtitle={
          isEdit && itemData?.itemCode
            ? `Record ID: ${itemData.itemCode}`
            : `Define a new master record`
        }
        breadcrumbs={["Item Master", isEdit ? "Update" : "New"]}
        onBack={() => navigate("/item")}
      >
        {isEdit &&
          isViewing &&
          hasEditPermission &&
          (itemData?.transactionStatus === "draft" ||
            !itemData?.transactionStatus) && (
            <button
              onClick={() => setIsViewing(false)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Item
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
          onCancel={() =>
            isViewing
              ? navigate("/item")
              : isEdit
                ? setIsViewing(true)
                : navigate("/item")
          }
          submitLabel={isEdit ? "Update Item" : "Create Item"}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          cancelLabel={isReadOnly ? "Return to List" : "Cancel Changes"}
        >
          {!isReadOnly &&
            isEdit &&
            features.itemWorkflowEnabled &&
            itemData?.transactionStatus === "draft" && (
              <button
                type="button"
                onClick={handleSubmitForApproval}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all bg-amber-500 text-white hover:bg-amber-600 h-11 px-6 shadow-md shadow-amber-200"
              >
                <Send className="w-4 h-4 mr-2" /> Submit for Approval
              </button>
            )}
        </FormActionBar>
      </form>

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
