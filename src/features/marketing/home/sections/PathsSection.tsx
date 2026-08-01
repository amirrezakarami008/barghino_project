import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SITE_CONFIG } from "@/config";
import { Sun, Zap } from "@/shared/lib/icons";

const PATHS = [
  {
    id: "sell",
    icon: Zap,
    badge: "مسیر A",
    title: "نیروگاه خورشیدی دارم",
    description:
      "برق تولیدی‌ات را با نرخ بورس سبز به برقینو بفروش؛ پرداخت تضمینی حداکثر ۲ ماه.",
    points: ["ثبت‌نام سریع", "عقد قرارداد فروش", "دریافت درآمد ماهانه"],
    cta: SITE_CONFIG.cta.sellPower,
    href: SITE_CONFIG.cta.sellPowerHref,
    accent: "from-emerald-500 to-teal-500",
    ring: "hover:border-brand-300 hover:shadow-brand-500/10",
  },
  {
    id: "install",
    icon: Sun,
    badge: "مسیر B",
    title: "هنوز نیروگاه ندارم",
    description:
      "درخواست نصب بده؛ برقینو نیروگاه را روی پشت‌بام‌ات احداث می‌کند و بعد وارد مسیر فروش می‌شوی.",
    points: ["بازدید کارشناس", "نصب و اتصال به شبکه", "شروع فروش برق"],
    cta: SITE_CONFIG.cta.requestInstall,
    href: SITE_CONFIG.cta.requestInstallHref,
    accent: "from-amber-500 to-orange-500",
    ring: "hover:border-amber-300 hover:shadow-amber-500/10",
  },
] as const;

export function PathsSection() {
  return (
    <Section id="paths" background="gradient" compact>
      <Container>
        <SectionHeader
          badge="دو مسیر ساده"
          title="از کجا شروع می‌کنی؟"
          description="هر دو مسیر به یک مقصد می‌رسند: درآمد از برق خانگی."
          compact
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {PATHS.map((path) => (
            <div
              key={path.id}
              className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:p-8 ${path.ring}`}
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${path.accent} text-white shadow-lg`}
              >
                <path.icon className="h-6 w-6" />
              </div>

              <span className="mb-2 inline-block text-xs font-semibold text-slate-400">
                {path.badge}
              </span>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">{path.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{path.description}</p>

              <ul className="mt-5 space-y-2.5">
                {path.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <Button href={path.href} size="lg" className="group">
                  {path.cta}
                  <LinkArrow />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
