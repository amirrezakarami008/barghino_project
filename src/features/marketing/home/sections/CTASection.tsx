import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";

export function CTASection() {
  return (
    <section className="py-8 sm:py-10 lg:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] px-5 py-12 text-center sm:px-8 sm:py-14 lg:px-12">
          <MediaImage
            src={IMAGES.cta}
            alt="انرژی خورشیدی خانگی"
            overlay="dark"
            className="absolute inset-0"
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-950/85 via-surface-950/75 to-surface-950/65" />
          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="mb-4 font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              آماده‌ای درآمد نیروگاه خانگی‌ات را شروع کنی؟
            </h2>
            <p className="mb-8 text-base leading-8 text-slate-300 sm:text-lg">
              یا برق تولیدی‌ات را بفروش، یا درخواست نصب بده — برقینو مسیر را ساده کرده.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={SITE_CONFIG.cta.sellPowerHref} size="lg" variant="accent" className="glow-accent">
                {SITE_CONFIG.cta.sellPower}
              </Button>
              <Button href={SITE_CONFIG.cta.requestInstallHref} variant="secondary" size="lg">
                {SITE_CONFIG.cta.requestInstall}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
