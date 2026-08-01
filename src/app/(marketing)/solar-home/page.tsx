import { LandingPageTemplate } from "@/features/marketing/components/LandingPageTemplate";
import { InstallCalculator } from "@/features/marketing/components/InstallCalculator";
import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { SOLAR_HOME_PAGE } from "@/features/marketing/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: SOLAR_HOME_PAGE.meta.title,
  description: SOLAR_HOME_PAGE.meta.description,
};

export default function SolarHomePage() {
  return (
    <>
      <LandingPageTemplate
        content={SOLAR_HOME_PAGE}
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: SOLAR_HOME_PAGE.meta.title },
        ]}
        showCta={false}
      />
      <InstallCalculator />
      <CTASection />
    </>
  );
}
