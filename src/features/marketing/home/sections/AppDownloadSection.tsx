import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";

const APP_STORES = [
  { label: "بازار", href: "#" },
  { label: "مایکت", href: "#" },
  { label: "وب‌اپلیکیشن", href: SITE_CONFIG.dashboardHref },
];

export function AppDownloadSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <MediaImage
        src={IMAGES.app}
        alt="پایش نیروگاه خانگی"
        overlay="dark"
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-950/95 via-brand-900/85 to-brand-800/80" />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-200">
            پنل و اپلیکیشن
          </span>
          <h2 className="mb-3 font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            تولید و درآمد نیروگاه‌ات را ببین
          </h2>
          <p className="mb-6 text-base text-brand-100 sm:text-lg">
            وضعیت نیروگاه، صورت‌حساب فروش و پرداخت‌های برقینو — همیشه در دسترس.
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-2.5">
            {APP_STORES.map((store) => (
              <Button key={store.label} href={store.href} variant="secondary" size="sm">
                {store.label}
              </Button>
            ))}
          </div>
          <Button href={SITE_CONFIG.dashboardHref} size="lg" className="group glow-brand">
            ورود به پنل
            <LinkArrow />
          </Button>
        </div>
      </Container>
    </section>
  );
}
