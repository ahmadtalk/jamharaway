"use client";

import { usePathname } from "next/navigation";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { getPageTitle, getBreadcrumb } from "@/lib/utils";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 xl:hidden"
          >
            <HiOutlineMenuAlt3 className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs text-gray-400">
              الصفحات
              {breadcrumb.map((seg) => (
                <span key={seg.href}> / {seg.label}</span>
              ))}
            </p>
            <h1 className="text-lg font-bold text-navy-700">{title}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-4 py-2 md:flex">
          <input
            type="text"
            placeholder="بحث..."
            className="w-48 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
      </div>
    </header>
  );
}
