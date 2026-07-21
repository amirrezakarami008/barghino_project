import { Container } from "@/components/ui/Container";
import { QuoteCard } from "@/components/ui/Interactive";
import { Section, SectionHeader } from "@/components/ui/Section";
import { TESTIMONIALS } from "@/lib/constants";

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
