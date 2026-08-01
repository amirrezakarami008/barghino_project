import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { StepCard } from "@/shared/ui/IconBox";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SITE_CONFIG } from "@/config";
import { REGISTRATION_STEPS } from "@/features/marketing/constants";

export function StepsSection() {
  return (
    <Section id="steps" background="muted" compact>
      <Container>
        <SectionHeader
          badge="شروع آسان"
          title="از ثبت‌نام تا درآمد — سه مرحله"
          description="بدون پیچیدگی صنعتی. فقط مسیر فروش برق خانگی یا درخواست نصب."
          compact
        />

        <div className="mx-auto mb-8 grid max-w-4xl gap-5 md:grid-cols-3">
          {REGISTRATION_STEPS.map((step, index) => (
            <StepCard
              key={step.id}
              {...step}
              isLast={index === REGISTRATION_STEPS.length - 1}
            />
          ))}
        </div>

        <div className="text-center">
          <Button href={SITE_CONFIG.registerHref} size="lg" className="glow-brand">
            شروع ثبت‌نام
          </Button>
        </div>
      </Container>
    </Section>
  );
}
