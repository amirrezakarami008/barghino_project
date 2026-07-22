import { Container } from "@/shared/ui/Container";
import { StatCard } from "@/shared/ui/IconBox";
import { MediaImage } from "@/shared/ui/MediaImage";
import { IMAGES, STATS, TRUSTED_CLIENTS } from "@/features/marketing/constants";

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-14 lg:py-18">
      <MediaImage
        src={IMAGES.stats}
        alt="پنل‌های خورشیدی و انرژی پاک"
        overlay="dark"
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface-950/90 via-brand-950/80 to-surface-950/70" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />

      <Container className="relative">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-300">
            مشتریان برق ما
          </span>
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            مورد اعتماد بیش از ۱۵۰۰ مجموعه در سراسر کشور
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            شرکت‌ها و مجموعه‌های صنعتی، تجاری و خدماتی از برق ما برای تصمیم‌گیری سریع‌تر،
            کاهش هزینه و مدیریت هوشمند مصرف انرژی استفاده می‌کنند.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10 sm:gap-2.5">
          {TRUSTED_CLIENTS.map((client) => (
            <div
              key={client}
              className="rounded-xl border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-semibold text-white/75 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-white/10 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {client}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/30 hover:bg-white/10"
            >
              <StatCard value={stat.value} suffix={stat.suffix} label={stat.label} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
