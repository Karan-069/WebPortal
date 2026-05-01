import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Send,
  UserPlus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Reply,
} from "lucide-react";
import AsyncSelect from "./AsyncSelect";
import Button from "./Button";
import { cn } from "../../lib/utils";

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
  const [error, setError] = useState("");

  // Clear state on open/close
  useEffect(() => {
    if (isOpen) {
      setError("");
      setComments("");
      setDelegatedToUserId(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setError("");

    if (
      ["reject", "clarification_requested", "clarify"].includes(action) &&
      !comments.trim()
    ) {
      return setError("Please provide a reason for this action.");
    }
    if (action === "delegate" && !delegatedToUserId) {
      return setError("Please select a user to delegate to.");
    }

    onConfirm({ comments, delegatedToUserId });
  };

  const getActionConfig = () => {
    switch (action) {
      case "approve":
        return {
          title: "Confirm Approval",
          icon: CheckCircle2,
          color: "text-green-500",
          bg: "bg-green-50",
          variant: "success",
          btnLabel: "Approve Now",
        };
      case "reject":
        return {
          title: "Confirm Rejection",
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-50",
          variant: "danger",
          btnLabel: "Reject Transaction",
        };
      case "delegate":
        return {
          title: "Delegate Transaction",
          icon: UserPlus,
          color: "text-indigo-500",
          bg: "bg-indigo-50",
          variant: "primary",
          btnLabel: "Delegate Now",
        };
      case "clarify":
        return {
          title: "Request Clarification",
          icon: Reply,
          color: "text-amber-500",
          bg: "bg-amber-50",
          variant: "primary",
          btnLabel: "Send Request",
        };
      case "clarification_provided":
        return {
          title: "Provide Clarification",
          icon: MessageSquare,
          color: "text-blue-500",
          bg: "bg-blue-50",
          variant: "primary",
          btnLabel: "Submit Answer",
        };
      default:
        return {
          title: "Confirm Action",
          icon: Send,
          color: "text-slate-500",
          bg: "bg-slate-50",
          variant: "primary",
          btnLabel: "Confirm",
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />

        <Dialog.Content className="fixed inset-0 z-[301] flex items-center justify-center p-4 outline-none">
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            {/* Header with Icon */}
            <div className="px-8 py-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-1 shadow-lg border-2 border-white",
                  config.bg,
                  config.color,
                )}
              >
                <Icon size={32} strokeWidth={2.5} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {config.title}
                </Dialog.Title>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] mt-1.5">
                  Workflow Security Action
                </p>
              </div>

              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  className="absolute top-4 right-4 w-10 h-10 p-0 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                >
                  <X size={20} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="px-8 pb-8 space-y-6">
              {action === "delegate" && (
                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em] ml-1">
                    Assign To Approver
                  </label>
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-50 group-focus-within:border-indigo-100 transition-colors">
                    <AsyncSelect
                      endpoint="/users/all"
                      placeholder="Search for a teammate..."
                      labelFormat={(u) => u.fullName}
                      onChange={setDelegatedToUserId}
                      value={delegatedToUserId}
                      className="border-none bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                    Transaction Comments
                  </label>
                  {["reject", "clarify"].includes(action) && (
                    <span className="text-[8px] font-black text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
                      Mandatory
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  placeholder={
                    ["reject", "clarify"].includes(action)
                      ? "Provide specific details for rejection..."
                      : "Add any internal notes (optional)..."
                  }
                  className="w-full px-5 py-4 text-sm font-medium bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-400/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all resize-none shadow-inner placeholder:text-slate-300"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.15em] [word-spacing:0.1em] text-[11px]"
                    disabled={isLoading}
                  >
                    Go Back
                  </Button>
                </Dialog.Close>
                <Button
                  variant={config.variant}
                  className="flex-[1.5] h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-xl shadow-slate-200"
                  isLoading={isLoading}
                  onClick={handleConfirm}
                  rightIcon={<Send size={16} />}
                >
                  {config.btnLabel}
                </Button>
              </div>
            </div>

            {/* Subtle bottom accent */}
            <div className={cn("h-2 w-full", config.bg)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
