import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";

export function HeroSection() {
  const { cta } = SITE_CONFIG;

  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-surface-950 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:min-h-[92vh] lg:pb-24">
      <MediaImage
        src={IMAGES.hero.main}
        alt="نیروگاه خورشیدی خانگی روی پشت‌بام"
        overlay="gradient-rtl"
        priority
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/55 to-surface-950/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent-500/15 blur-[100px]" />

      <Container className="relative">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-4 font-display text-sm font-semibold tracking-wide text-brand-300 sm:text-base">
            {SITE_CONFIG.name}
          </p>

          <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem]">
            {SITE_CONFIG.name}
            <span className="mt-2 block text-gradient">
              برق خانگی‌ات را بفروش؛ نداری؟ برات نصب می‌کنیم
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            {SITE_CONFIG.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={cta.sellPowerHref} size="lg" className="group glow-brand">
              {cta.sellPower}
              <LinkArrow />
            </Button>
            <Button href={cta.requestInstallHref} variant="secondary" size="lg">
              {cta.requestInstall}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
