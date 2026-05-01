import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import api from "../../services/api";
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react";

import { apiRegistry } from "../../config/apiRegistry";

// Global cache to store resolved labels for IDs across all component instances
const hydrationCache = new Map();

export default function AsyncSelect({
  endpoint,
  value,
  onChange,
  placeholder = "Select option...",
  labelField = "description",
  labelFormat = null,
  valueField = "_id",
  disabled = false,
  queryParams = {},
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isHydrating, setIsHydrating] = useState(false);

  const getLabel = useCallback(
    (opt) => {
      if (!opt) return "";
      if (typeof labelFormat === "function") return labelFormat(opt);

      // If labelFormat is a string, use it as the primary field name
      const effectiveLabelField =
        typeof labelFormat === "string" && labelFormat
          ? labelFormat
          : labelField;

      // Check cache first for ID string (to ensure consistency if we only have ID)
      const id = String(opt[valueField] || opt._id || "");
      if (hydrationCache.has(`${endpoint}:${id}`)) {
        return hydrationCache.get(`${endpoint}:${id}`);
      }

      // 1. Dynamic Code Resolution from API Registry
      const registryEntry = apiRegistry
        ? Object.values(apiRegistry).find(
            (entry) => entry?.endpoint === endpoint,
          )
        : null;
      const dynamicCodeField = registryEntry?.displayIdField;

      // 2. Resolve Primary Label
      let primary =
        opt[effectiveLabelField] ||
        opt["fullName"] ||
        opt["name"] ||
        opt["roleName"] ||
        opt["wfRoleCode"] ||
        opt["description"] ||
        opt["label"] ||
        opt["title"] ||
        "Unknown";

      // 3. Resolve Code (Dynamic > Hardcoded list > ID)
      const code =
        opt[dynamicCodeField] ||
        opt["itemCode"] ||
        opt["code"] ||
        opt["id"] ||
        opt["recordCode"] ||
        opt["transactionId"] ||
        opt["roleCode"] ||
        opt["deptCode"] ||
        opt["uomCode"] ||
        opt["locCode"] ||
        opt["subCode"] ||
        opt["vendorCode"] ||
        opt["accountCode"];

      let finalLabel = primary;
      if (code && String(code) !== String(primary)) {
        // Use "CODE - NAME" for premium enterprise feel
        finalLabel = `${String(code).toUpperCase()} - ${primary}`;
      }

      // Save to cache if we have a valid ID
      if (id && id !== "undefined" && id !== "null") {
        hydrationCache.set(`${endpoint}:${id}`, finalLabel);
      }

      return finalLabel;
    },
    [labelFormat, labelField, endpoint, valueField],
  );

  // Sync Label with Value
  useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      return;
    }

    // 1. If value is already a populated object, use it immediately
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      setSelectedLabel(getLabel(value));
      return;
    }

    // 2. If value is an ID (string), check cache or fetch
    const idToFind = String(value);
    const cacheKey = `${endpoint}:${idToFind}`;

    if (hydrationCache.has(cacheKey)) {
      setSelectedLabel(hydrationCache.get(cacheKey));
      return;
    }

    // Check if we already have it in current options list
    const existing = options.find(
      (o) => String(o[valueField] || o._id) === idToFind,
    );
    if (existing) {
      const label = getLabel(existing);
      setSelectedLabel(label);
      return;
    }

    // If not found and looks like an ID, fetch it
    if (idToFind && idToFind !== "[object Object]" && idToFind.length > 2) {
      const fetchSingle = async () => {
        setIsHydrating(true);
        try {
          const sanitizedId = idToFind.trim();
          const res = await api.get(`${endpoint}/${sanitizedId}`);
          if (res.data?.data) {
            const label = getLabel(res.data.data);
            setSelectedLabel(label);
          }
        } catch (e) {
          console.error("AsyncSelect fetchSingle failed:", e);
          setSelectedLabel(idToFind); // Fallback to showing ID
        } finally {
          setIsHydrating(false);
        }
      };
      fetchSingle();
    }
  }, [value, endpoint, getLabel, valueField, options]);

  const fetchOptions = async (query = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: 100,
        ...queryParams,
      });
      const res = await api.get(`${endpoint}?${params.toString()}`);
      const data = res.data.data;
      const docs = Array.isArray(data) ? data : data.docs || [];
      setOptions(docs);
    } catch (err) {
      console.error("AsyncSelect fetchOptions failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions(search);
    }
  }, [isOpen, search]);

  const handleSelect = (option) => {
    // 1. Extract the ID from the selected option
    let id = option[valueField] || option._id;

    // 2. We emit ONLY the ID to the form state to keep the payload clean
    onChange(id);

    setIsOpen(false);
    setSearch("");
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={(o) => !disabled && setIsOpen(o)}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all flex items-center justify-between ${
            disabled
              ? "cursor-not-allowed opacity-70 bg-slate-100"
              : "cursor-pointer hover:border-slate-400"
          } ${
            error
              ? "border-red-300 ring-1 ring-red-50"
              : isOpen
                ? "border-indigo-500 ring-2 ring-indigo-50"
                : "border-slate-200"
          }`}
        >
          <span
            className={`truncate text-left ${selectedLabel ? "text-slate-900 font-medium" : "text-slate-400"}`}
          >
            {isHydrating ? "Loading..." : selectedLabel || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[200] w-[var(--radix-popover-trigger-width)] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          sideOffset={8}
          align="start"
        >
          <Command shouldFilter={false} className="flex flex-col">
            <div className="flex items-center gap-2 px-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search..."
                className="flex w-full py-3 text-sm bg-transparent outline-none"
              />
              {loading && (
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
              )}
            </div>

            <Command.List className="max-h-[250px] overflow-y-auto p-1">
              {options.length === 0 && !loading && (
                <div className="py-6 text-center text-sm text-slate-400">
                  No results found
                </div>
              )}
              {options.map((opt) => (
                <Command.Item
                  key={String(opt[valueField] || opt._id)}
                  onSelect={() => handleSelect(opt)}
                  className="px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 flex items-center justify-between group"
                >
                  <span className="truncate">{getLabel(opt)}</span>
                  {String(value?.[valueField] || value?._id || value) ===
                    String(opt[valueField] || opt._id) && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
