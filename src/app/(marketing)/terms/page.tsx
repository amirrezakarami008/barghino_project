import { Breadcrumb } from "@/components/pages/Breadcrumb";
import { ProseContent } from "@/components/pages/ProseContent";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LEGAL_PAGES } from "@/lib/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LEGAL_PAGES.terms.meta.title,
  description: LEGAL_PAGES.terms.meta.description,
};

export default function TermsPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50 py-12 lg:py-16">
        <Container size="narrow">
          <Breadcrumb
            items={[
              { label: "خانه", href: "/" },
              { label: LEGAL_PAGES.terms.meta.title },
            ]}
          />
          <h1 className="text-3xl font-bold text-slate-900">{LEGAL_PAGES.terms.meta.title}</h1>
        </Container>
      </section>
      <Section>
        <Container size="narrow">
          <ProseContent sections={LEGAL_PAGES.terms.sections} />
        </Container>
      </Section>
    </>
  );
}
