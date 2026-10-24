import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "بررسی نصب" };

export default function ReviewsPage() {
  return (
    <WorkspacePage
      icon="sun"
      title="صف بررسی خالی است"
      lede="درخواست‌های نصب که منتظر تأیید یا رد هستند اینجا می‌آیند. تصمیم نهایی با کارشناس است."
    />
  );
}
