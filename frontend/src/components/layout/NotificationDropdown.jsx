import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
  CheckCheck,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications?limit=10");
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Check className="w-3 h-3 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-3 h-3 text-red-500" />;
      case "clarification_requested":
        return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default:
        return <Info className="w-3 h-3 text-sky-500" />;
    }
  };

  const onOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button className="relative p-2.5 text-slate-400 hover:text-slate-900 group transition-all outline-none rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100">
          <Bell
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${data.unreadCount > 0 ? "animate-swing origin-top" : ""}`}
          />
          {data.unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {data.unreadCount > 9 ? "9+" : data.unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[300] animate-in fade-in zoom-in-95 duration-200"
          sideOffset={12}
          align="end"
        >
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                Notifications
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                Recent activity updates
              </span>
            </div>
            {data.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest transition-all"
              >
                <CheckCheck className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="p-10 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-300" />
                <span className="text-xs font-medium italic">
                  Refreshing updates...
                </span>
              </div>
            ) : data.notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-300">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Bell className="w-5 h-5 opacity-30" />
                </div>
                <p className="text-xs font-medium italic">
                  No recent notifications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                    className={`px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group flex gap-4 ${
                      !notif.isRead
                        ? "bg-indigo-50/10 relative border-l-2 border-l-indigo-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${!notif.isRead ? "bg-white border-indigo-100" : "bg-slate-50 border-slate-100"}`}
                    >
                      {getStatusIcon(notif.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-normal mb-1 ${!notif.isRead ? "text-slate-900 font-bold" : "text-slate-500 font-medium"}`}
                      >
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(notif.createdAt))} ago
                        </span>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
            <button className="w-full text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              View Activity Center
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
