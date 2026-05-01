import React, { useState, useEffect } from "react";
import { useFeatures } from "../../hooks/useFeatures";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Shield,
  Layout,
  Check,
  Trash2,
  Plus,
  Info,
  Loader2,
  MoreVertical,
  Lock,
  Settings,
  History,
  Send,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";
import toast from "react-hot-toast";
import { setLoading as setGlobalLoading } from "../../store/features/uiSlice";
import { refreshProfile } from "../../store/features/authSlice";

import Button from "../../components/ui/Button";
import AsyncSelect from "../../components/ui/AsyncSelect";
import FormPage from "../../components/form/FormPage";
import FormHeader from "../../components/form/FormHeader";
import FormSection from "../../components/form/FormSection";
import FormActionBar from "../../components/form/FormActionBar";
import { cn } from "../../lib/utils";
import { Switch } from "../../components/ui/Switch";
import { Accordion } from "../../components/ui/Accordion";
import Drawer from "../../components/ui/Drawer";
import AuditTrail from "../../components/common/AuditTrail";
import WorkflowTrail from "../../components/common/WorkflowTrail";
import CsvDownload from "../../components/ui/CsvDownload";
import { useFormContext } from "../../components/form/FormContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../components/ui/DropdownMenu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

export default function UserRoleManager() {
  const allSections = ["general", "permissions", "system"];
  return (
    <FormPage allSectionIds={allSections} defaultOpenSections={allSections}>
      <UserRoleManagerInner />
    </FormPage>
  );
}

function UserRoleManagerInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEnabled } = useFeatures();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { expandedIds, setExpandedIds } = useFormContext();

  const isEdit = id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);

  // Sync viewing mode with route changes
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWfTrailOpen, setIsWfTrailOpen] = useState(false);
  const [roleData, setRoleData] = useState(null);

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
      roleCode: "",
      description: "",
      isActive: true,
      menus: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "menus",
  });

  const watchMenus = watch("menus");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      dispatch(setGlobalLoading(true));
      try {
        const [menuRes, roleRes] = await Promise.all([
          api.get("/app-menus/my-menus?limit=1000"),
          isEdit ? api.get(`/user-roles/${id}`) : Promise.resolve(null),
        ]);

        if (roleRes) {
          const role = roleRes.data.data;
          setRoleData(role);

          const formData = { ...role };

          // Standardization: Format Audit Fields
          if (role.createdBy && typeof role.createdBy === "object") {
            formData.createdBy = role.createdBy.fullName || role.createdBy._id;
          }
          if (role.updatedBy && typeof role.updatedBy === "object") {
            formData.updatedBy = role.updatedBy.fullName || role.updatedBy._id;
          }
          if (role.createdAt)
            formData.createdAt = format(
              new Date(role.createdAt),
              "dd-MMM-yyyy HH:mm:ss",
            );
          if (role.updatedAt)
            formData.updatedAt = format(
              new Date(role.updatedAt),
              "dd-MMM-yyyy HH:mm:ss",
            );

          const hydratedMenus = (role.menus || []).map((m) => ({
            menuId: m.menuId, // Preserve object for AsyncSelect
            permissions: m.permissions || [],
          }));

          reset({ ...formData, menus: hydratedMenus });
        } else {
          reset({ roleCode: "", description: "", isActive: true, menus: [] });
        }
      } catch (err) {
        toast.error("Failed to load data");
        navigate("/userRole");
      } finally {
        setLoading(false);
        dispatch(setGlobalLoading(false));
      }
    };
    fetchData();
  }, [id, isEdit, reset, navigate, dispatch]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { createdBy, updatedBy, createdAt, updatedAt, ...rest } = values;

      // Flatten menus: convert menuId objects to ID strings for the backend
      const payload = {
        ...rest,
        menus: (rest.menus || []).map((m) => {
          const rawId = m.menuId?._id || m.menuId?.value || m.menuId;
          return {
            ...m,
            menuId: rawId,
          };
        }),
      };

      if (isEdit) {
        await api.patch(`/user-roles/${id}`, payload);
        toast.success("User role updated");
        // Navigate back to view mode naturally
        navigate(`/userRole/${id}`);
      } else {
        const res = await api.post("/user-roles", payload);
        toast.success("User role created");
        navigate(`/userRole/${res.data.data._id}`);
      }

      const currentUserRoleId =
        user?.userRole?._id || user?.activeRole?._id || user?.userRole;
      if (isEdit && id === String(currentUserRoleId)) {
        dispatch(refreshProfile());
        toast.success("System menus refreshed");
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
            Access Policies
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
            Hydrating Permission Matrix
          </p>
        </div>
      </div>
    );
  }

  const displayCode = watch("roleCode");

  return (
    <>
      <FormHeader
        mode={isEdit ? (isViewing ? "VIEW" : "EDIT") : "NEW"}
        title={
          isEdit
            ? displayCode
              ? `User Role: ${displayCode}`
              : "Update User Role"
            : "Create New User Role"
        }
        subtitle={
          isEdit
            ? `Record ID: ${displayCode || id}`
            : "Define a new access control profile"
        }
        breadcrumbs={["User Roles", isEdit ? "Update" : "New"]}
        onBack={() => navigate("/userRole")}
        backTo="/userRole"
      >
        <div className="flex items-center gap-3">
          {isEdit && isViewing && (
            <Button
              variant="primary"
              onClick={() => navigate(`${location.pathname}/edit`)}
              leftIcon={<Edit2 size={16} />}
              className="px-5"
            >
              Edit Role
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
                {isEnabled("WF_USERROLE") && (
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
                  filename={`userRole_${displayCode}.csv`}
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
          <FormSection id="general" title="Role Information" icon="Shield">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Role Code
                </label>
                <input
                  {...register("roleCode", {
                    required: true,
                    onChange: (e) => {
                      const upper = e.target.value.toUpperCase();
                      e.target.value = upper;
                      setValue("roleCode", upper);
                    },
                  })}
                  placeholder="e.g. MANAGER"
                  disabled={isEdit}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-bold disabled:opacity-70 uppercase tracking-widest"
                />
              </div>
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
                    {watch("isActive") ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  disabled={isReadOnly}
                  placeholder="Describe the responsibilities..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm disabled:opacity-70"
                />
              </div>
            </div>
          </FormSection>

          <FormSection id="permissions" title="Menu Permissions" icon="Lock">
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Application Menu</TableHead>
                      <TableHead>Permissions</TableHead>
                      {!isReadOnly && (
                        <TableHead className="w-16 text-center">
                          Action
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="group">
                        <TableCell>
                          <Controller
                            name={`menus.${index}.menuId`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                              <AsyncSelect
                                endpoint="/app-menus/my-menus"
                                value={value}
                                onChange={onChange}
                                disabled={isReadOnly}
                                placeholder="Select Menu..."
                                labelFormat={(m) =>
                                  m ? m.description : "Unknown"
                                }
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              {
                                value: "all",
                                label: "All",
                                color: "bg-slate-900",
                              },
                              {
                                value: "view",
                                label: "View",
                                color: "bg-blue-500",
                              },
                              {
                                value: "add",
                                label: "Add",
                                color: "bg-green-500",
                              },
                              {
                                value: "edit",
                                label: "Edit",
                                color: "bg-amber-500",
                              },
                              {
                                value: "delete",
                                label: "Delete",
                                color: "bg-red-500",
                              },
                            ].map((perm) => {
                              const currentPerms =
                                watchMenus[index]?.permissions || [];
                              const isActive = currentPerms.includes(
                                perm.value,
                              );
                              return (
                                <button
                                  key={perm.value}
                                  type="button"
                                  onClick={() => {
                                    if (isReadOnly) return;
                                    const next = isActive
                                      ? currentPerms.filter(
                                          (p) => p !== perm.value,
                                        )
                                      : [...currentPerms, perm.value];
                                    const final =
                                      perm.value === "all" && !isActive
                                        ? ["all"]
                                        : perm.value !== "all"
                                          ? next.filter((p) => p !== "all")
                                          : next;

                                    const newMenus = [...watchMenus];
                                    newMenus[index].permissions = final;
                                    replace(newMenus);
                                  }}
                                  disabled={isReadOnly}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all border shadow-sm",
                                    isActive
                                      ? `${perm.color} text-white border-transparent shadow-md`
                                      : "bg-white text-slate-400 border-slate-200",
                                  )}
                                >
                                  {perm.label}
                                </button>
                              );
                            })}
                          </div>
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => remove(index)}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!isReadOnly && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={() =>
                      append({ menuId: "", permissions: ["view"] })
                    }
                    leftIcon={<Plus size={16} />}
                    className="bg-white rounded-full border-indigo-100 text-indigo-600 shadow-sm"
                  >
                    Add Menu Access
                  </Button>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection id="system" title="System Information" icon="Settings">
            <div className="grid gap-6 grid-cols-2">
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
          </FormSection>
        </Accordion>

        <FormActionBar
          isDirty={isDirty}
          isSubmitting={submitting}
          onCancel={() => navigate("/userRole")}
          onSubmit={isReadOnly ? null : handleSubmit(onSubmit)}
          submitLabel={isEdit ? "Update Role" : "Create Role"}
          cancelLabel="Back to List"
        />
      </form>

      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Audit History"
        width="md"
      >
        <AuditTrail recordId={roleData?._id} collectionName="userrole" />
      </Drawer>

      <Drawer
        isOpen={isWfTrailOpen}
        onClose={() => setIsWfTrailOpen(false)}
        title="Workflow Approval Trail"
        width="md"
      >
        <WorkflowTrail
          transactionId={roleData?._id}
          transactionModel="UserRole"
        />
      </Drawer>
    </>
  );
}
