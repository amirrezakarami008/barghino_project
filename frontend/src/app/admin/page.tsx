import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { articles } from "@/features/marketing/articles";

export const metadata: Metadata = { title: "مدیریت" };

export default function AdminHomePage() {
  return <AdminDashboard guides={articles} />;
}
