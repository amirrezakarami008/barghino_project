import type { Metadata } from "next";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";

export const metadata: Metadata = {
  title: {
    default: "پنل کاربری",
    template: "%s | پنل برقینو",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
