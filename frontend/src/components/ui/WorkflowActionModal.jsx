import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Send, UserPlus, MessageSquare, AlertCircle } from "lucide-react";
import AsyncSelect from "./AsyncSelect";

/**
 * Workflow Action Modal built on Radix Dialog.
 * Provides focus trapping, scroll locking, Escape-to-close,
 * and full WAI-ARIA modal semantics.
 */
export default function WorkflowActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  isLoading = false,
}) {
  const [comments, setComments] = useState("");
  const [delegatedToUserId, setDelegatedToUserId] = useState(null);

  const handleConfirm = () => {
    // Basic validation
    if (
      ["reject", "clarification_requested"].includes(action) &&
      !comments.trim()
    ) {
      return alert("Comments are required for this action.");
    }
    if (action === "delegate" && !delegatedToUserId) {
      return alert("Please select a user to delegate to.");
    }

    onConfirm({ comments, delegatedToUserId });
    setComments("");
    setDelegatedToUserId(null);
  };

  const getActionTitle = () => {
    switch (action) {
      case "approve":
        return "Confirm Approval";
      case "reject":
        return "Confirm Rejection";
      case "delegate":
        return "Delegate Transaction";
      case "clarify":
        return "Request Clarification";
      case "clarification_provided":
        return "Provide Clarification";
      default:
        return "Confirm Action";
    }
  };

  const getActionColor = () => {
    switch (action) {
      case "approve":
        return "bg-emerald-600 hover:bg-emerald-700";
      case "reject":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-slate-900 hover:bg-slate-800";
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />

        <Dialog.Content className="fixed inset-0 z-[301] flex items-center justify-center p-4 outline-none">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Dialog.Title className="font-bold text-slate-900">
                {getActionTitle()}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description className="sr-only">
              Confirm the workflow action with optional comments.
            </Dialog.Description>

            <div className="p-6 space-y-4">
              {action === "delegate" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Approver
                  </label>
                  <AsyncSelect
                    endpoint="/users/all"
                    placeholder="Choose a user to delegate to..."
                    labelField="fullName"
                    onChange={setDelegatedToUserId}
                    value={delegatedToUserId}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Comments
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    ["reject", "clarify"].includes(action)
                      ? "Why is this being returned? (Required)"
                      : "Optional notes..."
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all resize-none"
                />
              </div>

              {["reject", "clarify"].includes(action) && !comments.trim() && (
                <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  Comments required for this action
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                disabled={isLoading}
                onClick={handleConfirm}
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 ${getActionColor()}`}
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
