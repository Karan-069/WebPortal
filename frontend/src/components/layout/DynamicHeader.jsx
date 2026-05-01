import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  Key,
  Save,
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "../ui/Button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { toggleSidebar } from "../../store/features/uiSlice";
import { logout, switchRole } from "../../store/features/authSlice";
import { apiRegistry } from "../../config/apiRegistry";
import NotificationDropdown from "./NotificationDropdown";
import toast from "react-hot-toast";

export default function DynamicHeader() {
  const { pageContext } = useSelector((state) => state.ui);
  const { user, status } = useSelector((state) => state.auth);
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isEdit = !!id && id !== "new";
  const isEditRoute = location.pathname.endsWith("/edit");
  const [isViewing, setIsViewing] = useState(isEdit && !isEditRoute);
  const [isSwitching, setIsSwitching] = useState(false);

  // Sync viewing mode with route
  useEffect(() => {
    setIsViewing(isEdit && !isEditRoute);
  }, [isEdit, isEditRoute]);

  const pathnames = location.pathname.split("/").filter((x) => x);

  const segmentMap = {
    new: "Add New",
    edit: "Modify",
    dashboard: "Dashboard",
    profile: "My Profile",
    "change-password": "Security",
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSwitchRole = async (roleCode) => {
    if (roleCode === user?.activeRole?.roleCode) return;

    setIsSwitching(true);
    try {
      await dispatch(switchRole(roleCode)).unwrap();
      toast.success("Role switched successfully");
      // Force refreshing the menu by redirecting to dashboard
      navigate("/dashboard");
      // Small delay to let the user see the success before the reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error || "Failed to switch role");
      setIsSwitching(false);
    }
  };

  const getActionIcon = (iconName) => {
    if (!iconName) return null;
    const props = { size: 14 };
    switch (iconName.toLowerCase()) {
      case "save":
        return <Save {...props} />;
      case "send":
        return <Send size={14} />; // Using Send from lucide if imported
      case "check-circle":
        return <CheckCircle2 {...props} />;
      case "x-circle":
        return <XCircle {...props} />;
      case "rotate-ccw":
        return <RotateCcw {...props} />;
      case "edit":
        return <Edit2 {...props} />;
      default:
        return null;
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200 sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex flex-col justify-center">
          <div className="flex items-center text-[11px] font-medium text-slate-500 space-x-1 mb-0.5">
            <Link
              to="/dashboard"
              className="hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Home
            </Link>
            {(() => {
              let lastConfig = null;
              return pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

                // Try to find config for this segment
                let currentConfig = apiRegistry ? apiRegistry[value] : null;
                if (!currentConfig && apiRegistry) {
                  const registryKey = Object.keys(apiRegistry).find(
                    (key) =>
                      key.toLowerCase() === value.toLowerCase() ||
                      apiRegistry[key]?.endpoint
                        ?.replace(/^\//, "")
                        .replace(/-/g, "")
                        .toLowerCase() ===
                        value.replace(/-/g, "").toLowerCase(),
                  );
                  if (registryKey) currentConfig = apiRegistry[registryKey];
                }

                if (currentConfig) lastConfig = currentConfig;

                // Determine Label
                const isAction = ["new", "edit", "view"].includes(
                  value.toLowerCase(),
                );
                let label = segmentMap[value.toLowerCase()] || value;

                if (currentConfig && !isAction) {
                  label = currentConfig.title || value;
                } else if (!isAction && lastConfig) {
                  label = lastConfig.singularTitle || "Details";
                }

                return (
                  <React.Fragment key={index}>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    {isLast ? (
                      <span className="text-slate-800 font-bold uppercase tracking-[0.1em]">
                        {label}
                      </span>
                    ) : (
                      <Link
                        to={routeTo}
                        className="hover:text-indigo-600 transition-colors uppercase tracking-[0.1em]"
                      >
                        {label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none hidden sm:block">
            {pageContext.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {pageContext.actions &&
          pageContext.actions.map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
              variant={action.variant || "primary"}
              className={action.className}
              leftIcon={getActionIcon(action.icon)}
              size="sm"
            >
              {action.label}
            </Button>
          ))}

        <div className="border-l border-slate-200 pl-4 ml-2 flex items-center space-x-3">
          <NotificationDropdown />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 group focus:outline-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === "loading" ? "bg-amber-50 border-amber-100 animate-pulse" : "bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100"}`}
                >
                  <User
                    className={`w-4 h-4 ${status === "loading" ? "text-amber-600" : "text-indigo-600"}`}
                  />
                </div>
                <div className="hidden md:flex flex-col items-start pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user?.fullName || "Guest"}
                    </span>
                    {user?.isSuperAdmin && (
                      <span className="text-[7px] font-black bg-indigo-600 text-white px-1 py-0.5 rounded uppercase tracking-widest leading-none">
                        Super
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                    {user?.activeRole?.description || "Role"}
                  </span>
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 animate-in fade-in zoom-in-95 z-50 mt-2 mr-4"
                sideOffset={5}
              >
                <div className="px-2 py-2 mb-1 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">
                    {user?.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">
                    {user?.activeRole?.description}
                  </div>
                </div>

                <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                  Account
                </DropdownMenu.Label>
                <DropdownMenu.Item
                  onClick={() => navigate("/profile")}
                  className="flex items-center text-sm px-2.5 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer outline-none transition-colors"
                >
                  <User className="w-4 h-4 mr-2.5 opacity-60" /> Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => navigate("/change-password")}
                  className="flex items-center text-sm px-2.5 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer outline-none transition-colors"
                >
                  <Key size={16} className="mr-2.5 opacity-60" /> Security
                </DropdownMenu.Item>

                {/* Switch Role — driven by roleAssignments (valid pairs only) */}
                {user?.roleAssignments?.length > 1 && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                    <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] [word-spacing:0.1em]">
                      Switch Role
                    </DropdownMenu.Label>
                    <div className="max-h-32 overflow-y-auto">
                      {user.roleAssignments.map((assignment) => {
                        const role = assignment.userRole;
                        const wfRole = assignment.workflowRole;
                        if (!role) return null;
                        const isActive =
                          role.roleCode === user.activeRole?.roleCode;
                        return (
                          <DropdownMenu.Item
                            key={role._id}
                            disabled={isActive || status === "loading"}
                            onClick={() => handleSwitchRole(role.roleCode)}
                            className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-lg cursor-pointer outline-none transition-colors ${
                              isActive
                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div>
                              <div>{role.description}</div>
                              {wfRole && (
                                <div className="text-[10px] text-slate-400">
                                  {wfRole.roleName}
                                </div>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            )}
                          </DropdownMenu.Item>
                        );
                      })}
                    </div>
                  </>
                )}

                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex items-center text-sm px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer outline-none transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2.5" /> Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Role Switching Overlay */}
      {isSwitching && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Switching Role
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Please wait while we rebuild your workspace...
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
