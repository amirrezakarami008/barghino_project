import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "تنظیمات" };

const prefs = ["فاکتور و تسویه", "تولید و هشدار", "قرارداد", "پیشنهادها"];

export default function SettingsPage() {
  return (
    <WorkspacePage icon="settings" title="تنظیمات" lede="کلیدهای اعلان تا وقتی حساب وصل شود ذخیره نمی‌شوند. پیش‌فرض محصول: سه مورد اول روشن، پیشنهادها خاموش.">
      <ul className="grid gap-3">
        {prefs.map((pref, index) => (
          <li key={pref} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-sm">
            <span>{pref}</span>
            <span className="text-muted-foreground">{index === 3 ? "خاموش" : "روشن"}</span>
          </li>
        ))}
      </ul>
    </WorkspacePage>
  );
}
