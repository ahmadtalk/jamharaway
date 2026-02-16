"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - right side for RTL */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col xl:me-[280px]">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
