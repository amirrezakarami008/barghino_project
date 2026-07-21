import { CTASection } from "@/components/sections/CTASection";
import { PageBanner } from "@/components/pages/PageBanner";
import { Button, LinkArrow } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconBox } from "@/components/ui/IconBox";
import { ImageCard } from "@/components/ui/MediaImage";
import { Section, SectionHeader } from "@/components/ui/Section";
import { IMAGES, SERVICES, getServiceImage } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "خدمات",
  description: "خدمات تخصصی برق ما — تامین برق، بهینه‌سازی، مشاوره انرژی و نیروگاه تجدیدپذیر",
};

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        image={IMAGES.hero.main}
        alt="خدمات تامین برق برق ما"
        priority
      >
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          خدمات
        </span>
        <h1 className="max-w-4xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          خدمات تخصصی <span className="text-brand-200">برق ما</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          راهکارهای هوشمند و اقتصادی برای تامین برق در سراسر ایران
        </p>
      </PageBanner>

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <ImageCard
                  src={getServiceImage(service.slug)}
                  alt={service.title}
                  height="h-48"
                  overlay="gradient"
                >
                  <div className="absolute bottom-4 right-4">
                    <IconBox
                      icon={service.icon}
                      variant="gradient"
                      gradient={service.gradient}
                      className="shadow-lg"
                    />
                  </div>
                </ImageCard>
                <div className="p-6">
                  <h2 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-brand-600">
                    {service.title}
                  </h2>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                    جزئیات بیشتر
                    <LinkArrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="muted">
        <Container>
          <SectionHeader
            badge="مشاوره"
            title="کدام سرویس مناسب شماست؟"
            description="کارشناسان ما آماده راهنمایی رایگان هستند."
            align="center"
          />
          <div className="text-center">
            <Button href="/contact" size="lg" className="group">
              درخواست مشاوره
              <LinkArrow />
            </Button>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
