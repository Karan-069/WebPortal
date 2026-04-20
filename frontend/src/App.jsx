import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import BillList from "./pages/bills/BillList";
import BillForm from "./pages/bills/BillForm";
import MasterList from "./pages/master/MasterList";
import MasterForm from "./pages/master/MasterForm";
import ItemForm from "./pages/master/item/ItemForm";
import {
  LayoutDashboard,
  Receipt,
  Database,
  Settings,
  Download,
} from "lucide-react";
import CsvDownload from "./components/ui/CsvDownload";

// Vendor Portal imports
import VendorRegisterPage from "./pages/auth/VendorRegisterPage";
import VendorInviteManager from "./pages/master/VendorInviteManager";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorCompleteProfile from "./pages/vendor/VendorCompleteProfile";

// Import Dashboard Page
import DashboardPage from "./pages/dashboard/DashboardPage";
import ChangePassword from "./pages/auth/ChangePassword";
import RadixPlayground from "./pages/RadixPlayground";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vendor-register" element={<VendorRegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="radix-playground" element={<RadixPlayground />} />

            {/* Bills / Transactions */}
            <Route path="bills" element={<BillList />} />
            <Route path="bills/new" element={<BillForm />} />
            <Route path="bills/:id" element={<BillForm />} />
            <Route path="bills/:id/edit" element={<BillForm />} />

            {/* Vendor Scope */}
            <Route path="vendor/dashboard" element={<VendorDashboard />} />
            <Route
              path="vendor/complete-profile"
              element={<VendorCompleteProfile />}
            />
            <Route path="vendor-invites" element={<VendorInviteManager />} />

            {/* Item Master Specific Routes */}
            <Route path="item/new" element={<ItemForm />} />
            <Route path="item/:id" element={<ItemForm />} />
            <Route path="item/:id/edit" element={<ItemForm />} />

            {/* Master Data — Clean URLs without /api/v1 prefix */}
            <Route path="/:module" element={<MasterList />} />
            <Route path="/:module/new" element={<MasterForm />} />
            <Route path="/:module/:id" element={<MasterForm />} />
            <Route path="/:module/:id/edit" element={<MasterForm />} />

            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                  <div className="text-9xl font-black text-slate-100 absolute select-none">
                    404
                  </div>
                  <div className="relative text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      Page Not Found
                    </h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                      The module or record you're looking for doesn't exist or
                      has been moved.
                    </p>
                    <Link
                      to="/dashboard"
                      className="text-sky-600 font-bold text-sm block mt-4"
                    >
                      Return Home
                    </Link>
                  </div>
                </div>
              }
            />
          </Route>
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: "14px",
            padding: "12px 16px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#f8fafc" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
