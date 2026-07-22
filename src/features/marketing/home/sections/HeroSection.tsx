import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { GlassCard } from "@/shared/ui/Card";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";
import { Clock, Shield, Star, TrendingDown, Zap } from "@/shared/lib/icons";

export function HeroSection() {
  const trustSignals = [
    "قراردادهای شفاف و قابل پیگیری",
    "پاسخ‌گویی سریع تیم مشاوره",
    "داشبورد یکپارچه برای مدیریت مصرف",
  ];

  const highlights = [
    { label: "کاهش هزینه", value: "تا ۶۰٪", icon: TrendingDown },
    { label: "شروع همکاری", value: "کمتر از ۳ دقیقه", icon: Clock },
    { label: "پایداری تامین", value: "پشتیبانی تخصصی", icon: Shield },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-950 pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
      <MediaImage
        src={IMAGES.hero.main}
        alt="شبکه انتقال برق و انرژی"
        overlay="gradient-rtl"
        priority
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-mesh-dark bg-grid-dark" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/55 to-transparent" />
      <div className="pointer-events-none absolute -left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[320px] w-[320px] rounded-full bg-accent-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-slate-950/80" />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <div className="mb-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3.5 py-1.5 text-xs text-brand-200 backdrop-blur-md sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              اولین سامانه آنلاین خرید برق در ایران
            </div>

            <h1 className="max-w-2xl font-display text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
              تجربه‌ای مدرن برای
              <span className="mt-2 block text-gradient">تامین برق هوشمند و پایدار</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {SITE_CONFIG.name} با ترکیب مشاوره تخصصی، قراردادهای شفاف و داشبورد مدیریتی،
              فرآیند تامین برق را از یک کار پیچیده به یک تجربه سریع، قابل‌اعتماد و کاملا
              قابل‌فهم تبدیل می‌کند.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={SITE_CONFIG.registerHref} size="lg" className="group glow-brand">
                شروع درخواست رایگان
                <LinkArrow />
              </Button>
              <Button href="/services" variant="secondary" size="lg">
                مشاهده خدمات
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-xs text-slate-200 backdrop-blur-md sm:text-sm"
                >
                  <Star className="h-3.5 w-3.5 text-accent-400" />
                  {signal}
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {highlights.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/30 hover:bg-white/10 sm:p-4.5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-white/10">
                    <stat.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <p className="font-display text-lg font-extrabold text-white sm:text-[1.35rem]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-400 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:mr-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-accent-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/40 shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <MediaImage
                src={IMAGES.hero.dashboard}
                alt="داشبورد مدیریت مصرف برق"
                overlay="gradient"
                className="aspect-[4/3] lg:aspect-auto lg:h-[420px]"
                sizes="(max-width: 1024px) 100vw, 520px"
              />

              <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 backdrop-blur-xl">
                <div>
                  <p className="text-[11px] text-slate-400 sm:text-xs">پنل مدیریت انرژی</p>
                  <p className="mt-1 font-display text-sm font-bold text-white sm:text-base">
                    رصد لحظه‌ای مصرف و قرارداد
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-white/10">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <GlassCard className="absolute inset-x-3 bottom-3 border-white/15 p-4 sm:inset-x-4 sm:bottom-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-400">مصرف ماهانه</p>
                    <p className="font-display text-xl font-extrabold text-white sm:text-2xl">
                      ۱۲,۴۵۰{" "}
                      <span className="text-sm font-semibold text-brand-300">kWh</span>
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20 sm:text-sm">
                    <TrendingDown className="h-3.5 w-3.5" />
                    ۳۲٪ صرفه‌جویی
                  </div>
                </div>
                <div className="mb-3 flex h-16 items-end gap-1 sm:h-20 sm:gap-1.5">
                  {[40, 65, 45, 80, 55, 70, 35, 60, 50, 75, 42, 68].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-700 via-brand-500 to-brand-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 p-2.5 ring-1 ring-white/10">
                    <p className="text-[10px] text-slate-500 sm:text-xs">هزینه فعلی</p>
                    <p className="font-display text-sm font-bold text-white sm:text-base">
                      ۴۲.۸M <span className="text-[10px] font-normal text-slate-400 sm:text-xs">تومان</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 ring-1 ring-emerald-500/20">
                    <p className="text-[10px] text-slate-500 sm:text-xs">پیش‌بینی ماه بعد</p>
                    <p className="font-display text-sm font-bold text-emerald-400 sm:text-base">
                      ۲۹.۱M <span className="text-[10px] font-normal text-slate-400 sm:text-xs">تومان</span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden animate-float rounded-2xl border border-white/15 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl lg:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-xs font-bold text-white">قرارداد فعال</p>
                  <p className="text-[10px] text-slate-500">تامین ۱۲ ماهه برق</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-20 hidden rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl xl:block">
              <p className="text-[11px] text-slate-400">رضایت مشتریان</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-display text-xl font-extrabold text-white">۹۸٪</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <TrendingDown className="h-3 w-3" />
                  هزینه کمتر
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
