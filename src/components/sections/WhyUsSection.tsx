import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/IconBox";
import { MediaImage } from "@/components/ui/MediaImage";
import { Section, SectionHeader } from "@/components/ui/Section";
import { FEATURES, IMAGES } from "@/lib/constants";

export function WhyUsSection() {
  const quickPoints = [
    "تحلیل نیاز مصرفی و انتخاب بهترین مدل تامین برق",
    "قراردادهای شفاف با مسیر اجرا و هزینه قابل پیش‌بینی",
    "همراهی تیم تخصصی از مشاوره تا بهره‌برداری",
  ];

  return (
    <Section id="why-us" background="gradient" compact>
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-400/15 via-brand-200/10 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-brand-500/10 ring-1 ring-slate-200/80">
              <MediaImage
                src={IMAGES.whyUs}
                alt="نیروگاه و تولید برق"
                className="aspect-[4/3] sm:aspect-[1.15/1]"
                overlay="gradient"
                sizes="(max-width: 1024px) 100vw, 520px"
                imageClassName="group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/88 p-4 shadow-xl backdrop-blur-xl sm:left-6 sm:right-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="font-display text-2xl font-extrabold text-brand-600">+۱۵۰۰</p>
                  <p className="text-xs font-medium text-slate-600">مشتری فعال</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-slate-900">۹۸٪</p>
                  <p className="text-xs font-medium text-slate-600">رضایت از همکاری</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-slate-900">۳ دقیقه</p>
                  <p className="text-xs font-medium text-slate-600">تا شروع فرایند</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 -top-2 rounded-full border border-brand-200 bg-white/90 px-3.5 py-2 shadow-lg backdrop-blur">
              <p className="font-display text-xs font-bold text-brand-700">تصمیم‌گیری سریع‌تر و مطمئن‌تر</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeader
              badge="چرا برق ما"
              title="یک تجربه ساده‌تر، شفاف‌تر و مدرن‌تر برای تامین برق"
              description="برق ما فقط یک سرویس تامین برق نیست؛ یک تجربه کامل برای تصمیم‌گیری، مدیریت هزینه و اجرای سریع‌تر است."
              align="start"
              compact
            />
            <div className="mb-5 space-y-3">
              {quickPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm backdrop-blur-sm"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <p>{point}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.id} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
