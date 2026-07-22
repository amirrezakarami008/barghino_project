import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";

export function CTASection() {
  const benefits = [
    "شروع سریع فرایند ثبت‌نام",
    "مشاوره تخصصی پیش از عقد قرارداد",
    "انتخاب مسیر بهینه متناسب با مصرف شما",
  ];

  return (
    <section className="py-8 sm:py-10 lg:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] px-5 py-10 text-center sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <MediaImage
            src={IMAGES.cta}
            alt="انرژی و برق"
            overlay="dark"
            className="absolute inset-0"
            sizes="(max-width: 1280px) 100vw, 1200px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-950/80 via-surface-950/70 to-surface-950/60" />
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-20" />

          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />

          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-300">
              همین الان شروع کنید
            </span>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              برای یک تجربه حرفه‌ای‌تر در تامین برق آماده‌اید؟
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              همین الان ثبت‌نام کنید تا مسیر مناسب تامین برق، کاهش هزینه و مدیریت مصرف شما
              با کمک تیم برق ما در کوتاه‌ترین زمان مشخص شود.
            </p>
            <div className="mx-auto mb-6 grid max-w-3xl gap-3 text-right sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 backdrop-blur-md"
                >
                  {benefit}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={SITE_CONFIG.registerHref} size="lg" variant="accent" className="glow-accent">
                ثبت‌نام رایگان
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                تماس با مشاور
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
