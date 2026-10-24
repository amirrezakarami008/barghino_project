import type { Metadata } from "next";
import { InfoShell, PageIntro } from "@/features/marketing/info";

export const metadata: Metadata = { title: "شرایط استفاده" };

export default function TermsPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="اسناد"
        title="شرایط استفاده"
        lede="این متن پایه است تا صفحه حقوقی خالی نماند. نسخه امضاشده هر کاربر، قرارداد همان حساب است نه این صفحه."
      />
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-8 text-muted-foreground">
        <p>برقینو برای مشترک خانگی است. استفاده صنعتی و تجاری در این نسخه خارج از محصول است.</p>
        <p>اعداد قیمت و زمان روی سایت، نمونه توضیحی‌اند مگر این‌که در قرارداد شما ثبت شده باشند.</p>
        <p>بارگذاری مدرک به معنی رضایت برای استفاده همان فایل در بررسی قرارداد یا نصب است، نه انتشار عمومی.</p>
      </div>
    </InfoShell>
  );
}
