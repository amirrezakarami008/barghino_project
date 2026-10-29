import type { Metadata } from "next";
import { InfoShell, PageIntro, StepList } from "@/features/marketing/info";

export const metadata: Metadata = { title: "پشتیبانی" };

export default function SupportPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="پشتیبانی"
        title="برای پیگیری درخواست، با برقینو در تماس باشید"
        lede="برای پرسش‌های فروش، نصب یا قرارداد، اطلاعات تماس برقینو را ببینید. بخش تیکت پنل هنوز فعال نشده است."
        action={{ href: "/contact", label: "تماس با برقینو" }}
      />
      <StepList
        items={[
          { title: "موضوع را مشخص کنید", text: "فروش، نصب، پرداخت، قرارداد یا مسئله فنی." },
          { title: "شناسهٔ درخواست", text: "اگر قرارداد یا نیروگاهی ثبت کرده‌اید، شناسهٔ آن را برای پیگیری آماده کنید." },
          { title: "پیگیری وضعیت", text: "نتیجهٔ بررسی قرارداد و نیروگاه را در بخش‌های فعال پنل ببینید." },
        ]}
      />
    </InfoShell>
  );
}
