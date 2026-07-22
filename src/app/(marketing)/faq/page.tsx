import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { Breadcrumb } from "@/features/marketing/components/Breadcrumb";
import { Container } from "@/shared/ui/Container";
import { Accordion } from "@/shared/ui/Interactive";
import { Section } from "@/shared/ui/Section";
import { FAQ_ITEMS } from "@/features/marketing/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ به پرسش‌های رایج درباره خدمات و فرایند خرید برق از برق ما",
};

export default function FAQPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50 py-16 lg:py-20">
        <Container size="narrow">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "سوالات متداول" }]} />
          <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            FAQ
          </span>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">سوالات متداول</h1>
          <p className="mt-4 text-lg text-slate-600">
            پاسخ به رایج‌ترین پرسش‌ها درباره خدمات برق ما
          </p>
        </Container>
      </section>

      <Section>
        <Container size="narrow">
          <Accordion items={FAQ_ITEMS} />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
