import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPageContext } from "../../store/features/uiSlice";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Building2,
  Key,
  BadgeCheck,
  LayoutGrid,
  History,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      setPageContext({
        title: "My Profile",
        actions: [],
      }),
    );
  }, [dispatch]);

  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();

  return (
    <div className="w-full h-full animate-in fade-in duration-700 space-y-8">
      {/* Profile Header Hero */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 border-4 border-slate-800 flex items-center justify-center text-4xl font-black shadow-2xl shrink-0">
            {user?.fullName?.[0] || "U"}
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">
                {user?.fullName}
              </h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full">
                  {user?.activeRole?.description || "Standard User"}
                </span>
                {user?.isSuperAdmin && (
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full">
                    Platform Super Admin
                  </span>
                )}
              </div>
            </div>
            <p className="text-indigo-200/60 font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {user?.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Platform Access
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  Enterprise Core
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-white">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: General Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <User size={14} className="text-indigo-500" /> Account Details
            </h3>

            <div className="space-y-6">
              <DetailRow
                icon={<ShieldCheck size={18} />}
                label="User ID"
                value={
                  <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {user?._id?.substring(0, 12)}...
                  </code>
                }
              />
              <DetailRow
                icon={<Calendar size={18} />}
                label="Member Since"
                value={format(joinDate, "dd MMMM yyyy")}
              />
              <DetailRow
                icon={<Building2 size={18} />}
                label="Tenant ID"
                value={user?.tenantId || "Default"}
              />
              <DetailRow
                icon={<LayoutGrid size={18} />}
                label="Default View"
                value="Dashboard"
              />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <Button
                variant="soft"
                fullWidth
                onClick={() => navigate("/change-password")}
                leftIcon={<Key size={16} />}
                className="justify-between"
              >
                Change Security Key <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Permissions & Roles */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <BadgeCheck size={14} className="text-indigo-500" /> Permission
                Matrix
              </h3>
              <span className="text-[10px] text-slate-400 italic">
                Level: {user?.activeRole?.roleCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.userRole?.menus?.slice(0, 8).map((menu, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <LayoutGrid size={14} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {menu.menuId?.description}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {menu.permissions?.map((p, pidx) => (
                      <span
                        key={pidx}
                        className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400"
                      >
                        {p[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {user?.userRole?.menus?.length > 8 && (
                <div className="md:col-span-2 text-center py-2">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    + {user?.userRole?.menus?.length - 8} more modules
                    authorized
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log Placeholder */}
          <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed p-8 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-300">
              <History size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-500">
              Security Audit Logs
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Recent login activity and security events will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-slate-300 mt-0.5">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
          {label}
        </div>
        <div className="text-[13px] font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );
}
