import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import api from "../../services/api";
import { masterModules } from "../../config/moduleConfig";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Resolve nested accessor strings like 'stateCode.description'
function getNestedValue(obj, accessor) {
  return accessor.split(".").reduce((acc, key) => acc?.[key], obj);
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${value ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-red-400"}`}
      />
      {value ? "Active" : "Inactive"}
    </span>
  );
}

export default function GenericMasterList() {
  const { module: moduleParam } = useParams();
  const module = moduleParam?.toLowerCase();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // ✅ ALL hooks declared at the top before any early returns
  const [searchTerm, setSearchTerm] = useState("");

  const config = masterModules[module];

  useEffect(() => {
    if (config) {
      dispatch(
        setPageContext({
          title: config.title,
          actions: [
            {
              label: "Add New",
              variant: "primary",
              onClick: () => navigate(`/${module}/new`),
            },
          ],
        }),
      );
    }
  }, [module, config, dispatch, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/v1/", module],
    queryFn: async () => {
      if (!config) return [];
      const res = await api.get(config.endpoint);
      return res.data?.data || [];
    },
    enabled: !!config,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`${config.endpoint}/${id}/toggle-status`),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries(["master", module]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // ✅ Early returns AFTER all hooks
  if (!config)
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        Module not found: <strong>{module}</strong>
      </div>
    );

  if (isLoading)
    return (
      <div className="flex items-center gap-3 p-8 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading {config.title}...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        {error.response?.data?.message || error.message}
      </div>
    );

  const rows = Array.isArray(data) ? data : [];

  const filteredRows = rows.filter((row) =>
    config.columns.some((col) => {
      const val = getNestedValue(row, col.accessor);
      return String(val ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }),
  );

  return (
    <div className="rounded-xl border bg-white shadow-sm flex flex-col h-full">
      {/* Card Header (Search & Count) */}
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs">Search</span>
              </div>
              <input
                type="text"
                placeholder={`Search ${config.title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-3 py-1.5 text-xs w-full bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-sky-500/10 focus:border-sky-400 outline-none transition-all"
              />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "record" : "records"}
          </span>
        </div>
      </div>

      {/* Card Content (Table) */}
      <div className="p-6 pt-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              {config.columns.map((col) => (
                <th
                  key={col.accessor}
                  className="pb-2 font-medium text-xs uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              <th className="pb-2 font-medium text-xs uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="py-12 text-center text-slate-400"
                >
                  {searchTerm
                    ? `No records match "${searchTerm}"`
                    : `No records found. Click "Add New" to create one.`}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const rowId = row[config.idField];
                return (
                  <tr
                    key={rowId}
                    className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/${module}/${rowId}`)}
                  >
                    {config.columns.map((col) => (
                      <td key={col.accessor} className="py-3 text-slate-700">
                        {col.type === "boolean" ? (
                          <StatusBadge
                            value={getNestedValue(row, col.accessor)}
                          />
                        ) : (
                          <span className="truncate max-w-xs block">
                            {getNestedValue(row, col.accessor) ?? (
                              <span className="text-slate-300">—</span>
                            )}
                          </span>
                        )}
                      </td>
                    ))}
                    {/* Actions cell */}
                    <td
                      className="py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            id={`actions-${rowId}`}
                            className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[160px] bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-50 animate-in fade-in zoom-in-95"
                            sideOffset={5}
                            align="end"
                          >
                            <DropdownMenu.Item
                              onClick={() => navigate(`/${module}/${rowId}`)}
                              className="flex items-center text-sm px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer outline-none transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-2 text-slate-400" />
                              Edit Record
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                            <DropdownMenu.Item
                              onClick={() => toggleMutation.mutate(rowId)}
                              className={`flex items-center text-sm px-3 py-2 rounded-md cursor-pointer outline-none transition-colors ${
                                row.isActive
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {row.isActive ? (
                                <>
                                  <ToggleLeft className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
