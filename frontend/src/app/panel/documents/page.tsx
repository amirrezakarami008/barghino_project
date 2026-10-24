import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "مدارک" };

export default function DocumentsPage() {
  return (
    <WorkspacePage
      icon="file"
      title="مدرکی بارگذاری نشده"
      lede="کارت ملی، شناسنامه و فایل قرارداد اینجا می‌مانند. آپلود وقتی سرویس فایل وصل شود فعال می‌شود."
    />
  );
}
