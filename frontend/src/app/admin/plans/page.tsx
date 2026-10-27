import type { Metadata } from "next";
import { AdminPlans } from "@/features/admin/admin-plans";

export const metadata: Metadata = { title: "پلن‌ها" };

export default function PlansPage() {
  return <AdminPlans />;
}
