import { Breadcrumb } from "@/features/marketing/components/Breadcrumb";
import { ProseContent } from "@/features/marketing/components/ProseContent";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { LEGAL_PAGES } from "@/features/marketing/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LEGAL_PAGES.privacy.meta.title,
  description: LEGAL_PAGES.privacy.meta.description,
};

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50 py-12 lg:py-16">
        <Container size="narrow">
          <Breadcrumb
            items={[
              { label: "خانه", href: "/" },
              { label: LEGAL_PAGES.privacy.meta.title },
            ]}
          />
          <h1 className="text-3xl font-bold text-slate-900">{LEGAL_PAGES.privacy.meta.title}</h1>
        </Container>
      </section>
      <Section>
        <Container size="narrow">
          <ProseContent sections={LEGAL_PAGES.privacy.sections} />
        </Container>
      </Section>
    </>
  );
}
