import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { IMAGES, STATS } from "@/features/marketing/constants";
import { ABOUT_PAGE } from "@/features/marketing/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ABOUT_PAGE.meta.title,
  description: ABOUT_PAGE.meta.description,
};

export default function AboutPage() {
  return (
    <>
      <PageBanner image={IMAGES.about.office} alt="دفتر برقینو" priority>
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          {ABOUT_PAGE.meta.badge}
        </span>
        <h1 className="max-w-4xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {ABOUT_PAGE.hero.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">{ABOUT_PAGE.hero.description}</p>
      </PageBanner>

      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200/80">
              <MediaImage
                src={IMAGES.about.team}
                alt="تیم برقینو"
                className="aspect-[4/3]"
                overlay="gradient"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">{ABOUT_PAGE.mission.title}</h2>
              <p className="mb-8 leading-relaxed text-slate-600">{ABOUT_PAGE.mission.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
                  >
                    <p className="text-xl font-bold text-brand-600 lg:text-2xl">
                      {stat.value}
                      {stat.suffix}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="muted">
        <Container>
          <SectionHeader badge="ارزش‌ها" title="ارزش‌های ما" align="center" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_PAGE.values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center"
              >
                <h3 className="mb-2 font-bold text-slate-900">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <SectionHeader badge="تاریخچه" title="مسیر رشد برقینو" align="center" />
          <div className="space-y-8">
            {ABOUT_PAGE.timeline.map((item, index) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {item.year.slice(-2)}
                  </div>
                  {index < ABOUT_PAGE.timeline.length - 1 && (
                    <div className="mt-2 w-0.5 flex-1 bg-brand-200" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-sm font-medium text-brand-600">{item.year}</p>
                  <h3 className="mb-1 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="muted">
        <Container>
          <SectionHeader badge="مجوزها" title="اعتبار و مجوزها" align="center" />
          <div className="flex flex-wrap justify-center gap-4">
            {ABOUT_PAGE.licenses.map((license) => (
              <span
                key={license}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700"
              >
                {license}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
