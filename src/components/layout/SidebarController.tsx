"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function SidebarController({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col xl:me-[280px]">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
