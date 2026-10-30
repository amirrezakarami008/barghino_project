"use client";

import { ButtonLink } from "@/components/ui";
import { Reveal } from "@/features/marketing/reveal";
import { Icon } from "@/shared/ui/icon";
import "./home-cta.css";

export function HomeCta() {
  return (
    <section className="home-cta" aria-labelledby="home-cta-title">
      <Reveal>
        <div className="home-cta__band">
          <div className="home-cta__pattern" aria-hidden />
          <div className="home-cta__glow" aria-hidden />

          <div className="home-cta__copy">
            <h2 id="home-cta-title" className="text-h2 text-balance">
              آمادهٔ شروع مسیر شفاف فروش یا نصب؟
            </h2>
            <p className="mt-3 max-w-xl text-body text-foreground-muted">
              حساب بسازید، مسیر را انتخاب کنید و وضعیت را از همان پنل دنبال کنید.
            </p>
            <div className="home-cta__actions">
              <ButtonLink
                href="/register?path=sell"
                size="lg"
                variant="secondary"
                className="home-cta__btn-primary justify-center"
              >
                فروش برق
                <Icon name="arrow" className="size-4 -scale-x-100" />
              </ButtonLink>
              <ButtonLink
                href="/register?path=install"
                size="lg"
                variant="ghost"
                className="home-cta__btn-glass justify-center"
              >
                درخواست نصب
              </ButtonLink>
            </div>
          </div>

          <div className="home-cta__visual" aria-hidden>
            <div className="home-cta__orb" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
