import {
  AppDownloadSection,
  CTASection,
  FAQBlogSection,
  HeroSection,
  ServicesSection,
  StatsSection,
  StepsSection,
  TestimonialsSection,
  WhyUsSection,
} from "@/features/marketing";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyUsSection />
      <ServicesSection />
      <StepsSection />
      <StatsSection />
      <AppDownloadSection />
      <TestimonialsSection />
      <FAQBlogSection />
      <CTASection />
    </>
  );
}
