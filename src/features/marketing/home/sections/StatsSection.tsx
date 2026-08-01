import { Container } from "@/shared/ui/Container";
import { StatCard } from "@/shared/ui/IconBox";
import { MediaImage } from "@/shared/ui/MediaImage";
import { IMAGES, STATS } from "@/features/marketing/constants";

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-14 lg:py-16">
      <MediaImage
        src={IMAGES.stats}
        alt="پنل‌های خورشیدی خانگی"
        overlay="dark"
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface-950/90 via-brand-950/80 to-surface-950/70" />

      <Container className="relative">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            اعدادی که تصمیم را ساده می‌کنند
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            قیمت بهتر، پرداخت سریع‌تر، تمرکز کامل روی مشترک خانگی.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <StatCard value={stat.value} suffix={stat.suffix} label={stat.label} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
