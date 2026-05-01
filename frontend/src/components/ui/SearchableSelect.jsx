import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        if (disabled) return;
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-slate-200/80 rounded-md focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${
            disabled
              ? "bg-slate-100 cursor-not-allowed opacity-70"
              : "bg-slate-50/30 hover:bg-slate-50/80 focus:bg-white"
          } text-slate-900`}
        >
          <span className="truncate">
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] max-w-sm min-w-[200px] overflow-hidden bg-white border border-slate-200 rounded-md shadow-md animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
        >
          <Command
            value={value ? String(value) : ""}
            onValueChange={() => {}}
            shouldFilter={false} // 👈 disable cmdk's built-in filtering
            className="flex flex-col w-full h-full overflow-hidden bg-white text-slate-900"
          >
            <div
              className="flex items-center px-3 border-b border-slate-100"
              cmdk-input-wrapper=""
            >
              <Search className="flex-shrink-0 w-4 h-4 mr-2 text-slate-400" />
              <Command.Input
                placeholder={searchPlaceholder}
                value={search} // 👈 controlled input
                onValueChange={setSearch} // 👈 cmdk's change handler
                className="flex w-full py-3 text-sm bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400"
              />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
              <Command.Empty className="py-6 text-sm text-center text-slate-500">
                No results found.
              </Command.Empty>

              <Command.Group className="overflow-hidden text-slate-900">
                {filteredOptions.map(
                  (
                    option, // 👈 use filteredOptions
                  ) => (
                    <Command.Item
                      key={String(option.value)}
                      value={String(option.value)}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className="relative flex items-center w-full px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900 group"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 text-sky-600 transition-opacity ${
                          value === option.value
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-20"
                        }`}
                      />
                      {option.label}
                    </Command.Item>
                  ),
                )}
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
