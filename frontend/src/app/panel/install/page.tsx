import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "درخواست نصب" };

const stages = ["ثبت", "بررسی", "بازدید", "پیشنهاد", "قرارداد", "نصب", "بهره‌برداری"];

export default function InstallRequestPage() {
  return (
    <WorkspacePage icon="sun" title="درخواست نصب" lede="هفت مرحله از ثبت تا بهره‌برداری. تا وقتی درخواستی نسازید، همه مرحله‌ها خاموش می‌مانند.">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <li key={stage} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
            <span className="font-bold text-primary">{index + 1}</span>
            <span className="ms-2 font-semibold text-foreground">{stage}</span>
            <p className="mt-2 text-xs">شروع نشده</p>
          </li>
        ))}
      </ol>
    </WorkspacePage>
  );
}
