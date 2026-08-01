import {
  AppDownloadSection,
  CompareSection,
  CTASection,
  FAQBlogSection,
  HeroSection,
  PathsSection,
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
      <CompareSection />
      <PathsSection />
      <StepsSection />
      <WhyUsSection />
      <ServicesSection />
      <StatsSection />
      <TestimonialsSection />
      <AppDownloadSection />
      <FAQBlogSection />
      <CTASection />
    </>
  );
}
