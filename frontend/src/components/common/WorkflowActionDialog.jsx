import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  UserPlus,
  HelpCircle,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/AlertDialog";
import { cn } from "../../lib/utils";
import AsyncSelect from "../ui/AsyncSelect";

export default function WorkflowActionDialog({
  isOpen,
  onClose,
  action,
  comments,
  setComments,
  onConfirm,
  isLoading,
  delegatedToUserId,
  setDelegatedToUserId,
}) {
  const getActionIcon = () => {
    switch (action) {
      case "approve":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "reject":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "delegate":
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case "clarify":
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
      case "amend":
        return <RefreshCcw className="w-5 h-5 text-indigo-500" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-500" />;
    }
  };

  const getActionColor = () => {
    switch (action) {
      case "approve":
        return "bg-emerald-600 hover:bg-emerald-700";
      case "reject":
        return "bg-red-600 hover:bg-red-700";
      case "delegate":
        return "bg-indigo-600 hover:bg-indigo-700";
      case "clarify":
        return "bg-amber-600 hover:bg-amber-700";
      case "amend":
        return "bg-indigo-600 hover:bg-indigo-700";
      default:
        return "bg-slate-600 hover:bg-slate-700";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 capitalize text-xl">
            {getActionIcon()}
            {action === "approve"
              ? "Approve Entry"
              : action === "reject"
                ? "Reject Entry"
                : action === "delegate"
                  ? "Delegate Approval"
                  : action === "clarify"
                    ? "Request Clarification"
                    : action === "amend"
                      ? "Amend Entry"
                      : `${action?.replace("_", " ")} Transaction`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            {action === "delegate"
              ? "Select a user to delegate this transaction to for approval."
              : `Please provide any comments or feedback for this ${action?.replace("_", " ")} action.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-6 space-y-5">
          {action === "delegate" && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] block">
                Delegate To
              </label>
              <AsyncSelect
                endpoint="/users"
                placeholder="Search user by name or email..."
                labelField="fullName"
                value={delegatedToUserId}
                onChange={(val) => setDelegatedToUserId(val)}
              />
              <p className="text-[10px] text-slate-400 italic">
                This user will be able to Approve/Reject this transaction on
                your behalf.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em] block">
              Comments{" "}
              {action === "reject" || action === "clarify" ? (
                <span className="text-red-500">*</span>
              ) : (
                "(Optional)"
              )}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={`Enter your ${action}al comments here...`}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all min-h-[120px] text-sm"
              autoFocus
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel
            onClick={() => {
              onClose(false);
              setComments("");
            }}
            className="rounded-xl border-slate-200"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={
              isLoading ||
              (action === "delegate" && !delegatedToUserId) ||
              ((action === "reject" || action === "clarify") && !comments)
            }
            className={cn("rounded-xl px-6", getActionColor())}
          >
            {isLoading
              ? "Processing..."
              : action === "approve"
                ? "Confirm Approval"
                : action === "reject"
                  ? "Confirm Rejection"
                  : action === "delegate"
                    ? "Send Delegation"
                    : action === "clarify"
                      ? "Request Info"
                      : action === "amend"
                        ? "Confirm Amendment"
                        : `Confirm ${action?.replace("_", " ")}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
