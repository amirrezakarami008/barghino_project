import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "پشتیبانی" };

export default function PanelSupportPage() {
  return (
    <WorkspacePage
      icon="headset"
      title="تیکتی باز نیست"
      lede="موضوع فروش، نصب، پرداخت یا قرارداد را بعد از اتصال صندوق پشتیبانی ثبت می‌کنید. تا آن زمان از صفحه تماس استفاده کنید."
      action={{ href: "/contact", label: "تماس" }}
    />
  );
}
