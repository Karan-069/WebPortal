import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { cn } from '../lib/utils';
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
  Save,
  RotateCcw,
  Download,
  ArrowRight,
  Mail,
  Share2,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import AsyncSelect from '../components/ui/AsyncSelect';
import SearchableSelect from '../components/ui/SearchableSelect';

// Radix UI Components
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Checkbox } from '../components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogFooter, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogAction, 
  AlertDialogCancel 
} from '../components/ui/AlertDialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/Tooltip';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/ToggleGroup';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { Separator } from '../components/ui/Separator';
import { ScrollArea } from '../components/ui/ScrollArea';

export default function RadixPlayground() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [activeToggle, setActiveToggle] = useState(true);
  const [status, setStatus] = useState('active');
  const [permissions, setPermissions] = useState(['view', 'edit']);
  const [toastVariant, setToastVariant] = useState('light'); 
  const [asyncVal, setAsyncVal] = useState(null);
  const [searchableVal, setSearchableVal] = useState(null);
// 'light' | 'tinted' | 'dark'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setData(res.data.data.slice(0, 5)); // Just show first 5
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const getToastOptions = () => {
    switch (toastVariant) {
      case 'tinted':
        return {
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              fontWeight: '600'
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontWeight: '600'
            },
          },
        };

      case 'dark':
        return {
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
        };

      case 'glass':
        return {
          style: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            fontWeight: '700'
          },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        };

      default: // bordered
        return {
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
          },
          success: {
            style: { borderLeft: '4px solid #10b981' },
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            style: { borderLeft: '4px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        };
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Public+Sans:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
      `}} />

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Radix UI Playground</h1>
        <p className="text-slate-500 text-lg">Previewing the next-generation components for WebPortal v2.</p>
      </div>

      <Separator />

      {/* NEW: FONT COMPARISON SYSTEM */}
      <section className="space-y-8 mt-12 mb-16">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-100 rounded-2xl shadow-lg shadow-blue-100/50"><Search className="w-6 h-6 text-blue-600" /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Font Options</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Side-by-side comparison of top UI fonts</p>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[
            { 
               name: 'Inter', 
               family: "'Inter', sans-serif", 
               desc: 'Highly versatile and free, designed specifically for user interfaces and screen readability.' 
            },
            { 
               name: 'Roboto', 
               family: "'Roboto', sans-serif", 
               desc: 'Clean and approachable, ideal for consistent display across web/mobile platforms.' 
            },
            { 
               name: 'Open Sans', 
               family: "'Open Sans', sans-serif", 
               desc: 'Highly readable at small sizes, optimized for digital interfaces.' 
            },
            { 
               name: 'IBM Plex Sans', 
               family: "'IBM Plex Sans', sans-serif", 
               desc: 'Designed to be rational yet expressive, perfect for technical and corporate apps.' 
            },
            { 
               name: 'DM Sans', 
               family: "'DM Sans', sans-serif", 
               desc: 'A low-contrast geometric font designed for readability.' 
            },
            { 
               name: 'Public Sans', 
               family: "'Public Sans', sans-serif", 
               desc: 'A neutral typeface strong for UI layouts and data display.' 
            },
            { 
               name: 'San Francisco', 
               family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
               desc: 'The standard Apple interface font, ensuring native feel.' 
            }
          ].map((font) => (
            <div key={font.name} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30" style={{ fontFamily: font.family }}>
               <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{font.name}</h3>
                    <p className="text-[12px] font-medium text-slate-500 mt-1">{font.desc}</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
                    Preview
                  </div>
               </div>
               
               <div className="space-y-6">
                 {/* Simulated Page Header */}
                 <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                         Bill #EXP-2026-089
                      </h1>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                         Software Licensing • Tech Department
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                       Pending Approval
                    </div>
                 </div>

                 <Separator />

                 {/* Simulated Data Row */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Vendor Name</p>
                          <p className="text-sm font-semibold text-slate-800">Microsoft Corporation</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                          <p className="text-lg font-bold text-slate-900 tabular-nums">₹ 4,50,000.00</p>
                       </div>
                    </div>
                 </div>

                 {/* Simulated UI Actions */}
                 <div className="flex items-center gap-3 pt-2">
                    <button className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                       Reject Bill
                    </button>
                    <button className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                       Approve Request
                    </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* NEW: TYPOGRAPHY SYSTEM */}
      <section className="space-y-8 mt-12 mb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-fuchsia-100 rounded-2xl shadow-lg shadow-fuchsia-100/50"><Search className="w-6 h-6 text-fuchsia-600" /></div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Typography</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Powered by Plus Jakarta Sans</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em] mb-3">Display Header (Uppercase)</p>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
                    VENDOR PORTAL
                 </h1>
              </div>
              <div>
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em] mb-3">Section Title (Uppercase)</p>
                 <h2 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">
                    Procurement Analytics
                 </h2>
              </div>
              <div>
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em] mb-3">Paragraph & Reading</p>
                 <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                    Our architecture provides excellent geometric clarity, making complex financial tables, invoice processing grids, and dense workflows feel highly accessible.
                 </p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
              <div className="space-y-2">
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">UI Labels (Uppercase)</p>
                 <div className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-600">
                   Transaction ID • Status • Action
                 </div>
              </div>
              <Separator />
              <div className="space-y-2">
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">Tabular Numbers</p>
                 <div className="text-xl font-bold text-slate-900 tabular-nums">
                   ₹ 45,982.50 <span className="text-emerald-500 text-sm ml-2">+12.5%</span>
                 </div>
              </div>
              <Separator />
              <div className="space-y-2">
                 <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">Form Input Mockup</p>
                 <input type="text" placeholder="Enter precise value" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* NEW: MICRO-HEADING LABELS SYSTEM */}
      <section className="space-y-8 mt-12 mb-16">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-teal-100 rounded-2xl shadow-lg shadow-teal-100/50"><Search className="w-6 h-6 text-teal-600" /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Micro-Heading Options</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Variants for uppercase small labels</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="inline-flex px-2 py-1 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded mb-1">Option 1: The Modern Base</div>
             <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em] mb-2">Transaction ID</p>
             <code className="text-[10px] text-indigo-500 bg-indigo-50 p-2 rounded block">text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]</code>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="inline-flex px-2 py-1 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded mb-1">Option 2: Heavy & Compact</div>
             <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest mb-2">Transaction ID</p>
             <code className="text-[10px] text-indigo-500 bg-indigo-50 p-2 rounded block">text-[10px] font-black uppercase text-slate-700 tracking-widest</code>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="inline-flex px-2 py-1 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded mb-1">Option 3: Crisp & Wide</div>
             <p className="text-[12px] font-semibold uppercase text-slate-400 tracking-[0.25em] mb-2">Transaction ID</p>
             <code className="text-[10px] text-indigo-500 bg-indigo-50 p-2 rounded block">text-[12px] font-semibold uppercase text-slate-400 tracking-[0.25em]</code>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="inline-flex px-2 py-1 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded mb-1">Option 4: Brand Tinted</div>
             <p className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-2">Transaction ID</p>
             <code className="text-[10px] text-indigo-500 bg-indigo-50 p-2 rounded block">text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em]</code>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="inline-flex px-2 py-1 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded mb-1">Option 5: High Contrast</div>
             <p className="text-[12px] font-bold uppercase text-slate-900 tracking-wider mb-2">Transaction ID</p>
             <code className="text-[10px] text-indigo-500 bg-indigo-50 p-2 rounded block">text-[12px] font-bold uppercase text-slate-900 tracking-wider</code>
          </div>
        </div>
      </section>

      <Separator />

      {/* NEW: UNIVERSAL BUTTON SYSTEM */}
      <section className="space-y-8 mt-12 mb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-100"><Settings className="w-6 h-6 text-white" /></div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Universal Button System</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Standardized color tokens & interaction states</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Variants Showcase */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Functional Variants</h3>
              <p className="text-xs text-slate-500 font-medium italic">Semantic color tokens for distinct actions</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outlined</Button>
              <Button variant="ghost">Ghost Mode</Button>
              <Button variant="soft">Soft Tint</Button>
              <Button variant="success" leftIcon={<CheckCircle2 size={14}/>}>Success</Button>
              <Button variant="danger" leftIcon={<Trash2 size={14}/>}>Destructive</Button>
            </div>
          </div>

          {/* Sizes & Icons */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-10">
            <div className="grid gap-8 md:grid-cols-2">
               <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-black text-slate-900 mb-1">Scale Hierarchy</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dimension variants</p>
                  </div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <Button size="xs" variant="outline">xs</Button>
                    <Button size="sm" variant="secondary">sm</Button>
                    <Button size="md" variant="primary">md</Button>
                    <Button size="lg" variant="primary">lg</Button>
                  </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-black text-slate-900 mb-1">Action Composites</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Icon integration</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button leftIcon={<Save size={14}/>} variant="success">Update</Button>
                    <Button rightIcon={<ArrowRight size={14}/>} variant="soft">Next</Button>
                    <Button leftIcon={<Download size={14}/>} size="sm" variant="secondary">Export</Button>
                  </div>
               </div>
            </div>
          </div>

          {/* State Handling */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm md:col-span-1 lg:col-span-2">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">Loading State</p>
                <div className="h-16 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Button isLoading variant="primary" fullWidth>Processing Account</Button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">Disabled State</p>
                <div className="h-16 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4">
                  <Button disabled variant="secondary" fullWidth>Permission Denied</Button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.15em]">Full Width Mobile</p>
                <div className="h-16 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4">
                  <Button fullWidth variant="soft" leftIcon={<Mail size={14}/>}>Continue with Email</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 1. Switch & Tooltip */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg"><Settings className="w-5 h-5 text-indigo-600" /></div>
             <h2 className="text-xl font-bold">Switch & Tooltips</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Master Status</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggling this will enable/disable the record globally.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-slate-500">Currently {activeToggle ? 'Active' : 'Inactive'}</p>
            </div>
            <Switch checked={activeToggle} onCheckedChange={setActiveToggle} />
          </div>
        </section>

        {/* 2. Permission Icons - Multiple Options */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-50 rounded-lg"><Lock className="w-5 h-5 text-amber-600" /></div>
             <h2 className="text-xl font-bold">Permission Selection Options</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            {/* Option A: Current Toggle Group */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">Option A: Toggle Group (Pills)</label>
              <ToggleGroup type="multiple" value={permissions} onValueChange={setPermissions} className="justify-start">
                <ToggleGroupItem value="view" className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200">
                  View
                </ToggleGroupItem>
                <ToggleGroupItem value="edit" className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200">
                  Edit
                </ToggleGroupItem>
                <ToggleGroupItem value="approve" className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 border border-transparent data-[state=on]:border-indigo-200">
                  Approve
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Separator />

            {/* Option B: Switch List */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">Option B: Switch List (Clean & Modern)</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'view', label: 'View Records', icon: <Eye className="w-4 h-4" /> },
                  { id: 'edit', label: 'Edit Content', icon: <Plus className="w-4 h-4" /> },
                  { id: 'approve', label: 'Approve Work', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { id: 'delete', label: 'Delete Data', icon: <Trash2 className="w-4 h-4" /> }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                       <span className="text-slate-400">{item.icon}</span>
                       <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <Switch 
                      checked={permissions.includes(item.id)} 
                      onCheckedChange={(checked) => {
                        setPermissions(prev => checked ? [...prev, item.id] : prev.filter(p => p !== item.id))
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Option C: Styled Checkbox Cards */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] [word-spacing:0.1em]">Option C: Checkbox Cards (Best for Density)</label>
              <div className="flex flex-wrap gap-3">
                {['View', 'Add', 'Edit', 'Delete', 'Approve', 'Submit', 'All'].map((p) => {
                  const val = p.toLowerCase();
                  const isChecked = permissions.includes(val);
                  return (
                    <label key={p} className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none",
                      isChecked ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                    )}>
                      <Checkbox 
                        checked={isChecked} 
                        onCheckedChange={(checked) => {
                          setPermissions(prev => checked ? [...prev, val] : prev.filter(x => x !== val))
                        }}
                        className={isChecked ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600" : ""}
                      />
                      <span className="text-xs font-bold">{p}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Tabs & API Data */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-emerald-50 rounded-lg"><Database className="w-5 h-5 text-emerald-600" /></div>
           <h2 className="text-xl font-bold">Tabs & API Integration (Departments)</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Tabs defaultValue="list" className="w-full">
            <div className="px-6 border-b border-slate-50 bg-slate-50/30">
              <TabsList className="bg-transparent border-none gap-8 h-14">
                <TabsTrigger value="list" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-bold">
                  Department List
                </TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-bold">
                  Configuration
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                ) : (
                  <div className="grid gap-4">
                    {data.map(dept => (
                      <div key={dept._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">{dept.deptCode.substring(0,2)}</div>
                          <div>
                            <p className="font-bold text-slate-900">{dept.description}</p>
                            <p className="text-xs text-slate-500">{dept.deptCode} • {dept.location}</p>
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
                   <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
                   <p className="text-slate-500">Configuration panel is currently under development.</p>
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
              <div className="p-2 bg-red-50 rounded-lg"><Bell className="w-5 h-5 text-red-600" /></div>
              Confirmations
           </h2>
           <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <p className="text-sm text-slate-500">Replace standard browser alerts with accessible Radix Modals.</p>
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
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
           </div>
        </section>

        <section className="space-y-6">
           <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-sky-50 rounded-lg"><User className="w-5 h-5 text-sky-600" /></div>
              Accordion (Help & FAQs)
           </h2>
           <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-slate-700 font-bold hover:no-underline px-4">What is Radix UI?</AccordionTrigger>
                  <AccordionContent className="px-4 text-slate-500 leading-relaxed">
                    Radix UI is a library of unstyled, accessible UI primitives for building high-quality design systems and web apps in React.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-slate-700 font-bold hover:no-underline px-4">Is it integrated with Tailwind?</AccordionTrigger>
                  <AccordionContent className="px-4 text-slate-500 leading-relaxed">
                    Yes, we've styled these primitives using Tailwind CSS and CSS variables to match your existing brand identity.
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
    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
      {[
        { key: 'light', label: 'Bordered' },
        { key: 'tinted', label: 'Soft Tint' },
        { key: 'dark', label: 'Deep Slate' },
        { key: 'glass', label: 'Frosted Glass' },
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => setToastVariant(item.key)}
          className={cn(
            "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            toastVariant === item.key
              ? "bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>

    <Separator className="opacity-50" />

    {/* ACTION BUTTONS */}
    <div className="flex gap-4 flex-wrap">
      <Button 
        variant="success" 
        onClick={() => toast.success('Transaction approved successfully!', getToastOptions())}
        leftIcon={<CheckCircle2 size={16}/>}
      >
        Success Toast
      </Button>

      <Button 
        variant="danger" 
        onClick={() => toast.error('Failed to update record. Please try again.', getToastOptions())}
        leftIcon={<Trash2 size={16}/>}
      >
        Error Toast
      </Button>

      <Button 
        variant="outline" 
        onClick={() => toast('This is a neutral system notification.', getToastOptions())}
        leftIcon={<Bell size={16}/>}
      >
        Default Toast
      </Button>
    </div>

  </div>
</section>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* NEW: DROPDOWN & SELECT PATTERNS */}
        <section className="space-y-8 mt-12 mb-16 col-span-full">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100"><Share2 className="w-6 h-6 text-white" /></div>
              <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select & Search Patterns</h2>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Comparing Persistence & UX Performance</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Variant 1: Current Custom AsyncSelect */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">A. Custom AsyncSelect</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Production engine: Now powered by Radix + Cmdk</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100">Live Production</span>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Async Search (Cmdk Engine)</label>
                      <AsyncSelect 
                        endpoint="/departments"
                        value={asyncVal}
                        onChange={setAsyncVal}
                        placeholder="Search departments..."
                      />
                   </div>
                   <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      <span className="text-emerald-600 font-bold">SCALE:</span> Best for 1,000+ records (Vendors, Items). <br/>
                      <span className="text-indigo-600 font-bold">PERFORMANCE:</span> Fetches 50-100 items at a time with debounced search (300ms).
                   </div>
                </div>
              </div>

              {/* Variant 2: SearchableSelect (Cmdk) */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">B. SearchableSelect (Cmdk)</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Standardized Radix + Cmdk pattern for static/cached lists</p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">Functional</span>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Static Search (Pre-loaded)</label>
                      <SearchableSelect 
                        value={searchableVal}
                        onChange={setSearchableVal}
                        options={[
                          { label: 'Engineering (Static)', value: 'eng' },
                          { label: 'Marketing (Static)', value: 'mkt' },
                          { label: 'Human Resources (Static)', value: 'hr' },
                          { label: 'Operations (Static)', value: 'ops' },
                          { label: 'Customer Success (Static)', value: 'cs' }
                        ]}
                      />
                   </div>
                   <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      <span className="text-emerald-600 font-bold">SCALE:</span> Best for small lists (&lt; 50 records) like Departments or UOMs. <br/>
                      <span className="text-red-500 font-bold">LIMITATION:</span> Loads ALL items into memory on mount. Not for Vendors/Items.
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* Loader Samples */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg"><Loader2 className="w-5 h-5 text-indigo-600" /></div>
             <h2 className="text-xl font-bold">Premium Loader Options</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            {/* Variant 1: Geometric Pulse */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">1. Geometric Pulse</p>
                  <p className="text-xs text-slate-500">Subtle glow with rotation</p>
               </div>
               <div className="relative">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <div className="absolute inset-0 blur-lg bg-indigo-400/20 rounded-full animate-pulse" />
               </div>
            </div>

            {/* Variant 2: Shimmer Bar */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-800">2. Shimmer Progress</p>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Loading...</span>
               </div>
               <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-shimmer" 
                       style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)' }} />
                  <div className="h-full bg-indigo-600 rounded-full w-1/3 animate-pulse" />
               </div>
            </div>

            {/* Variant 3: Oscillating Dots */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">3. Oscillating Dots</p>
                  <p className="text-xs text-slate-500">Minimalist and smooth</p>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
               </div>
            </div>
          </div>
        </section>

        {/* Return Button Samples */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-50 rounded-lg"><Plus className="w-5 h-5 text-rose-600 rotate-45" /></div>
             <h2 className="text-xl font-bold">Return UI Patterns</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            
            {/* Variant A: Breadcrumb Action */}
            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A. Integrated Breadcrumb</p>
               <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
                     <Plus className="w-3.5 h-3.5 rotate-45" /> Back to List
                  </button>
                  <Separator orientation="vertical" className="h-4 mx-2" />
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                     <span>Master</span> / <span className="text-slate-900 font-bold">User Roles</span>
                  </div>
               </div>
            </div>

            {/* Variant B: Sticky Floating Bar (The problematic one?) */}
            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">B. Surface Action Bar</p>
               <div className="relative h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <p className="text-[10px] text-slate-400 italic">Simulated List Page Content</p>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-3 rounded-full border border-slate-200 shadow-xl scale-95">
                     <span className="text-xs font-bold text-slate-500">Viewing: Departments</span>
                     <button className="bg-slate-900 text-xs text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                        Return
                     </button>
                  </div>
               </div>
            </div>

            {/* Variant C: Sidebar/Header Link */}
            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">C. Inline Header Action</p>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h3 className="text-md font-black text-slate-900 leading-none">Departments</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Master Configuration</p>
                  </div>
                  <button className="flex items-center gap-2 group">
                     <span className="text-xs font-black uppercase text-slate-400 group-hover:text-indigo-600 transition-colors">Return to Masters</span>
                     <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 transition-all">
                        <Plus size={14} className="rotate-45 text-slate-400 group-hover:text-indigo-600" />
                     </div>
                  </button>
               </div>
            </div>

          </div>
        </section>
      </div>

      <div className="pb-20 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> Samples Ready for Review
         </div>
      </div>
    </div>
  );
}
