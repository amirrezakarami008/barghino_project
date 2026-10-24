import type { Metadata } from "next";
import { InfoShell, PageIntro, StepList } from "@/features/marketing/info";

export const metadata: Metadata = { title: "پشتیبانی" };

export default function SupportPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="پشتیبانی"
        title="برای حساب خودتان، تیکت داخل پنل است"
        lede="موضوع‌های فروش، نصب، پرداخت و قرارداد از پنل پیگیری می‌شوند. اگر هنوز حساب ندارید، از صفحه تماس پیام بگذارید."
        action={{ href: "/panel/support", label: "رفتن به تیکت‌ها" }}
      />
      <StepList
        items={[
          { title: "موضوع را مشخص کنید", text: "فروش، نصب، پرداخت، قرارداد یا مسئله فنی." },
          { title: "یک رشته گفتگو", text: "پاسخ کارشناس روی همان تیکت می‌ماند، نه در چند کانال پراکنده." },
          { title: "وضعیت قابل دیدن", text: "باز، در حال بررسی، حل‌شده یا بسته." },
        ]}
      />
    </InfoShell>
  );
}
