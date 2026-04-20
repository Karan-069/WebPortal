import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import api from "../../services/api";
import { masterModules } from "../../config/moduleConfig";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// ─── State Select Field ──────────────────────────────────────────────────────
function StateSelectField({ control, name, errors, disabled }) {
  const { data: states = [], isLoading } = useQuery({
    queryKey: ["states-dropdown"],
    queryFn: async () => {
      const res = await api.get("/states");
      return res.data?.data || [];
    },
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <select
          id={`field-${name}`}
          {...field}
          disabled={disabled || isLoading}
          className={`px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all w-full ${
            disabled
              ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
              : "bg-slate-50/30 hover:bg-slate-50/80 focus:bg-white text-slate-900 border-slate-200/80"
          } ${errors[name] ? "border-red-400" : ""}`}
        >
          <option value="">
            {isLoading ? "Loading states..." : "— Select State —"}
          </option>
          {states
            .filter((s) => s.isActive)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.description} ({s.stateCode})
              </option>
            ))}
        </select>
      )}
    />
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────
export default function GenericMasterForm() {
  const { module, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const isEditMode = id !== "new";

  const config = masterModules[module];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: config ? zodResolver(config.schema) : undefined,
    defaultValues: { isActive: true },
  });

  // ── Fetch existing record for edit mode ──
  const { data: initialData, isLoading: isFetching } = useQuery({
    queryKey: ["/api/v1/", module, id],
    queryFn: async () => {
      const res = await api.get(`${config.endpoint}/${id}`);
      const record = res.data?.data || res.data;
      // For cities, backend returns stateCode as populated object — extract _id for the form
      if (module === "cities" && record?.stateCode?._id) {
        return { ...record, stateCode: record.stateCode._id };
      }
      return record;
    },
    enabled: isEditMode && !!config,
  });

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  // ── Create / Update mutation ──
  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        // Remove idField from PATCH body (backend ignores it but keeps it clean)
        const { [config.idField]: _omit, ...patchData } = data;
        return api.patch(`${config.endpoint}/${id}`, patchData);
      }
      return api.post(config.endpoint, data);
    },
    onSuccess: () => {
      toast.success(
        `${config.title} ${isEditMode ? "updated" : "created"} successfully!`,
      );
      queryClient.invalidateQueries(["master", module]);
      navigate(`/${module}`);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || err.message || "An error occurred",
      );
    },
  });

  const onCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to discard them?",
        )
      ) {
        navigate(`/${module}`);
      }
    } else {
      navigate(`/${module}`);
    }
  };

  const onSubmit = (data) => mutation.mutate(data);

  // ── Page header actions ──
  useEffect(() => {
    if (config) {
      dispatch(
        setPageContext({
          title: `${isEditMode ? "Edit" : "Create"} ${config.title}`,
          actions: [
            {
              label: "Cancel",
              variant: "secondary",
              onClick: onCancel,
            },
            {
              label: isEditMode ? "Save Changes" : `Create ${config.title}`,
              variant: "primary",
              onClick: handleSubmit(onSubmit),
            },
          ],
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, dispatch, isEditMode, navigate, handleSubmit]);

  if (!config)
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-xl border border-red-100">
        Module not found: <strong>{module}</strong>
      </div>
    );

  if (isEditMode && isFetching)
    return (
      <div className="flex items-center gap-3 p-8 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading record...
      </div>
    );

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div className="rounded-xl border bg-white shadow-sm flex flex-col">
        {/* Card Header */}
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {config.title} Information
          </h3>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {config.fields.map((field) => {
              const isDisabled =
                (isEditMode && field.disabledOnEdit) ||
                (!isEditMode && field.disabledOnCreate);

              return (
                <div key={field.name} className="space-y-1.5">
                  <label
                    htmlFor={`field-${field.name}`}
                    className="text-xs text-slate-500 font-medium"
                  >
                    {field.label}
                    {field.name !== "isActive" && !field.disabledOnEdit && (
                      <span className="text-red-400 ml-0.5"> *</span>
                    )}
                  </label>

                  {/* ── Checkbox ── */}
                  {field.type === "checkbox" && (
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        id={`field-${field.name}`}
                        type="checkbox"
                        disabled={isDisabled}
                        {...register(field.name)}
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="text-sm text-slate-600">
                        {isEditMode
                          ? "Use the list to toggle status"
                          : "Active by default"}
                      </span>
                    </div>
                  )}

                  {/* ── State dropdown (cities only) ── */}
                  {field.type === "stateSelect" && (
                    <StateSelectField
                      control={control}
                      name={field.name}
                      errors={errors}
                      disabled={isDisabled}
                    />
                  )}

                  {/* ── Regular text input ── */}
                  {field.type !== "checkbox" &&
                    field.type !== "stateSelect" && (
                      <input
                        id={`field-${field.name}`}
                        type={field.type}
                        disabled={isDisabled}
                        {...register(field.name)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}

                  {/* ── Validation error ── */}
                  {errors[field.name] && (
                    <span className="text-[10px] text-red-500 mt-1 font-medium block">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            })}
          </form>
        </div>
      </div>

      {/* ── Bottom submit bar ── */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          id="form-cancel"
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button
          id="form-submit"
          type="button"
          disabled={mutation.isPending}
          onClick={handleSubmit(onSubmit)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-8 py-2"
        >
          {mutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          )}
          {isEditMode ? "Save Changes" : `Create ${config.title}`}
        </button>
      </div>
    </div>
  );
}
