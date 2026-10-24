import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "پرداخت‌ها" };

export default function PaymentsPage() {
  return (
    <WorkspacePage
      icon="coins"
      title="تسویه‌ای ثبت نشده"
      lede="واریز به شبا یا کیف پول، وضعیت و رسید بعد از صورت‌حساب پرداخت‌نشده اینجا می‌آید. موجودی ساختگی نشان داده نمی‌شود."
    />
  );
}
