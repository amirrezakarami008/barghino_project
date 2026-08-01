import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { IconBox } from "@/shared/ui/IconBox";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SERVICES } from "@/features/marketing/constants";
import Link from "next/link";

export function ServicesSection() {
  return (
    <Section id="services" background="default" compact>
      <Container>
        <SectionHeader
          badge="خدمات برقینو"
          title="فقط دو کار اصلی — و یک پشتیبانی"
          description="فروش برق خانگی، نصب نیروگاه خورشیدی، و همراهی تا دریافت درآمد."
          compact
        />

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              className="group rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <IconBox
                icon={service.icon}
                variant="gradient"
                gradient={service.gradient}
                size="lg"
                className="mb-5 shadow-lg"
              />
              <h3 className="mb-2 font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">
                {service.title}
              </h3>
              <p className="mb-5 text-sm leading-7 text-slate-600">{service.description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                ادامه
                <LinkArrow />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/services" variant="outline" size="lg" className="group">
            جزئیات خدمات
            <LinkArrow />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
