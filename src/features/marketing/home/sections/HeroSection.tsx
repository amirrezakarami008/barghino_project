import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";
import { Building2, TrendingUp, Wrench, Zap } from "@/shared/lib/icons";

export function HeroSection() {
  const { cta, valueProps, name } = SITE_CONFIG;

  return (
    <section className="relative bg-surface-950">
      <div className="relative flex min-h-[70vh] items-center overflow-hidden pb-36 pt-28 sm:min-h-[74vh] sm:pb-40 sm:pt-32 lg:min-h-[78vh] lg:pb-44">
        <MediaImage
          src={IMAGES.hero.main}
          alt="نیروگاه خورشیدی خانگی روی پشت‌بام"
          overlay="none"
          priority
          className="absolute inset-0"
          sizes="100vw"
        />
        {/* Darker on the text side (right in RTL) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-slate-950/92 via-slate-950/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/25" />

        <Container className="relative">
          <div className="max-w-xl animate-fade-up lg:max-w-2xl">
            <p className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {name}
            </p>

            <h1 className="mt-3 font-display text-3xl font-black leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.35rem]">
              <span className="block text-white">برق خانگی‌ات را بفروش،</span>
              <span className="mt-1 block text-lime-400">نداری؟ برات نصب می‌کنیم</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-8 text-white/85 sm:text-base lg:text-lg lg:leading-8">
              برق تولیدی خانگی‌ات را به قیمت بورس سبز بفروش؛ در فصل گرم گران‌تر می‌خریم و در فصل
              سرد هم کف قیمت تضمینی داریم. پرداخت تضمینی حداکثر{" "}
              {valueProps.barghinoPayoutMonths} ماه، شفاف و بدون دردسر.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                href={cta.sellPowerHref}
                size="lg"
                className="rounded-xl shadow-xl shadow-brand-900/25"
                icon={<TrendingUp className="h-4 w-4" />}
                iconPosition="start"
              >
                {cta.sellPower}
              </Button>
              <Button
                href={cta.requestInstallHref}
                variant="secondary"
                size="lg"
                className="rounded-xl border border-white/35 bg-slate-950/35 backdrop-blur-sm hover:bg-slate-950/50"
                icon={<Wrench className="h-4 w-4" />}
                iconPosition="start"
              >
                درخواست نصب نیروگاه
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* VS strip — matches reference card */}
      <div className="relative z-20 -mt-16 px-4 sm:-mt-20 sm:px-6 lg:-mt-24">
        <Container>
          <div className="mx-auto grid max-w-3xl grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/70 sm:grid-cols-[1fr_auto_1fr]">
            {/* دولت — سمت راست در RTL */}
            <div className="flex flex-col items-center justify-center px-6 py-6 text-center sm:px-8 sm:py-7">
              <Building2 className="mb-2.5 h-8 w-8 text-slate-500" strokeWidth={1.5} />
              <p className="font-display text-lg font-extrabold tabular-nums text-slate-700 sm:text-xl">
                {valueProps.governmentPrice}{" "}
                <span className="text-sm font-semibold text-slate-500">{valueProps.priceUnit}</span>
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                تا {valueProps.governmentPayoutMonths} ماه
              </p>
              <p className="mt-0.5 text-xs text-slate-400">پرداخت طولانی</p>
            </div>

            {/* VS */}
            <div className="relative flex items-center justify-center py-2 sm:px-2 sm:py-0">
              <div className="absolute inset-x-10 top-0 h-px bg-slate-100 sm:inset-x-auto sm:inset-y-8 sm:left-1/2 sm:h-auto sm:w-px sm:-translate-x-1/2" />
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 font-display text-sm font-extrabold tracking-wider text-white shadow-lg shadow-brand-500/30 ring-[5px] ring-white">
                VS
              </span>
            </div>

            {/* برقینو — سمت چپ در RTL */}
            <div className="flex flex-col items-center justify-center px-6 py-6 text-center sm:px-8 sm:py-7">
              <div className="mb-2.5 flex flex-col items-center gap-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Zap className="h-5 w-5" fill="currentColor" />
                </div>
                <span className="font-display text-sm font-bold text-brand-700">{name}</span>
              </div>
              <p className="font-display text-lg font-extrabold tabular-nums text-brand-600 sm:text-xl">
                {valueProps.barghinoPrice}{" "}
                <span className="text-sm font-semibold text-brand-500/80">{valueProps.priceUnit}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                حداکثر {valueProps.barghinoPayoutMonths} ماه
              </p>
              <p className="mt-0.5 text-xs font-medium text-brand-600">پرداخت تضمینی</p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
