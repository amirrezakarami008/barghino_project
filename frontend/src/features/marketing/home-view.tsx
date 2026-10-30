import { HomeCta } from "@/features/marketing/home-cta";
import { HomeFaq } from "@/features/marketing/home-faq";
import { HomeHero } from "@/features/marketing/home-hero";
import { HomeHowItWorks } from "@/features/marketing/home-how-it-works";
import { HomePlans } from "@/features/marketing/home-plans";
import { HomeTrust } from "@/features/marketing/home-trust";
import { HomeTwoPaths } from "@/features/marketing/home-two-paths";

export function HomeView() {
  return (
    <div>
      <HomeHero />
      <HomeTwoPaths />
      <HomeHowItWorks />
      <HomePlans />
      <HomeTrust />
      <HomeFaq />
      <HomeCta />
    </div>
  );
}
