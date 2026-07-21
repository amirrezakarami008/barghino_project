import { Button, LinkArrow } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Accordion, QuoteCard } from "@/components/ui/Interactive";
import { FeatureCard, IconBox, StepCard } from "@/components/ui/IconBox";
import { ImageCard, MediaImage } from "@/components/ui/MediaImage";
import { Section, SectionHeader, SectionHeaderDark } from "@/components/ui/Section";
import { SERVICES, getServiceImage } from "@/lib/constants";
import type { ServiceBulletItem, ServiceCustomSection, ServiceDetail, ServiceMetric } from "@/types";
import { ArrowLeft, Shield, Star, TrendingDown, Zap } from "@/lib/icons";
import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";

interface ServiceDetailTemplateProps {
  service: ServiceDetail;
}

export function ServiceDetailTemplate({ service }: ServiceDetailTemplateProps) {
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);
  const image = getServiceImage(service.slug);

  return (
    <>
      <ServiceHero service={service} image={image} />

      {service.customSections?.slice(0, 2).map((section) => (
        <CustomSectionRenderer key={section.id} section={section} />
      ))}

      <Section background={service.variant === "resilience" ? "dark" : "default"}>
        <Container>
          {service.variant === "resilience" ? (
            <SectionHeaderDark
              badge="مزایا"
              title="چرا این سرویس؟"
              description="مزیت‌های این خدمت برای مجموعه‌هایی طراحی شده که تصمیم انرژی آن‌ها باید همزمان اجرایی، اقتصادی و قابل اتکا باشد."
              align="center"
            />
          ) : (
            <SectionHeader
              badge="مزایا"
              title="چرا این سرویس؟"
              description="ساختار این صفحه برای آن طراحی شده که تفاوت این خدمت فقط در متن نباشد، بلکه در نوع ارزشی که منتقل می‌کند نیز مشخص باشد."
              align="center"
            />
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map((benefit) => (
              <FeatureCard key={benefit.id} {...benefit} />
            ))}
          </div>
        </Container>
      </Section>

      {service.customSections?.slice(2).map((section) => (
        <CustomSectionRenderer key={section.id} section={section} />
      ))}

      <Section background="muted">
        <Container>
          <SectionHeader
            badge="فرایند"
            title={getProcessTitle(service.variant)}
            description={getProcessDescription(service.variant)}
            align="center"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <StepCard
                key={step.id}
                {...step}
                isLast={index === service.process.length - 1}
              />
            ))}
          </div>
        </Container>
      </Section>

      {service.faq.length > 0 && (
        <Section>
          <Container size="narrow">
            <SectionHeader
              badge="FAQ"
              title="سوالات متداول"
              description="رایج‌ترین سوالاتی که پیش از شروع همکاری درباره این خدمت مطرح می‌شود."
              align="center"
            />
            <Accordion items={service.faq} />
          </Container>
        </Section>
      )}

      <Section background="muted">
        <Container>
          <SectionHeader
            badge="سایر خدمات"
            title="خدمات مرتبط"
            description="اگر به این سرویس علاقه‌مند هستید، احتمالا این راهکارها هم برای شما کاربردی خواهند بود."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {otherServices.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <ImageCard
                  src={getServiceImage(s.slug)}
                  alt={s.title}
                  height="h-36"
                  overlay="gradient"
                >
                  <div className="absolute bottom-4 right-4">
                    <IconBox icon={s.icon} variant="gradient" gradient={s.gradient} size="sm" />
                  </div>
                </ImageCard>
                <div className="p-5">
                  <h3 className="mb-2 font-display font-bold text-slate-900 group-hover:text-brand-600">
                    {s.title}
                  </h3>
                  <p className="mb-4 text-sm leading-7 text-slate-600">{s.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    مشاهده صفحه
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <ContextualCta service={service} />
    </>
  );
}

