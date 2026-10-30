import type { Metadata } from "next";
import { WorkspaceLockedSection } from "@/features/workspace/workspace-locked-section";

export const metadata: Metadata = { title: "تنظیمات" };

export default function SettingsPage() {
  return (
    <WorkspaceLockedSection
      title="تنظیمات"
      description="ترجیح اعلان و امنیت حساب به‌زودی از همین‌جا مدیریت می‌شود."
    />
  );
}
