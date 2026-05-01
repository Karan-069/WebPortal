import React, { useEffect, useState } from "react";
import { useFeatures } from "../../hooks/useFeatures";
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
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";

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
  const { isEnabled } = useFeatures();
  const { module: moduleParam } = useParams();
  const module = moduleParam?.toLowerCase();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // ✅ ALL hooks declared at the top before any early returns
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const config = masterModules[module];

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (config) {
      setPage(1); // Reset page on module change
      setLimit(10); // Reset limit on module change
      const actions = [];
      if (
        !config.featureFlags?.creation ||
        isEnabled(config.featureFlags.creation)
      ) {
        actions.push({
          label: "Add New",
          variant: "primary",
          onClick: () => navigate(`/${module}/new`),
        });
      }

      dispatch(
        setPageContext({
          title: config.title,
          actions,
        }),
      );
    }
  }, [module, config, dispatch, navigate]);

  const {
    data: resData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/v1/", module, page, limit, debouncedSearch],
    queryFn: async () => {
      if (!config) return null;
      const res = await api.get(
        `${config.endpoint}?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      return res.data?.data || { docs: [], totalPages: 1, totalDocs: 0 };
    },
    enabled: !!config,
  });

  const pagination = resData?.docs
    ? resData
    : {
        docs: Array.isArray(resData) ? resData : [],
        totalPages: 1,
        totalDocs: Array.isArray(resData) ? resData.length : 0,
      };
  const rows = pagination.docs;

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
        </div>
      </div>

      {/* Card Content (Table) */}
      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((col) => (
              <TableHead key={col.accessor}>{col.header}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={config.columns.length + 1}
                className="py-12 text-center text-slate-400"
              >
                {searchTerm
                  ? `No records match "${searchTerm}"`
                  : `No records found. Click "Add New" to create one.`}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const rowId = row[config.idField];
              return (
                <TableRow
                  key={rowId}
                  isClickable={true}
                  onClick={() => navigate(`/${module}/${rowId}`)}
                >
                  {config.columns.map((col) => (
                    <TableCell key={col.accessor}>
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
                    </TableCell>
                  ))}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-9 h-9 p-0 text-slate-300 hover:text-slate-700 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-100">
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          totalDocs={pagination.totalDocs}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
