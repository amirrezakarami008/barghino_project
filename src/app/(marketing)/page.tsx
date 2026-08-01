import {
  AppDownloadSection,
  CompareSection,
  FAQBlogSection,
  HeroSection,
  PathsSection,
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
      <StatsSection />
      <TestimonialsSection />
      <AppDownloadSection />
      <FAQBlogSection />
    </>
  );
}
