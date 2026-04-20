import React, { useState, useEffect } from "react";
import api from "../services/api";
import { cn } from "../lib/utils";
import {
  Loader2,
  Info,
  AlertTriangle,
  Trash2,
  Plus,
  Settings,
  Bell,
  User,
  Lock,
  Eye,
  Database,
  CheckCircle2,
} from "lucide-react";

// Radix UI Components
import { Switch } from "../components/ui/Switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";
import { Checkbox } from "../components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/AlertDialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../components/ui/Tooltip";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/ToggleGroup";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/Accordion";
import { Separator } from "../components/ui/Separator";
import { ScrollArea } from "../components/ui/ScrollArea";

export default function RadixPlayground() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [activeToggle, setActiveToggle] = useState(true);
  const [status, setStatus] = useState("active");
  const [permissions, setPermissions] = useState(["view", "edit"]);
  const [toastVariant, setToastVariant] = useState("light");
  // 'light' | 'tinted' | 'dark'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments");
      setData(res.data.data.slice(0, 5)); // Just show first 5
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const getToastOptions = () => {
    switch (toastVariant) {
      case "tinted":
        return {
          success: {
            style: {
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#7f1d1d",
              border: "1px solid #fecaca",
            },
          },
        };

      case "dark":
        return {
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.05)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#1e293b" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#1e293b" },
          },
        };

      default: // light
        return {
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
          },
          success: {
            style: {
              borderLeft: "4px solid #10b981",
            },
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            style: {
              borderLeft: "4px solid #ef4444",
            },
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        };
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Radix UI Playground
        </h1>
        <p className="text-slate-500 text-lg">
          Previewing the next-generation components for WebPortal v2.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 1. Switch & Tooltip */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold">Switch & Tooltips</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  Master Status
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Toggling this will enable/disable the record globally.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-slate-500">
                Currently {activeToggle ? "Active" : "Inactive"}
              </p>
            </div>
            <Switch checked={activeToggle} onCheckedChange={setActiveToggle} />
          </div>
        </section>

        {/* 2. Permission Icons - Multiple Options */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Permission Selection Options</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            {/* Option A: Current Toggle Group */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Option A: Toggle Group (Pills)
              </label>
              <ToggleGroup
                type="multiple"
                value={permissions}
                onValueChange={setPermissions}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="view"
                  className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200"
                >
                  View
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="edit"
                  className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200"
                >
                  Edit
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="approve"
                  className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200"
                >
                  Approve
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Separator />

            {/* Option B: Switch List */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Option B: Switch List (Clean & Modern)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: "view",
                    label: "View Records",
                    icon: <Eye className="w-4 h-4" />,
                  },
                  {
                    id: "edit",
                    label: "Edit Content",
                    icon: <Plus className="w-4 h-4" />,
                  },
                  {
                    id: "approve",
                    label: "Approve Work",
                    icon: <CheckCircle2 className="w-4 h-4" />,
                  },
                  {
                    id: "delete",
                    label: "Delete Data",
                    icon: <Trash2 className="w-4 h-4" />,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{item.icon}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {item.label}
                      </span>
                    </div>
                    <Switch
                      checked={permissions.includes(item.id)}
                      onCheckedChange={(checked) => {
                        setPermissions((prev) =>
                          checked
                            ? [...prev, item.id]
                            : prev.filter((p) => p !== item.id),
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Option C: Styled Checkbox Cards */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Option C: Checkbox Cards (Best for Density)
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "View",
                  "Add",
                  "Edit",
                  "Delete",
                  "Approve",
                  "Submit",
                  "All",
                ].map((p) => {
                  const val = p.toLowerCase();
                  const isChecked = permissions.includes(val);
                  return (
                    <label
                      key={p}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none",
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300",
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          setPermissions((prev) =>
                            checked
                              ? [...prev, val]
                              : prev.filter((x) => x !== val),
                          );
                        }}
                        className={
                          isChecked
                            ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                            : ""
                        }
                      />
                      <span className="text-xs font-bold">{p}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Tabs & API Data */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">
            Tabs & API Integration (Departments)
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Tabs defaultValue="list" className="w-full">
            <div className="px-6 border-b border-slate-50 bg-slate-50/30">
              <TabsList className="bg-transparent border-none gap-8 h-14">
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-bold"
                >
                  Department List
                </TabsTrigger>
                <TabsTrigger
                  value="config"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-bold"
                >
                  Configuration
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {data.map((dept) => (
                      <div
                        key={dept._id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                            {dept.deptCode.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {dept.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {dept.deptCode} • {dept.location}
                            </p>
                          </div>
                        </div>
                        <Switch checked={dept.isActive} disabled />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="config">
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-slate-500">
                    Configuration panel is currently under development.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* 4. AlertDialog & Accordion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            Confirmations
          </h2>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <p className="text-sm text-slate-500">
              Replace standard browser alerts with accessible Radix Modals.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-100">
                  <Trash2 className="w-4 h-4" /> Delete Resource
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg">
              <User className="w-5 h-5 text-sky-600" />
            </div>
            Accordion (Help & FAQs)
          </h2>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-slate-700 font-bold hover:no-underline px-4">
                  What is Radix UI?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-slate-500 leading-relaxed">
                  Radix UI is a library of unstyled, accessible UI primitives
                  for building high-quality design systems and web apps in
                  React.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-slate-700 font-bold hover:no-underline px-4">
                  Is it integrated with Tailwind?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-slate-500 leading-relaxed">
                  Yes, we've styled these primitives using Tailwind CSS and CSS
                  variables to match your existing brand identity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold">Toaster Preview</h2>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          {/* VARIANT SWITCH */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            {[
              { key: "light", label: "Light" },
              { key: "tinted", label: "Tinted" },
              { key: "dark", label: "Dark" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setToastVariant(item.key)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  toastVariant === item.key
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-500",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Separator />

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => toast.success("Saved successfully!")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
            >
              Success Toast
            </button>

            <button
              onClick={() => toast.error("Something went wrong!")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
            >
              Error Toast
            </button>

            <button
              onClick={() => toast("This is a normal message")}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold"
            >
              Default Toast
            </button>
          </div>
        </div>
      </section>

      <div className="pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase border border-emerald-100">
          <CheckCircle2 className="w-4 h-4" /> Components Ready for Integration
        </div>
      </div>
    </div>
  );
}
