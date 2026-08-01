import { Container } from "@/shared/ui/Container";
import { FeatureCard } from "@/shared/ui/IconBox";
import { MediaImage } from "@/shared/ui/MediaImage";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { FEATURES, IMAGES } from "@/features/marketing/constants";

export function WhyUsSection() {
  return (
    <Section id="why-us" background="gradient" compact>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-400/20 via-amber-200/10 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-brand-500/10 ring-1 ring-slate-200/80">
              <MediaImage
                src={IMAGES.whyUs}
                alt="نیروگاه خورشیدی خانگی"
                className="aspect-[4/3]"
                overlay="gradient"
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </div>
          </div>

          <div>
            <SectionHeader
              badge="چرا برقینو"
              title="گران‌تر از دولت، سریع‌تر از انتظار"
              description="سه دلیل ساده برای انتخاب برقینو به‌جای فروش مستقیم به دولت."
              align="start"
              compact
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.id} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
