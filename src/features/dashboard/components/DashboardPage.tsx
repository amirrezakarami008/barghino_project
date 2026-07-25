import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import type { ReactNode } from "react";

interface DashboardPageProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardPage({ title, subtitle, action, children }: DashboardPageProps) {
  return (
    <>
      <DashboardHeader title={title} subtitle={subtitle} action={action} />
      <main className="flex-1 overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</main>
    </>
  );
}
