import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "اعلان‌ها" };

export default function NotificationsPage() {
  return (
    <WorkspacePage icon="bell" title="اعلانی نیست" lede="صورت‌حساب، قرارداد و تغییر مرحله نصب بعداً همین‌جا و در نشان کنار منو دیده می‌شوند." />
  );
}
