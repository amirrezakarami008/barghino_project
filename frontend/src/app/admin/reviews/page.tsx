import type { Metadata } from "next";
import { AdminReviews } from "@/features/admin/admin-reviews";

export const metadata: Metadata = { title: "بررسی درخواست‌ها" };
export default function ReviewsPage() { return <AdminReviews />; }
