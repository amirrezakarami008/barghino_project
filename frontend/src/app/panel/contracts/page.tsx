import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "قراردادها" };

export default function ContractsPage() {
  return (
    <WorkspacePage
      icon="file"
      title="قراردادی ثبت نشده"
      lede="قرارداد فروش یا نصب، وضعیت امضا و فایل‌ها بعد از ایجاد پیش‌نویس اینجا فهرست می‌شوند."
    />
  );
}
