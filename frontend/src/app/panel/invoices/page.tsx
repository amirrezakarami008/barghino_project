import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "صورت‌حساب‌ها" };

export default function InvoicesPage() {
  return (
    <WorkspacePage
      icon="card"
      title="صورت‌حسابی نیست"
      lede="هر دوره فروش انرژی، نرخ اعمال‌شده، مبلغ و سررسید را نشان می‌دهد. تا قرائت و تعرفه، فاکتوری ساخته نمی‌شود."
    />
  );
}
