import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSidebarOpen,
  pinSidebar,
  toggleSidebar,
} from "../../store/features/uiSlice";
import {
  FileText,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight as ChevronR,
  User,
  ShieldCheck,
  Box,
  MapPin,
  Globe,
  CreditCard,
  Layers,
  Receipt,
  Calculator,
  Building2,
  UserCog,
  LayoutDashboard,
  Gauge,
  FileSpreadsheet,
  Pin,
  PinOff,
  Search,
  Menu,
  FolderOpen,
  Folder,
  GitBranch,
  Mail,
  Key,
  Settings,
  ClipboardList,
  Hash,
  Flag,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRegistry } from "../../config/apiRegistry";
import { hasPermission } from "../../lib/permissions";
import api from "../../services/api";

const ICON_MAP = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  mappin: <MapPin className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  box: <Box className="w-5 h-5" />,
  creditcard: <CreditCard className="w-5 h-5" />,
  "credit-card": <CreditCard className="w-5 h-5" />,
  layers: <Layers className="w-5 h-5" />,
  usercog: <UserCog className="w-5 h-5" />,
  shield: <ShieldCheck className="w-5 h-5" />,
  "shield-check": <ShieldCheck className="w-5 h-5" />,
  receipt: <Receipt className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  spreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  "git-branch": <GitBranch className="w-5 h-5" />,
  mail: <Mail className="w-5 h-5" />,
  "mail-plus": <Mail className="w-5 h-5" />,
  key: <Key className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  "clipboard-list": <ClipboardList className="w-5 h-5" />,
  hash: <Hash className="w-5 h-5" />,
  flag: <Flag className="w-5 h-5" />,
};

