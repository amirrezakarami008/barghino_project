"use client";

import { ButtonLink, PlanCard } from "@/components/ui";
import { Reveal } from "@/features/marketing/reveal";
import { samplePlans } from "@/features/marketing/sample";
import { formatFa } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import "./home-plans.css";

export function HomePlans() {
  const recommendedRate = samplePlans.find((plan) => plan.recommended)?.buyRate ?? samplePlans[1].buyRate;

  return (
    <section className="home-plans" aria-labelledby="home-plans-title">
      <Reveal>
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="home-plans-title" className="text-h2">
            نگاهی به پلن‌های فروش
          </h2>
          <p className="mt-3 text-body text-foreground-muted">
            نرخ خرید و تعهد انرژی در هر توافق نهایی می‌شود.
          </p>
        </header>

        <div className="home-plans__grid">
          {samplePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              buyRate={plan.buyRate}
              energyCommitment={plan.energyCommitment}
              benefits={[...plan.benefits]}
              recommended={plan.recommended}
              sample
              footer={
                <ButtonLink
                  href="/services#sell"
                  variant={plan.recommended ? "primary" : "ghost"}
                  className={
                    plan.recommended
                      ? "home-plans__cta-primary w-full"
                      : "home-plans__cta-outline w-full"
                  }
                >
                  شروع از خدمات
                  <Icon name="arrow" className="size-4 -scale-x-100" />
                </ButtonLink>
              }
            />
          ))}
        </div>

        <p className="home-plans__note">
          مقادیر زیر نمونه‌اند و درآمد تضمینی نیستند. نرخ‌ها و شرایط در قرارداد شما تعریف می‌شوند ·{" "}
          {formatFa(recommendedRate)} تومان / کیلووات‌ساعت در کارت پیشنهادی فقط برای مقایسه بصری است.
        </p>
      </Reveal>
    </section>
  );
}
