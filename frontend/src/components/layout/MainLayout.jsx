import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DynamicHeader from "./DynamicHeader";
import LoadingOverlay from "../ui/LoadingOverlay";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <LoadingOverlay />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50">
        <DynamicHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full overflow-x-hidden relative">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
