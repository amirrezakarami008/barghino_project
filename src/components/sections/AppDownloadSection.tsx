import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaImage } from "@/components/ui/MediaImage";
import { IMAGES, SITE_CONFIG } from "@/lib/constants";

const APP_STORES = [
  { label: "بازار", href: "#" },
  { label: "مایکت", href: "#" },
  { label: "دانلود APK", href: "#" },
  { label: "وب‌اپلیکیشن", href: "#" },
];

export function AppDownloadSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <MediaImage
        src={IMAGES.app}
        alt="اپلیکیشن موبایل"
        overlay="dark"
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-950/95 via-brand-900/85 to-brand-800/80" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-20" />

      <Container className="relative">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-200">
              اپلیکیشن موبایل
            </span>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              اپلیکیشن {SITE_CONFIG.name}
            </h2>
            <p className="mb-6 max-w-lg text-base text-brand-100 sm:text-lg">
              همراه همیشگی شما در تامین برق. تمام خدمات خرید برق، همیشه و همه‌جا در دسترس شما!
            </p>
            <div className="flex flex-wrap gap-2.5">
              {APP_STORES.map((store) => (
                <Button key={store.label} href={store.href} variant="secondary" size="sm">
                  {store.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto lg:mr-auto lg:ml-0">
            <div className="absolute -inset-6 rounded-full bg-brand-400/15 blur-2xl" />
            <div className="relative mx-auto h-[340px] w-[180px] overflow-hidden rounded-[2rem] border-[3px] border-white/20 shadow-2xl shadow-black/50 sm:h-[380px] sm:w-[200px]">
              <MediaImage
                src={IMAGES.hero.dashboard}
                alt="رابط اپلیکیشن برق ما"
                overlay="dark"
                className="absolute inset-0"
                sizes="200px"
              />
              <div className="absolute left-1/2 top-2.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black/50 backdrop-blur-md" />
              <div className="absolute inset-0 z-10 flex flex-col p-4 pt-12">
                <div className="mb-4 rounded-xl bg-brand-500/25 p-3 ring-1 ring-brand-400/30 backdrop-blur-md">
                  <p className="text-[10px] font-medium text-brand-200">مصرف امروز</p>
                  <p className="font-display text-xl font-extrabold text-white">۴۲ kWh</p>
                </div>
                <div className="flex-1 space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                      <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-white/25" />
                      <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
