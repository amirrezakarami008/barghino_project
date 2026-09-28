import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { Sun, Zap } from "@/shared/lib/icons";

const PATHS = [
  {
    id: "sell",
    icon: Zap,
    title: "نیروگاه خورشیدی دارم",
    description:
      "برق تولیدی‌ات را با منطق فصلی به برقینو بفروش؛ فصل گرم قیمت بالاتر، فصل سرد کف قیمت قراردادی، پرداخت حداکثر ۲ ماه.",
    cta: SITE_CONFIG.cta.sellPower,
    href: SITE_CONFIG.cta.sellPowerHref,
    theme: {
      card: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 hover:border-amber-300",
      icon: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30",
      button: "accent" as const,
    },
  },
  {
    id: "install",
    icon: Sun,
    title: "هنوز نیروگاه ندارم",
    description:
      "درخواست نصب بده؛ برقینو نیروگاه را احداث می‌کند و بعد وارد مسیر فروش می‌شوی.",
    cta: SITE_CONFIG.cta.requestInstall,
    href: SITE_CONFIG.cta.requestInstallHref,
    theme: {
      card: "border-brand-200/80 bg-gradient-to-br from-brand-50 via-white to-emerald-50/40 hover:border-brand-300",
      icon: "bg-gradient-to-br from-brand-500 to-teal-500 shadow-brand-500/30",
      button: "primary" as const,
    },
  },
] as const;

export function PathsSection() {
  return (
    <section id="paths" className="bg-slate-50/80 py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            از کجا شروع می‌کنی؟
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            هر دو مسیر به یک مقصد می‌رسند: درآمد از برق خانگی.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2 lg:gap-6">
          {PATHS.map((path) => (
            <div
              key={path.id}
              className={`group flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${path.theme.card}`}
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${path.theme.icon}`}
              >
                <path.icon className="h-7 w-7" />
              </div>

              <h3 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
                {path.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 sm:text-base">
                {path.description}
              </p>

              <div className="mt-7">
                <Button href={path.href} variant={path.theme.button} size="lg" className="group">
                  {path.cta}
                  <LinkArrow />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
