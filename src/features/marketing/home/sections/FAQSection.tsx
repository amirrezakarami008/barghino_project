import { Container } from "@/shared/ui/Container";
import { Accordion } from "@/shared/ui/Interactive";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { FAQ_ITEMS } from "@/features/marketing/constants";

export function FAQSection() {
  return (
    <Section id="faq" compact>
      <Container size="narrow">
        <SectionHeader
          badge="سوالات متداول"
          title="دسترسی سریع به پاسخ پرسش‌های شما"
          description="پاسخ به رایج‌ترین سوالات درباره فروش برق خانگی و نصب نیروگاه."
          compact
        />
        <Accordion items={FAQ_ITEMS} />
      </Container>
    </Section>
  );
}
