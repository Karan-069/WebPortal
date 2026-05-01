import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import api from "../../services/api";
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react";

export default function MultiAsyncSelect({
  endpoint,
  value = [], // Array of IDs
  onChange,
  placeholder = "Select options...",
  labelField = "description",
  labelFormat = null,
  valueField = "_id",
  disabled = false,
  queryParams = {},
  error = null,
}) {
  const safeValue = Array.isArray(value) ? value : [];
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]); // Array of full objects
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  const getLabel = useCallback(
    (opt) => {
      if (typeof labelFormat === "function") return labelFormat(opt);
      let primaryLabel =
        opt[labelField] ||
        opt["fullName"] ||
        opt["name"] ||
        opt["roleName"] ||
        opt["wfRoleCode"] ||
        opt["description"] ||
        "Unknown";
      return primaryLabel;
    },
    [labelFormat, labelField],
  );

  const fetchOptions = async (query = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: queryParams.limit || 100,
        ...queryParams,
      });
      const res = await api.get(`${endpoint}?${params.toString()}`);
      const data = res.data.data;
      const docs = Array.isArray(data) ? data : data.docs || [];
      setOptions(docs);
    } catch (err) {
      console.error("MultiAsyncSelect fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync selected objects when value (IDs) change
  useEffect(() => {
    const syncSelected = async () => {
      if (safeValue.length > 0) {
        const missingIds = safeValue.filter(
          (id) => !selectedOptions.some((opt) => opt[valueField] === id),
        );
        if (missingIds.length > 0) {
          // Fetch missing objects if needed, but for simplicity we'll just use what we have or fetch on demand
          // In a real app, you might have a getByIDs endpoint
          try {
            const newSelected = [...selectedOptions];
            for (const id of missingIds) {
              if (id && id !== "[object Object]") {
                const res = await api.get(`${endpoint}/${id}`);
                if (res.data.data) newSelected.push(res.data.data);
              }
            }
            setSelectedOptions(
              newSelected.filter((opt) => safeValue.includes(opt[valueField])),
            );
          } catch (e) {}
        } else {
          setSelectedOptions(
            selectedOptions.filter((opt) =>
              safeValue.includes(opt[valueField]),
            ),
          );
        }
      } else {
        setSelectedOptions([]);
      }
    };
    syncSelected();
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      fetchOptions(search);
      setHighlightedIndex(-1);
    }
  }, [isOpen, search]);

  const handleSelect = (option) => {
    const id = option[valueField];
    const isSelected = safeValue.includes(id);
    let newValue;
    if (isSelected) {
      newValue = safeValue.filter((v) => v !== id);
    } else {
      newValue = [...safeValue, id];
    }
    onChange(newValue);
  };

  const removeOption = (e, id) => {
    e.stopPropagation();
    onChange(safeValue.filter((v) => v !== id));
  };

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!disabled) setIsOpen(open);
      }}
    >
      <Popover.Trigger asChild>
        <div
          className={`w-full min-h-[44px] p-1.5 text-sm bg-slate-50 border rounded-xl transition-all flex items-center justify-between flex-wrap gap-1 ${
            disabled
              ? "cursor-not-allowed opacity-70 bg-slate-100"
              : "cursor-pointer"
          } ${
            error
              ? "border-red-300 ring-1 ring-red-50"
              : isOpen
                ? "border-slate-900 border-2"
                : "border-slate-200"
          }`}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt[valueField]}
                  className="inline-flex items-center gap-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                >
                  {getLabel(opt)}
                  {!disabled && (
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={(e) => removeOption(e, opt[valueField])}
                    />
                  )}
                </span>
              ))
            ) : (
              <span className="text-slate-400 px-2">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 mr-2 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[200] w-[var(--radix-popover-trigger-width)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
        >
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none text-sm w-full outline-none placeholder:text-slate-400 py-1"
            />
          </div>

          <div className="max-h-[220px] overflow-y-auto" role="listbox">
            {loading && options.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                No results found.
              </div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = safeValue.includes(opt[valueField]);
                return (
                  <div
                    key={opt[valueField]}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {getLabel(opt)}
                    {isSelected && <Check size={14} />}
                  </div>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
