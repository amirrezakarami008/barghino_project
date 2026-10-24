import type { Metadata } from "next";
import { FaqList } from "@/features/marketing/faq-list";
import { InfoShell, PageIntro } from "@/features/marketing/info";

export const metadata: Metadata = { title: "پرسش‌ها" };

export default function FaqPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="پرسش‌های رایج"
        title="قیمت، زمان پرداخت، و این‌که برقینو برای کیست"
        lede="جواب‌ها همان وعده‌های قفل‌شده محصول‌اند. جایی که عدد آمده، نمونه است نه نرخ لحظه‌ای."
      />
      <FaqList />
    </InfoShell>
  );
}
