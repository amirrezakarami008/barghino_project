"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactElement, RefObject } from "react";
import { Button, Skeleton } from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { formatDecimal, type Plan, type PlantOption } from "./contract-model";
import { ContractEmpty, ContractError } from "./contract-ui";
import { PanelArt } from "@/features/panel/panel-art";
import "./plan-select.css";

export type PlanSelectStepProps = {
  readonly plans: readonly Plan[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly selectedPlan: Plan | undefined;
  readonly selectedPlant: PlantOption | undefined;
  readonly stepLabels: readonly string[];
  readonly currentStep: number;
  readonly onSelect: (plan: Plan) => void;
  readonly onContinue: () => void;
  readonly onBack: () => void;
  readonly headingRef: RefObject<HTMLHeadingElement | null>;
};

type PlanTone = "recommended" | "emerald" | "sky" | "violet";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function planTone(plan: Plan, ordered: readonly Plan[]): PlanTone {
  if (plan.recommended) return "recommended";
  const peers = ordered.filter((item) => !item.recommended);
  const index = peers.findIndex((item) => item.uuid === plan.uuid);
  const cycle: readonly PlanTone[] = ["emerald", "sky", "violet"];
  return cycle[Math.max(0, index) % cycle.length] ?? "sky";
}

function stepVisual(index: number, current: number): "done" | "current" | "blocked" {
  if (index + 1 < current) return "done";
  if (index + 1 === current) return "current";
  return "blocked";
}

export function PlanSelectStep({
  plans,
  loading,
  error,
  onRetry,
  selectedPlan,
  selectedPlant,
  stepLabels,
  currentStep,
  onSelect,
  onContinue,
  onBack,
  headingRef,
}: PlanSelectStepProps): ReactElement {
  const reduceMotion = useReducedMotion();
  const activePlans = plans.filter((plan) => plan.active);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        },
      };

  return (
    <motion.div className="plan-select" {...motionProps}>
      <motion.section className="plan-select-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="plan-select-hero__media" aria-hidden>
          <Image
            src="/images/panel/contracts/plan-select-hero.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 72rem"
            className="plan-select-hero__image"
          />
          <div className="plan-select-hero__veil" />
        </div>

        <div className="plan-select-hero__content">
          <p className="plan-select-hero__badge">مسیر ساخت پیش‌نویس</p>
          <h2 ref={headingRef} tabIndex={-1} className="plan-select-hero__title">
            انتخاب پلن
          </h2>
          <p className="plan-select-hero__lede">
            پلن تجاری مناسب نیروگاه خود را انتخاب کنید. نرخ و تعهد انرژی هنگام ساخت پیش‌نویس قفل می‌شوند؛ این مرحله
            هنوز امضا یا شروع خرید برق نیست.
          </p>
        </div>

        <ol className="plan-select-stepper" aria-label="مراحل ساخت پیش‌نویس">
          {stepLabels.map((label, index) => {
            const state = stepVisual(index, currentStep);
            return (
              <li key={label} className="plan-select-step" data-state={state}>
                <span className="plan-select-step__index" aria-hidden>
                  {state === "done" ? (
                    <Icon name="check" className="size-3.5" />
                  ) : state === "blocked" ? (
                    <Icon name="lock" className="size-3.5" />
                  ) : (
                    faNumber(index + 1)
                  )}
                </span>
                <span className="plan-select-step__label">{label}</span>
              </li>
            );
          })}
        </ol>
      </motion.section>

      {loading ? (
        <div className="plan-select-grid">
          <Skeleton className="h-[28rem] rounded-[28px]" />
          <Skeleton className="h-[28rem] rounded-[28px]" />
          <Skeleton className="h-[28rem] rounded-[28px]" />
        </div>
      ) : null}

      {error ? <ContractError message={error} retry={onRetry} /> : null}

      {!loading && !error && activePlans.length === 0 ? (
        <div className="contracts-empty">
          <PanelArt name="contracts/agreement" width={160} height={160} className="contracts-empty-art" />
          <ContractEmpty title="پلن فعالی در دسترس نیست">
            <p>کمی بعد دوباره بررسی کنید.</p>
            <Button variant="secondary" onClick={onRetry}>
              دریافت دوباره
            </Button>
          </ContractEmpty>
        </div>
      ) : null}

      {!loading && !error && activePlans.length > 0 ? (
        <>
          <div className="plan-select-grid" role="list">
            {activePlans.map((plan, index) => {
              const tone = planTone(plan, activePlans);
              const selected = selectedPlan?.uuid === plan.uuid;
              return (
                <motion.article
                  key={plan.uuid}
                  role="listitem"
                  className="plan-offer"
                  data-tone={tone}
                  data-selected={selected || undefined}
                  data-recommended={plan.recommended || undefined}
                  variants={reduceMotion ? undefined : fadeUp}
                  transition={reduceMotion ? undefined : { delay: index * 0.04 }}
                >
                  <div className="plan-offer__glow" aria-hidden />

                  <header className="plan-offer__head">
                    <div className="plan-offer__visual">
                      <Image
                        src="/images/panel/contracts/plan-panel-thumb.jpg"
                        alt=""
                        width={72}
                        height={72}
                        className="plan-offer__thumb"
                      />
                    </div>
                    <div className="plan-offer__identity">
                      <div className="plan-offer__tags">
                        {plan.recommended ? (
                          <span className="plan-offer__chip plan-offer__chip--hot">پیشنهاد ویژه</span>
                        ) : null}
                        {selected ? <span className="plan-offer__chip plan-offer__chip--picked">انتخاب‌شده</span> : null}
                      </div>
                      <h3 className="plan-offer__name">{plan.name}</h3>
                      {plan.description ? <p className="plan-offer__desc">{plan.description}</p> : null}
                    </div>
                    <span className="plan-offer__radio" aria-hidden data-on={selected || undefined}>
                      {selected ? <Icon name="check" className="size-3.5" /> : null}
                    </span>
                  </header>

                  {plan.recommended && plan.savingsText ? (
                    <p className="plan-offer__why">{plan.savingsText}</p>
                  ) : null}

                  <dl className="plan-offer__metrics">
                    <div>
                      <dt>نرخ خرید</dt>
                      <dd className="tabular-nums">
                        <bdi dir="ltr">{formatDecimal(plan.rate)}</bdi>
                        <span>تومان / kWh</span>
                      </dd>
                    </div>
                    <div>
                      <dt>تعهد انرژی</dt>
                      <dd className="tabular-nums">
                        <bdi dir="ltr">{formatDecimal(plan.commitment)}</bdi>
                        <span>kWh</span>
                      </dd>
                    </div>
                  </dl>

                  {plan.benefits.length ? (
                    <ul className="plan-offer__benefits">
                      {plan.benefits.slice(0, 4).map((benefit) => (
                        <li key={benefit}>
                          <Icon name="check" className="size-3.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {!plan.recommended && plan.savingsText ? (
                    <p className="plan-offer__note">{plan.savingsText}</p>
                  ) : null}

                  <Button
                    variant={selected ? "primary" : "secondary"}
                    className="plan-offer__action"
                    onClick={() => onSelect(plan)}
                  >
                    {selected ? (
                      <>
                        <Icon name="check" className="size-4" />
                        انتخاب شده
                      </>
                    ) : (
                      <>
                        انتخاب این پلن
                        <Icon name="arrow" className="size-4 -scale-x-100" />
                      </>
                    )}
                  </Button>
                </motion.article>
              );
            })}
          </div>

          <div
            className="plan-select-dock"
            data-ready={Boolean(selectedPlan) || undefined}
            aria-live="polite"
          >
            <div className="plan-select-dock__main">
              <span className="plan-select-dock__mark" aria-hidden>
                <Icon name="check" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="plan-select-dock__kicker">انتخاب فعلی</p>
                <p className="plan-select-dock__title">
                  {selectedPlan ? selectedPlan.name : "پلنی انتخاب نشده"}
                </p>
                <p className="plan-select-dock__meta">
                  {selectedPlan ? (
                    <>
                      <span className="tabular-nums">
                        <bdi dir="ltr">{formatDecimal(selectedPlan.rate)}</bdi> تومان/kWh
                      </span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">
                        تعهد <bdi dir="ltr">{formatDecimal(selectedPlan.commitment)}</bdi> kWh
                      </span>
                    </>
                  ) : (
                    "برای رفتن به مرور نهایی، یک پلن را انتخاب کنید"
                  )}
                  {selectedPlant?.plant.name ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{selectedPlant.plant.name}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="plan-select-dock__actions">
              <Button variant="secondary" onClick={onBack}>
                مرحلهٔ قبل
              </Button>
              <Button className="plan-select-dock__cta" disabled={!selectedPlan} onClick={onContinue}>
                ادامه و مرور نهایی
                <Icon name="arrow" className="size-4 -scale-x-100" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
