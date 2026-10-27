import type { Metadata } from "next";
import { AdminLockedSection } from "@/features/admin/admin-locked-section";

export const metadata: Metadata = { title: "بررسی نصب" };

export default function ReviewsPage() {
  return <AdminLockedSection title="بررسی درخواست‌های نصب" />;
}
