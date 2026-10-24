import type { Metadata } from "next";
import { InfoShell, PageIntro } from "@/features/marketing/info";

export const metadata: Metadata = { title: "حریم خصوصی" };

export default function PrivacyPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="اسناد"
        title="حریم خصوصی"
        lede="حساب، مدارک و اطلاعات نیروگاه فقط برای همان مالک و کارشناس مجاز برقینو است."
      />
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-8 text-muted-foreground">
        <p>موبایل برای ورود با کد یک‌بارمصرف استفاده می‌شود. رمز یا کد را برقینو در صفحه عمومی نشان نمی‌دهد.</p>
        <p>فایل کارت ملی، امضا و تصویر پشت‌بام خصوصی است و لینک عمومی نمی‌گیرد.</p>
        <p>اعداد نمونه بازاریابی به حساب هیچ کاربری وصل نیستند.</p>
      </div>
    </InfoShell>
  );
}
