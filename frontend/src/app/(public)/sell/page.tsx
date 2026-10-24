import type { Metadata } from "next";
import { sampleOffer } from "@/features/marketing/sample";
import { InfoShell, PageIntro, StepList } from "@/features/marketing/info";

export const metadata: Metadata = { title: "فروش برق" };

export default function SellPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="مسیر فروش"
        title="برق نیروگاه خانگی را به برقینو بفروشید"
        lede="اگر پشت‌بام یا ملک شما همین حالا تولید می‌کند، نیروگاه را معرفی می‌کنید، قرارداد رسمی می‌بندید و تسویه را در پنل پیگیری می‌کنید."
        action={{ href: "/register?path=sell", label: "شروع فروش" }}
      />
      <StepList
        items={[
          { title: "ثبت‌نام", text: "حساب خانگی بسازید و مسیر فروش را انتخاب کنید." },
          { title: "معرفی نیروگاه", text: "انشعاب، ظرفیت و تاریخ راه‌اندازی را ثبت کنید." },
          { title: "قرارداد و تسویه", text: `نرخ نمونه ${sampleOffer.barghinoPrice} تومان/kWh و تسویه ${sampleOffer.barghinoWait}.` },
        ]}
      />
      <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">{sampleOffer.disclaimer}</p>
    </InfoShell>
  );
}
