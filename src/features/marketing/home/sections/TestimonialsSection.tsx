import { Container } from "@/shared/ui/Container";
import { QuoteCard } from "@/shared/ui/Interactive";
import { TESTIMONIALS } from "@/features/marketing/constants";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-white py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            تجربه مشتریان برقینو
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            آنچه مشتریان درباره فروش برق خانگی و مسیر نصب می‌گویند.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {TESTIMONIALS.map((testimonial) => (
            <QuoteCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
