import { navItems } from "@/config/navigation";

/**
 * دمج class names بشكل نظيف
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface BreadcrumbSegment {
  label: string;
  href: string;
}

/**
 * استخراج عنوان الصفحة من pathname
 */
export function getPageTitle(pathname: string): string {
  for (const item of navItems) {
    if (item.href === pathname) return item.label;
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) return child.label;
      }
    }
  }
  return "لوحة التحكم";
}

/**
 * بناء مسار التنقل (breadcrumb) من pathname
 * مثال: "/dashboard/apps/templates/hourglass" →
 *   [{ label: "القوالب الصحفية", href: "/dashboard/apps/templates" },
 *    { label: "الساعة الرملية", href: "/dashboard/apps/templates/hourglass" }]
 */
export function getBreadcrumb(pathname: string): BreadcrumbSegment[] {
  for (const item of navItems) {
    if (item.href === pathname) {
      return [{ label: item.label, href: item.href }];
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) {
          return [
            { label: item.label, href: item.href },
            { label: child.label, href: child.href },
          ];
        }
      }
    }
  }
  return [{ label: "لوحة التحكم", href: "/dashboard" }];
}
