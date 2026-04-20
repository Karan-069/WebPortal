import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/**
 * A reusable Right-Side Drawer component built on Radix Dialog.
 * Provides automatic focus trapping, scroll locking, Escape-to-close,
 * and full WAI-ARIA modal semantics.
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "md", // sm, md, lg, xl
}) {
  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" />

        {/* Drawer Panel */}
        <Dialog.Content
          className={`fixed inset-y-0 right-0 z-[1001] w-screen ${widthClasses[width] || widthClasses.md} transform transition ease-in-out duration-500 sm:duration-700 animate-in slide-in-from-right overflow-hidden shadow-2xl bg-white flex flex-col outline-none`}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="bg-slate-50/50 px-6 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Review activity and details
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <Dialog.Close asChild>
              <button className="w-full h-11 inline-flex items-center justify-center rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                Close Panel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
