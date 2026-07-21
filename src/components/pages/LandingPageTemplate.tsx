import { CTASection } from "@/components/sections/CTASection";
import { Button, LinkArrow } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Interactive";
import { FeatureCard, StepCard } from "@/components/ui/IconBox";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { LandingPageContent } from "@/types";
import { Breadcrumb } from "./Breadcrumb";
import { PageBanner } from "./PageBanner";

interface LandingPageTemplateProps {
  content: LandingPageContent;
  breadcrumbs: { label: string; href?: string }[];
  showCta?: boolean;
}

export function LandingPageTemplate({
  content,
  breadcrumbs,
  showCta = true,
}: LandingPageTemplateProps) {
  return (
    <>
      <PageHeroSection content={content} breadcrumbs={breadcrumbs} />
      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.features.map((feature) => (
              <FeatureCard key={feature.id} {...feature} />
            ))}
          </div>
        </Container>
      </Section>

      {content.steps.length > 0 && (
        <Section background="muted">
          <Container>
            <SectionHeader badge="مراحل" title="چگونه شروع کنیم؟" align="center" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {content.steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  {...step}
                  isLast={index === content.steps.length - 1}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {content.sections.map((section) => (
        <Section key={section.id} background={section.id.endsWith("2") ? "muted" : "default"}>
          <Container size="narrow">
            <h2 className="mb-4 font-display text-2xl font-extrabold text-slate-900">{section.title}</h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed text-slate-600">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-4 space-y-2">
                {section.list.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </Section>
      ))}

      {content.faq.length > 0 && (
        <Section background="muted">
          <Container size="narrow">
            <SectionHeader badge="سوالات" title="سوالات متداول" align="center" />
            <Accordion items={content.faq} />
          </Container>
        </Section>
      )}

      {showCta && <CTASection />}
    </>
  );
}

function PageHeroSection({
  content,
  breadcrumbs,
}: {
  content: LandingPageContent;
  breadcrumbs: { label: string; href?: string }[];
}) {
  if (content.hero.image) {
    return (
      <PageBanner image={content.hero.image} alt={content.hero.title} priority>
        <Breadcrumb items={breadcrumbs} />
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-200 backdrop-blur-sm">
          {content.meta.badge}
        </span>
        <h1 className="max-w-4xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {content.hero.title}
          {content.hero.highlight && (
            <>
              {" — "}
              <span className="text-gradient">{content.hero.highlight}</span>
            </>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-200">
          {content.hero.description}
        </p>
        <div className="mt-8">
          <Button href="/register" className="group">
            درخواست مشاوره رایگان
            <LinkArrow />
          </Button>
        </div>
      </PageBanner>
    );
  }

  return (
    <section className="border-b border-slate-200/60 bg-mesh-light bg-grid py-16 lg:py-24">
      <Container>
        <Breadcrumb items={breadcrumbs} />
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
          {content.meta.badge}
        </span>
        <h1 className="max-w-4xl font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {content.hero.title}
          {content.hero.highlight && (
            <>
              {" — "}
              <span className="text-brand-600">{content.hero.highlight}</span>
            </>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          {content.hero.description}
        </p>
        <div className="mt-8">
          <Button href="/register" className="group">
            درخواست مشاوره رایگان
            <LinkArrow />
          </Button>
        </div>
      </Container>
    </section>
  );
}
