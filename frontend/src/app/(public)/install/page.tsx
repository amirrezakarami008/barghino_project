import type { Metadata } from "next";
import { InfoShell, PageIntro, StepList } from "@/features/marketing/info";
import { faDigits } from "@/shared/lib/fa";

export const metadata: Metadata = { title: "نصب نیروگاه" };

const stages = ["ثبت درخواست", "بررسی", "بازدید", "پیشنهاد", "قرارداد", "نصب", "بهره‌برداری"];

export default function InstallPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="مسیر نصب"
        title="نیروگاه ندارید؟ از همین‌جا درخواست بدهید"
        lede="برقینو مسیر احداث خانگی را جلو می‌برد. بعد از بهره‌برداری، همان نیروگاه وارد فروش برق می‌شود."
        action={{ href: "/register?path=install", label: "درخواست نصب" }}
      />
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <li key={stage} className="rounded-2xl border border-border bg-card px-4 py-4 text-sm">
            <span className="font-bold text-emerald">{faDigits(index + 1)}</span>
            <span className="ms-2 font-semibold">{stage}</span>
          </li>
        ))}
      </ol>
      <StepList
        items={[
          { title: "آدرس و پشت‌بام", text: "محل نصب، متراژ و در صورت نیاز عکس یا ویدیو." },
          { title: "پیشنهاد", text: "ظرفیت و برآورد هزینه بعد از بررسی، نه قبل از دیدن بام." },
          { title: "فروش برق", text: "وقتی نیروگاه فعال شد، قرارداد فروش جداگانه بسته می‌شود." },
        ]}
      />
    </InfoShell>
  );
}
