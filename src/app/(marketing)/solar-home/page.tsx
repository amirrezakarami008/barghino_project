import { LandingPageTemplate } from "@/components/pages/LandingPageTemplate";
import { SOLAR_HOME_PAGE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: SOLAR_HOME_PAGE.meta.title,
  description: SOLAR_HOME_PAGE.meta.description,
};

export default function SolarHomePage() {
  return (
    <LandingPageTemplate
      content={SOLAR_HOME_PAGE}
      breadcrumbs={[
        { label: "خانه", href: "/" },
        { label: SOLAR_HOME_PAGE.meta.title },
      ]}
    />
  );
}
