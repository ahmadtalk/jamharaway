"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { HiOutlineX, HiOutlineChevronDown } from "react-icons/hi";
import { useState } from "react";
import { navItems } from "@/config/navigation";
import type { NavItem } from "@/types/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col bg-navy-800 text-white
          transition-transform duration-300
          xl:translate-x-0
          ${open ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="text-xl font-bold">
            تدقيق <span className="text-brand-400">PRO</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-navy-700 xl:hidden"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 border-b border-navy-700" />

        {/* Navigation */}
        <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-navy-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-gray-300">حسابي</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  pathname,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  onClose: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  const [expanded, setExpanded] = useState(isActive && hasChildren);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onClose}
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
            transition-colors
            ${
              isActive
                ? "bg-brand-500 text-white"
                : "text-gray-300 hover:bg-navy-700 hover:text-white"
            }
          `}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
          transition-colors
          ${
            isActive
              ? "bg-navy-700 text-white"
              : "text-gray-300 hover:bg-navy-700 hover:text-white"
          }
        `}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-start">{item.label}</span>
        <HiOutlineChevronDown
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <ul
        className={`
          overflow-hidden transition-all duration-200
          ${expanded ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        {item.children!.map((child) => {
          const childActive = pathname === child.href;
          return (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onClose}
                className={`
                  flex items-center rounded-lg py-2 pr-12 pl-3 text-sm
                  transition-colors
                  ${
                    childActive
                      ? "font-semibold text-brand-400"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                <span
                  className={`ml-3 h-1.5 w-1.5 rounded-full ${
                    childActive ? "bg-brand-400" : "bg-gray-600"
                  }`}
                />
                {child.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
