import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { IconBox } from "@/shared/ui/IconBox";
import { ImageCard } from "@/shared/ui/MediaImage";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { IMAGES, SERVICES } from "@/features/marketing/constants";
import { SITE_CONFIG } from "@/config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "خدمات",
  description: SITE_CONFIG.description,
};

const serviceImages = [
  IMAGES.landing.solar,
  IMAGES.stats,
  IMAGES.landing.support,
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageBanner image={IMAGES.landing.solar} alt="خدمات برقینو برای مشترک خانگی" priority>
        <h1 className="max-w-4xl font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          خدمات <span className="text-brand-200">برقینو</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          دو مسیر اصلی: فروش برق خانگی، یا درخواست نصب نیروگاه خورشیدی
        </p>
      </PageBanner>

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <Link
                key={service.id}
                href={service.href}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <ImageCard
                  src={serviceImages[index] ?? IMAGES.landing.solar}
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
                    ادامه
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
            badge="شروع"
            title="کدام مسیر برای شماست؟"
            description="نیروگاه دارید بفروشید؛ ندارید برای نصب درخواست بدهید."
            align="center"
          />
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={SITE_CONFIG.cta.sellPowerHref} size="lg" className="group">
              {SITE_CONFIG.cta.sellPower}
              <LinkArrow />
            </Button>
            <Button href={SITE_CONFIG.cta.requestInstallHref} variant="outline" size="lg">
              {SITE_CONFIG.cta.requestInstall}
            </Button>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
