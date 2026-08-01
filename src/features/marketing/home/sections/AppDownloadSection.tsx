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
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-600 py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-emerald-900/20 blur-3xl" />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 text-center lg:order-1 lg:text-start">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-sm font-semibold text-white/90 backdrop-blur-sm">
              پنل و اپلیکیشن
            </span>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              تولید و درآمد نیروگاه‌ات را ببین
            </h2>
            <p className="mb-7 text-base leading-8 text-brand-50/90 sm:text-lg">
              وضعیت نیروگاه، صورت‌حساب فروش و پرداخت‌های برقینو — همیشه در دسترس.
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              {APP_STORES.map((store) => (
                <a
                  key={store.label}
                  href={store.href}
                  className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {store.label}
                </a>
              ))}
            </div>

            <Button
              href={SITE_CONFIG.dashboardHref}
              size="lg"
              className="group border-0 bg-white text-brand-700 shadow-xl shadow-brand-900/20 hover:bg-brand-50 hover:brightness-100"
            >
              ورود به پنل
              <LinkArrow />
            </Button>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-[220px] sm:w-[260px]">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-white/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl shadow-brand-950/40">
                <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
                  <div className="h-4 w-20 rounded-full bg-slate-800" />
                </div>
                <MediaImage
                  src={IMAGES.app}
                  alt="اپلیکیشن برقینو"
                  className="aspect-[9/17]"
                  overlay="none"
                  sizes="260px"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
