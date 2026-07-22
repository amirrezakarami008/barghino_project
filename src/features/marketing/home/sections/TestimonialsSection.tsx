import { Container } from "@/shared/ui/Container";
import { QuoteCard } from "@/shared/ui/Interactive";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { TESTIMONIALS } from "@/features/marketing/constants";

export function TestimonialsSection() {
  return (
    <Section id="testimonials" background="muted" compact>
      <Container>
        <SectionHeader
          badge="نظرات مشتریان"
          title="تجربه و نظرات مشتریان برق ما"
          description="آنچه مشتریان درباره برق ما می‌گویند."
          compact
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {TESTIMONIALS.map((testimonial) => (
            <QuoteCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