function ServiceHero({ service, image }: { service: ServiceDetail; image: string }) {
  const heroLayout =
    service.variant === "advisory"
      ? "lg:grid-cols-[1.1fr_0.9fr]"
      : service.variant === "optimization"
        ? "lg:grid-cols-[0.95fr_1.05fr]"
        : "lg:grid-cols-[1.05fr_0.95fr]";

  return (
    <section className="relative overflow-hidden bg-surface-950 py-10 sm:py-14 lg:py-20">
      <MediaImage src={image} alt={service.title} overlay="gradient-rtl" priority className="absolute inset-0" sizes="100vw" />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/70" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-[110px]" />

      <Container className="relative">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "خدمات", href: "/services" },
            { label: service.title },
          ]}
        />

        <div className={`grid items-center gap-10 lg:gap-12 ${heroLayout}`}>
          <div>
            {service.heroLabel && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {service.heroLabel}
              </span>
            )}

            <div className="mb-5 flex items-center gap-4">
              <IconBox
                icon={service.icon}
                variant="gradient"
                gradient={service.gradient}
                size="lg"
                className="shadow-2xl"
              />
              <div className="hidden rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-md sm:block">
                <p className="text-[11px] text-slate-400">موقعیت این خدمت</p>
                <p className="mt-1 font-display text-sm font-bold text-white">{getVariantLabel(service.variant)}</p>
              </div>
            </div>

            <h1 className="max-w-3xl font-display text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.6rem]">
              {service.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-200 sm:text-xl">{service.subtitle}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{service.overview}</p>

            {service.highlightPoints && service.highlightPoints.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.highlightPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm leading-7 text-slate-200 backdrop-blur-md"
                  >
                    {point}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/register" size="lg" className="group glow-brand">
                شروع همکاری
                <LinkArrow />
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                تماس با مشاور
              </Button>
            </div>

            {service.trustPoints && service.trustPoints.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {service.trustPoints.map((point) => (
                  <span
                    key={point}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-xs text-slate-200 backdrop-blur-md sm:text-sm"
                  >
                    <Star className="h-3.5 w-3.5 text-accent-400" />
                    {point}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/50 shadow-2xl shadow-black/50">
              <MediaImage
                src={image}
                alt={service.title}
                className={`${
                  service.variant === "advisory" ? "aspect-[5/4]" : "aspect-[4/3]"
                }`}
                overlay="gradient"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 backdrop-blur-xl">
                <p className="text-[11px] text-slate-400">ارزش کلیدی این خدمت</p>
                <p className="mt-1 font-display text-sm font-bold text-white">{getHeroPanelTitle(service.variant)}</p>
              </div>

              <div className="border-t border-white/10 bg-slate-950/92 p-4 backdrop-blur-xl sm:p-5">
                {service.heroStats && service.heroStats.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {service.heroStats.map((item) => (
                      <HeroStatCard key={item.id} item={item} variant={service.variant} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {service.benefits.slice(0, 2).map((benefit) => (
                      <div key={benefit.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-display text-base font-bold text-white">{benefit.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl xl:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                  {service.variant === "optimization" ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : service.variant === "renewable" ? (
                    <Zap className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-white">{getFloatingCardTitle(service.variant)}</p>
                  <p className="text-xs text-slate-400">{getFloatingCardDescription(service.variant)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroStatCard({ item, variant }: { item: ServiceMetric; variant: ServiceDetail["variant"] }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        variant === "resilience"
          ? "border-emerald-400/20 bg-emerald-500/8"
          : variant === "advisory"
            ? "border-amber-400/20 bg-amber-500/8"
            : "border-white/10 bg-white/6"
      }`}
    >
      <p className="font-display text-xl font-extrabold text-white">
        {item.value}
        {item.suffix && <span className="mr-1 text-sm font-bold text-brand-200">{item.suffix}</span>}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-200">{item.label}</p>
      {item.note && <p className="mt-1 text-xs leading-6 text-slate-400">{item.note}</p>}
    </div>
  );
}

function CustomSectionRenderer({ section }: { section: ServiceCustomSection }) {
  switch (section.type) {
    case "metrics":
      return (
        <Section background={section.tone === "dark" ? "dark" : section.tone === "gradient" ? "gradient" : "default"}>
          <Container>
            {section.tone === "dark" ? (
              <SectionHeaderDark
                badge={section.badge}
                title={section.title}
                description={section.description}
                align="center"
              />
            ) : (
              <SectionHeader
                badge={section.badge}
                title={section.title}
                description={section.description}
                align="center"
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <MetricCard key={item.id} item={item} tone={section.tone} />
              ))}
            </div>
          </Container>
        </Section>
      );
    case "feature-grid":
      return (
        <Section background={section.background ?? "default"}>
          <Container>
            <SectionHeader
              badge={section.badge}
              title={section.title}
              description={section.description}
              align="center"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((item) => (
                <FeatureCard key={item.id} {...item} />
              ))}
            </div>
          </Container>
        </Section>
      );
    case "bullet-columns":
      return (
        <Section background={section.background ?? "default"}>
          <Container>
            <SectionHeader
              badge={section.badge}
              title={section.title}
              description={section.description}
              align="center"
            />
            <div className={`grid gap-4 ${section.columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
              {section.items.map((item) => (
                <BulletCard key={item.id} item={item} />
              ))}
            </div>
          </Container>
        </Section>
      );
    case "spotlight":
      return (
        <Section background={section.background ?? "gradient"}>
          <Container>
            <div className="grid gap-8 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-sm font-semibold text-brand-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {section.badge}
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{section.description}</p>
              </div>
              <div className="space-y-3">
                {section.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 text-sm leading-7 text-slate-700 shadow-sm"
                  >
                    {point}
                  </div>
                ))}
                {section.highlight && (
                  <div className="rounded-2xl bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-200">
                    {section.highlight}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>
      );
    case "quote":
      return (
        <Section background={section.background ?? "muted"}>
          <Container size="narrow">
            <SectionHeader
              badge={section.badge}
              title={section.title}
              description={section.description}
              align="center"
            />
            <QuoteCard
              content={section.quote.content}
              name={section.quote.company ? `${section.quote.name} - ${section.quote.company}` : section.quote.name}
              role={section.quote.role}
              rating={section.quote.rating ?? 5}
            />
          </Container>
        </Section>
      );
    default:
      return null;
  }
}

function MetricCard({ item, tone }: { item: ServiceMetric; tone?: "dark" | "light" | "gradient" }) {
  const classes =
    tone === "dark"
      ? "border-white/10 bg-white/6 text-white"
      : tone === "gradient"
        ? "border-brand-100 bg-white shadow-lg shadow-brand-500/8"
        : "border-slate-200/70 bg-white";

  return (
    <div className={`rounded-[1.5rem] border p-5 transition-all duration-300 hover:-translate-y-1 ${classes}`}>
      <p className={`font-display text-3xl font-extrabold ${tone === "dark" ? "text-white" : "text-slate-900"}`}>
        {item.value}
        {item.suffix && (
          <span className={`mr-1 text-base font-bold ${tone === "dark" ? "text-brand-200" : "text-brand-600"}`}>
            {item.suffix}
          </span>
        )}
      </p>
      <p className={`mt-2 text-sm font-semibold ${tone === "dark" ? "text-slate-200" : "text-slate-800"}`}>
        {item.label}
      </p>
      {item.note && (
        <p className={`mt-2 text-sm leading-7 ${tone === "dark" ? "text-slate-400" : "text-slate-600"}`}>{item.note}</p>
      )}
    </div>
  );
}

function BulletCard({ item }: { item: ServiceBulletItem }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/8">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        {item.icon ? <IconBox icon={item.icon} size="sm" variant="soft" className="h-11 w-11 rounded-2xl" /> : <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900">{item.title}</h3>
      {item.description && <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>}
    </div>
  );
}

function ContextualCta({ service }: { service: ServiceDetail }) {
  const cta = service.relatedCta;

  if (!cta) {
    return null;
  }

  return (
    <section className="py-8 sm:py-10 lg:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-5 py-10 text-center shadow-2xl shadow-slate-900/30 sm:px-8 sm:py-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-mesh-dark bg-grid-dark opacity-80" />
          <div className="pointer-events-none absolute -left-8 top-8 h-44 w-44 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-44 w-44 rounded-full bg-accent-500/15 blur-3xl" />
          <div className="relative">
            {cta.badge && (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-300">
                {cta.badge}
              </span>
            )}
            <h2 className="mx-auto max-w-3xl font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{cta.description}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={cta.primaryHref} size="lg" className="group">
                {cta.primaryLabel}
                <LinkArrow />
              </Button>
              {cta.secondaryLabel && cta.secondaryHref && (
                <Button href={cta.secondaryHref} variant="secondary" size="lg">
                  {cta.secondaryLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function getVariantLabel(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "راهکار تجاری و قراردادی";
    case "resilience":
      return "راهکار پایداری و کنترل ریسک";
    case "optimization":
      return "راهکار داده‌محور و تحلیلی";
    case "advisory":
      return "راهکار مشاوره‌ای و استراتژیک";
    case "renewable":
      return "راهکار توسعه پایدار";
  }
}

function getHeroPanelTitle(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "تعرفه بهتر، قرارداد شفاف‌تر، اجرای سریع‌تر";
    case "resilience":
      return "تمرکز بر پایداری عملیات در شرایط حساس";
    case "optimization":
      return "تحلیل، تصمیم و اجرای بهینه‌سازی مبتنی بر داده";
    case "advisory":
      return "تبدیل پیچیدگی انرژی به تصمیم روشن و اجرایی";
    case "renewable":
      return "از امکان‌سنجی تا بهره‌برداری در یک مسیر منسجم";
  }
}

function getFloatingCardTitle(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "تمرکز بر صرفه اقتصادی";
    case "resilience":
      return "تمرکز بر تداوم تولید";
    case "optimization":
      return "تمرکز بر کاهش اتلاف";
    case "advisory":
      return "تمرکز بر کیفیت تصمیم";
    case "renewable":
      return "تمرکز بر ارزش بلندمدت";
  }
}

function getFloatingCardDescription(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "برای خرید برق هوشمند و قابل پیش‌بینی";
    case "resilience":
      return "برای سایت‌های حساس به اختلال انرژی";
    case "optimization":
      return "برای کنترل مصرف، جرائم و هزینه";
    case "advisory":
      return "برای انتخاب سناریوی مناسب سازمان";
    case "renewable":
      return "برای سرمایه‌گذاری پایدار و آینده‌نگر";
  }
}

function getProcessTitle(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "مراحل شروع تامین برق";
    case "resilience":
      return "مراحل طراحی پایداری تامین";
    case "optimization":
      return "چرخه تحلیل تا بهبود";
    case "advisory":
      return "مسیر مشاوره تا تصمیم";
    case "renewable":
      return "مراحل توسعه پروژه";
  }
}

function getProcessDescription(variant: ServiceDetail["variant"]) {
  switch (variant) {
    case "commercial":
      return "فرایندی سریع و روشن برای تبدیل نیاز مصرف به قرارداد و شروع همکاری.";
    case "resilience":
      return "این مسیر برای طراحی یک راهکار مقاوم‌تر در برابر ریسک خاموشی و توقف عملیات چیده شده است.";
    case "optimization":
      return "بهینه‌سازی زمانی موثر است که از کشف مسئله تا سنجش نتیجه، مسیر مشخصی داشته باشد.";
    case "advisory":
      return "مشاوره حرفه‌ای باید از شناخت مسئله تا پیشنهاد قابل اجرا، یک نقشه روشن ارائه دهد.";
    case "renewable":
      return "توسعه یک پروژه تجدیدپذیر به تصمیم‌های مرحله‌ای و دقیق نیاز دارد؛ این مسیر همان چارچوب را نشان می‌دهد.";
  }
}
