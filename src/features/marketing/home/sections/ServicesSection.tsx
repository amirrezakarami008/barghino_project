import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { IconBox } from "@/shared/ui/IconBox";
import { ImageCard } from "@/shared/ui/MediaImage";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SERVICES, getServiceImage } from "@/features/marketing/constants";
import Link from "next/link";

export function ServicesSection() {
  return (
    <Section id="services" background="muted" compact>
      <Container>
        <SectionHeader
          badge="خدمات برق ما"
          title="راهکارهای مدرن برای هر سناریوی تامین انرژی"
          description="از تامین برق مصرفی تا بهینه‌سازی و نیروگاه تجدیدپذیر، هر سرویس برای یک تصمیم سریع‌تر و تجربه‌ای حرفه‌ای‌تر طراحی شده است."
          compact
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <Link
              key={service.id}
              href={service.href}
              className="group relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand-200/80 hover:shadow-2xl hover:shadow-brand-500/10"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-slate-950/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                0{index + 1}
              </div>
              <ImageCard
                src={getServiceImage(service.slug)}
                alt={service.title}
                height="h-44"
                overlay="gradient"
              >
                <div className="absolute bottom-4 right-4">
                  <IconBox
                    icon={service.icon}
                    variant="gradient"
                    gradient={service.gradient}
                    size="lg"
                    className="shadow-xl"
                  />
                </div>
              </ImageCard>
              <div className="p-5 sm:p-6">
                <div className="mb-3 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
                  راهکار تخصصی
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">
                  {service.title}
                </h3>
                <p className="mb-4 text-sm leading-7 text-slate-600">{service.description}</p>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    جزئیات بیشتر
                    <LinkArrow />
                  </span>
                  <span className="text-xs text-slate-400 transition-colors group-hover:text-slate-500">
                    مناسب برای کسب‌وکارهای در حال رشد
                  </span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-gradient-to-l from-brand-500 to-brand-400 transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/services" variant="outline" size="lg" className="group">
            مشاهده همه خدمات
            <LinkArrow />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
