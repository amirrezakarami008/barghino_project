import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { StepCard } from "@/shared/ui/IconBox";
import { MediaImage } from "@/shared/ui/MediaImage";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SITE_CONFIG } from "@/config";
import { IMAGES, REGISTRATION_STEPS } from "@/features/marketing/constants";

export function StepsSection() {
  return (
    <Section id="steps" background="muted" compact>
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <SectionHeader
              badge="ثبت‌نام آسان"
              title="تامین برق پایدار، هوشمند و اقتصادی"
              description="با برق ما تنها در سه مرحله و با چند کلیک، برق مورد نیاز خود را خریداری کنید."
              align="start"
              compact
            />
            <Button href={SITE_CONFIG.registerHref} size="lg" className="glow-brand">
              شروع ثبت‌نام
            </Button>
          </div>

          <div className="relative">
            <div className="mb-6 overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200/80">
              <MediaImage
                src={IMAGES.steps}
                alt="تیم مشاوره انرژی برق ما"
                className="aspect-[16/9]"
                overlay="dark"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4">
              {REGISTRATION_STEPS.map((step, index) => (
                <StepCard
                  key={step.id}
                  {...step}
                  isLast={index === REGISTRATION_STEPS.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
