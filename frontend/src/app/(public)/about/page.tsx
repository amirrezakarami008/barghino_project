import type { Metadata } from "next";
import { InfoShell, PageIntro } from "@/features/marketing/info";

export const metadata: Metadata = { title: "درباره ما" };

export default function AboutPage() {
  return (
    <InfoShell>
      <PageIntro
        eyebrow="درباره برقینو"
        title="جایی برای فروش برق خانگی، و ساخت نیروگاه اگر هنوز ندارید"
        lede="برقینو برای مشترک خانگی ساخته شده. لحن محصول ساده است و وعده‌ها باید قابل اندازه‌گیری باشند: قیمت، زمان، قرارداد."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["قیمت منصفانه‌تر", "خرید بر اساس بورس سبز، نه فقط تعرفه پایه دولتی."],
          ["قرارداد رسمی", "تسویه سریع‌تر از مسیر طولانی دولتی، حداکثر دو ماه."],
          ["مسیر نصب", "از درخواست تا بهره‌برداری برای کسی که هنوز تولیدکننده نیست."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-panel border border-border bg-card p-5">
            <h2 className="font-semibold text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </InfoShell>
  );
}
