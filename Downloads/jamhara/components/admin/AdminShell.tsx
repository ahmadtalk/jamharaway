"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  userEmail?: string | null;
}

export function AdminShell({ children, title, userEmail }: AdminShellProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="a-shell">
      {/* Sidebar */}
      <aside className="a-sidebar">
        <div className="a-logo">
          <span>جمهرة</span>
          <small>لوحة التحكم</small>
        </div>
        <nav className="a-nav">
          <Link href="/admin" aria-current={isActive("/admin") ? "page" : undefined}>
            📊 الرئيسية
          </Link>
          <Link href="/admin/posts" aria-current={isActive("/admin/posts") ? "page" : undefined}>
            📝 المنشورات
          </Link>
          <Link href="/admin/generate" aria-current={isActive("/admin/generate") ? "page" : undefined}>
            ✨ التوليد
          </Link>
          <Link href="/admin/categories" aria-current={isActive("/admin/categories") ? "page" : undefined}>
            🗂️ التصنيفات
          </Link>
          <Link href="/admin/schedule" aria-current={isActive("/admin/schedule") ? "page" : undefined}>
            ⏰ الجدولة
          </Link>
          <Link href="/admin/costs" aria-current={isActive("/admin/costs") ? "page" : undefined}>
            💰 التكاليف
          </Link>
          <Link href="/admin/diagnostics" aria-current={isActive("/admin/diagnostics") ? "page" : undefined}>
            🔍 التشخيص
          </Link>
        </nav>
        <div className="a-sidebar-footer">
          {userEmail && <p title={userEmail}>{userEmail}</p>}
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="a-logout-btn">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="a-main">
        <div className="a-topbar">
          <h1 className="a-page-title">{title}</h1>
          {userEmail && <span className="a-topbar-user">{userEmail}</span>}
        </div>
        <div className="a-content">{children}</div>
      </main>
    </div>
  );
}