export default function Sidebar({ appName = "WebPortal" }) {
  const { sidebarOpen, sidebarPinned } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop breakpoint check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderIcon = (iconName) => {
    return (
      ICON_MAP[iconName?.toLowerCase()] || <FileText className="w-5 h-5" />
    );
  };

  const [apiMenus, setApiMenus] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get("/app-menus/my-menus?forSidebar=true");
        setApiMenus(res.data.data);
      } catch (err) {
        console.error("Failed to fetch sidebar menus", err);
      } finally {
        setFetching(false);
      }
    };
    fetchMenus();
  }, [user?.activeRole, user?.isSuperAdmin]); // Re-fetch if role or admin status changes

  // Build menu tree from API response
  const menuTree = useMemo(() => {
    if (!apiMenus.length) return [];

    const flat = apiMenus.map((m) => ({
      id: String(m._id),
      menuId: m.menuId,
      description: m.description,
      icon: m.icon || apiRegistry[m.menuId?.toLowerCase()]?.icon,
      parentMenu: m.parentMenu ? String(m.parentMenu) : null,
      sortOrder: m.sortOrder || 0,
      menuLevel: m.menuLevel ?? 0,
      menuType: m.menuType || "page",
      slug:
        m.slug ||
        m.menuId?.toLowerCase().replace(/\s+/g, "") ||
        m.description?.toLowerCase().replace(/\s+/g, ""),
    }));

    const tree = [];
    const map = {};
    flat.forEach((m) => {
      map[m.id] = { ...m, children: [] };
    });

    flat.forEach((m) => {
      if (m.parentMenu && map[m.parentMenu]) {
        map[m.parentMenu].children.push(map[m.id]);
      } else {
        tree.push(map[m.id]);
      }
    });

    const sortFn = (a, b) => a.sortOrder - b.sortOrder;
    tree.sort(sortFn);
    tree.forEach((t) => {
      t.children.sort(sortFn);
      t.children.forEach((c) => c.children?.sort(sortFn));
    });

    return tree;
  }, [apiMenus]);

  // Auto-expand parent if child is active
  useEffect(() => {
    if (!sidebarOpen) return;

    const newOpenMenus = { ...openMenus };
    let changed = false;

    const findAndExpandParent = (items, targetPath) => {
      for (const item of items) {
        const normalizedSlug = item.slug?.toLowerCase();
        const path = `/${normalizedSlug}`;

        // Check if this item's children contain the active path
        if (item.children.length > 0) {
          const hasActiveChild = item.children.some((child) => {
            const childSlug = child.slug?.toLowerCase();
            return targetPath.startsWith(`/${childSlug}`);
          });

          if (hasActiveChild && !newOpenMenus[normalizedSlug]) {
            newOpenMenus[normalizedSlug] = true;
            changed = true;
          }
          findAndExpandParent(item.children, targetPath);
        }
      }
    };

    findAndExpandParent(menuTree, location.pathname.toLowerCase());
    if (changed) setOpenMenus(newOpenMenus);
  }, [location.pathname, menuTree, sidebarOpen]);

  // ─── Hover handlers (desktop only, not pinned) ───────────────────────────
  const handleMouseEnter = useCallback(() => {
    if (!isDesktop || sidebarPinned) return;
    clearTimeout(hoverTimeoutRef.current);
    dispatch(setSidebarOpen(true));
  }, [isDesktop, sidebarPinned, dispatch]);

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop || sidebarPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      dispatch(setSidebarOpen(false));
    }, 200);
  }, [isDesktop, sidebarPinned, dispatch]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handlePin = () => {
    dispatch(pinSidebar());
  };

  // ─── Menu Item Renderer ──────────────────────────────────────────────────
  const renderNavItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isFolder = item.menuType === "folder" || hasChildren;
    const normalizedSlug = item.slug?.toLowerCase();
    const config = apiRegistry[normalizedSlug];
    const path = `/${normalizedSlug}`;

    const displayLabel = config?.title || item.description;
    const iconName = config?.icon || item.icon;

    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path + "/"));
    const isOpen = openMenus[normalizedSlug];

    const handleToggle = (e) => {
      e.stopPropagation();
      setOpenMenus((prev) => ({
        ...prev,
        [normalizedSlug]: !prev[normalizedSlug],
      }));
    };

    const handleNavigate = () => {
      if (isFolder) {
        setOpenMenus((prev) => ({
          ...prev,
          [normalizedSlug]: !prev[normalizedSlug],
        }));
        // On mobile, don't close sidebar when opening a folder
      } else {
        navigate(path);
        // On mobile, close sidebar after navigation
        if (!isDesktop) {
          dispatch(toggleSidebar());
        }
      }
    };

    // Filter by search term — include parent if any child matches
    if (searchTerm) {
      const matchesSelf = displayLabel
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesChild =
        hasChildren &&
        item.children.some((c) => {
          const childLabel =
            apiRegistry[c.slug?.toLowerCase()]?.title || c.description;
          return childLabel?.toLowerCase().includes(searchTerm.toLowerCase());
        });
      if (!matchesSelf && !matchesChild) return null;
    }

    return (
      <li key={item.id} className="list-none">
        <div
          onClick={handleNavigate}
          className={`
            flex items-center px-3 py-2.5 transition-all cursor-pointer group rounded-lg mx-2 my-0.5
            ${isActive && !isFolder ? "bg-indigo-50/80 border-l-2 border-indigo-500" : "hover:bg-slate-50 border-l-2 border-transparent"}
          `}
          title={!sidebarOpen ? displayLabel : undefined}
        >
          <div
            className={`
            transition-all duration-300 shrink-0
            ${sidebarOpen ? "mr-3 scale-100" : "mx-auto scale-110"}
            ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
          `}
          >
            {isFolder && sidebarOpen ? (
              isOpen ? (
                <FolderOpen className="w-5 h-5" />
              ) : (
                <Folder className="w-5 h-5" />
              )
            ) : (
              renderIcon(iconName)
            )}
          </div>

          {sidebarOpen && (
            <span
              className={`
              flex-1 text-[13px] font-semibold tracking-tight transition-colors truncate
              ${isActive ? "text-slate-900 font-bold" : "text-slate-600 group-hover:text-slate-900"}
            `}
            >
              {displayLabel}
            </span>
          )}

          {sidebarOpen && isFolder && (
            <div
              onClick={handleToggle}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500 transition-transform" />
              ) : (
                <ChevronR className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              )}
            </div>
          )}
        </div>

        {sidebarOpen && isFolder && isOpen && (
          <ul className="mt-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-slate-100 ml-4">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // On desktop: sidebar is always visible (collapsed or expanded). On mobile: overlay.
  const isExpanded = sidebarOpen;

  return (
    <>
      {/* Mobile Backdrop — only on small screens when overlay is open */}
      {!isDesktop && isExpanded && (
        <div
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[100] animate-in fade-in duration-300"
        />
      )}

      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          flex flex-col h-screen bg-white border-r border-slate-200 z-[110] 
          ${
            isDesktop
              ? `sticky top-0 transition-all duration-300 ease-in-out ${isExpanded ? "w-[280px]" : "w-[68px]"}`
              : `fixed top-0 left-0 transition-transform duration-300 ease-in-out w-72 ${isExpanded ? "translate-x-0" : "-translate-x-full"}`
          }
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-3 border-b border-slate-50 shrink-0">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${isExpanded ? "px-1" : "mx-auto"}`}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-lg font-black tracking-[0.1em] text-slate-900 uppercase italic">
                  Anti-G
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Enterprise
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Search (only when expanded) */}
        {isExpanded && (
          <div className="px-3 py-3 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent border focus:border-indigo-100 focus:bg-white rounded-xl text-sm transition-all focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto pt-2 pb-6 scroll-smooth no-scrollbar">
          {fetching ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ul className="space-y-0.5">
              {menuTree
                .filter((item) => {
                  if (!searchTerm) return true;
                  const label =
                    apiRegistry[item.slug?.toLowerCase()]?.title ||
                    item.description;
                  const matchesSelf = label
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  const matchesChild = item.children?.some((c) => {
                    const childLabel =
                      apiRegistry[c.slug?.toLowerCase()]?.title ||
                      c.description;
                    return childLabel
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  });
                  return matchesSelf || matchesChild;
                })
                .map((item) => renderNavItem(item))}
            </ul>
          )}
        </div>

        {/* Footer — Pin toggle (desktop) / Close (mobile) */}
        <div className="border-t border-slate-100 p-2 shrink-0 bg-slate-50/30">
          {isDesktop
            ? /* Desktop: pin/unpin button */
              isExpanded && (
                <button
                  onClick={handlePin}
                  className={`
                  flex items-center justify-center w-full p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all font-bold group
                `}
                  title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar open"}
                >
                  {sidebarPinned ? (
                    <>
                      <PinOff className="w-4 h-4 mr-2.5" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] flex-1 text-left">
                        Unpin Sidebar
                      </span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 mr-2.5" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] [word-spacing:0.1em] flex-1 text-left">
                        Pin Workspace
                      </span>
                    </>
                  )}
                </button>
              )
            : /* Mobile: close button — hidden when sidebar is closed */
              isExpanded && (
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="flex items-center justify-center w-full p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-widest">
                    Close Menu
                  </span>
                </button>
              )}
        </div>
      </div>
    </>
  );
}
