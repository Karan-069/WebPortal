import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import api from "../../services/api";
import { ChevronDown, Search, Loader2, X } from "lucide-react";

/**
 * Async searchable select built on Radix Popover.
 * Provides proper positioning, Escape-to-close, click-outside dismiss,
 * and keyboard navigation for the option list.
 */
export default function AsyncSelect({
  endpoint,
  value,
  onChange,
  placeholder = "Select option...",
  labelField = "description",
  labelFormat = null,
  valueField = "_id",
  disabled = false,
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  const getLabel = useCallback(
    (opt) => {
      if (typeof labelFormat === "function") return labelFormat(opt);
      if (typeof labelFormat === "string" && opt[labelFormat]) {
        return `${opt[labelFormat]} - ${opt[labelField]}`;
      }

      // Try to find the primary descriptive label
      let primaryLabel = opt[labelField];
      if (!primaryLabel) {
        primaryLabel =
          opt["fullName"] ||
          opt["name"] ||
          opt["companyName"] ||
          opt["description"] ||
          "Unknown";
      }

      // Attempt to automatically prepend the system Code/ID universally
      const knownCodeFields = ["code", "id", "no"];
      const skipKeys = [
        "_id",
        "createdBy",
        "updatedBy",
        "isActive",
        "password",
        "transactionid",
        "clientid",
      ];

      const candidateKeys = Object.keys(opt).filter(
        (key) =>
          !skipKeys.includes(key.toLowerCase()) &&
          knownCodeFields.some((suffix) =>
            key.toLowerCase().endsWith(suffix),
          ) &&
          opt[key] !== primaryLabel,
      );

      let codeKey = null;
      if (candidateKeys.length > 0) {
        codeKey =
          candidateKeys.find(
            (k) =>
              k.toLowerCase().endsWith("code") &&
              !k.toLowerCase().includes("gst"),
          ) || candidateKeys[0];
      }

      if (codeKey && opt[codeKey]) {
        return `${opt[codeKey]} - ${primaryLabel}`;
      }

      return primaryLabel;
    },
    [labelFormat, labelField],
  );

  // Fetch options
  const fetchOptions = async (query = "") => {
    setLoading(true);
    try {
      const res = await api.get(`${endpoint}?search=${query}&limit=50`);
      const data = res.data.data;
      const docs = Array.isArray(data) ? data : data.docs || [];
      setOptions(docs);

      // If we have a value but no label, find it
      if (value && !selectedLabel) {
        const idValue =
          typeof value === "object" && value !== null
            ? value[valueField] || value._id
            : value;

        if (!idValue || idValue === "[object Object]") {
          setLoading(false);
          return;
        }

        const selected = docs.find((opt) => opt[valueField] === idValue);
        if (selected) setSelectedLabel(getLabel(selected));
        else {
          try {
            const singleRes = await api.get(`${endpoint}/${idValue}`);
            setSelectedLabel(getLabel(singleRes.data.data));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("AsyncSelect fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions(search);
      setHighlightedIndex(-1);
    }
  }, [isOpen, search]);

  useEffect(() => {
    if (value && !selectedLabel) {
      fetchOptions();
    }
  }, [value]);

  const handleSelect = (option) => {
    setSelectedLabel(getLabel(option));
    onChange(option[valueField]);
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedLabel("");
    onChange(null);
    setSearch("");
  };

  // Keyboard navigation for the option list
  const handleKeyDown = (e) => {
    if (!options.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < options.length - 1 ? prev + 1 : 0;
          scrollToIndex(next);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : options.length - 1;
          scrollToIndex(next);
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const scrollToIndex = (index) => {
    if (listRef.current) {
      const items = listRef.current.children;
      if (items[index]) {
        items[index].scrollIntoView({ block: "nearest" });
      }
    }
  };

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!disabled) setIsOpen(open);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-md transition-all flex items-center justify-between ${
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
          <span
            className={`truncate text-left ${selectedLabel ? "text-slate-900 font-medium" : "text-slate-400"}`}
          >
            {selectedLabel || placeholder}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selectedLabel && !disabled && (
              <span
                role="button"
                className="w-4 h-4 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 inline-flex items-center justify-center"
                onClick={clearSelection}
                onPointerDown={(e) => e.preventDefault()}
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[200] w-[var(--radix-popover-trigger-width)] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
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

          {/* Options List */}
          <div
            className="max-h-[220px] overflow-y-auto"
            ref={listRef}
            role="listbox"
          >
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
              options.map((opt, idx) => (
                <div
                  key={opt[valueField]}
                  role="option"
                  aria-selected={value === opt[valueField]}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    value === opt[valueField]
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : highlightedIndex === idx
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {getLabel(opt)}
                  {value === opt[valueField] && (
                    <div className="w-1.5 h-1.5 bg-sky-600 rounded-full flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
