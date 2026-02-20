import SidebarController from "@/components/layout/SidebarController";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarController>{children}</SidebarController>;
}
