"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  Stepper,
  type StepItem,
  type StepState,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { contractError, createDraft, getContracts, getPlanChoices, mutationMayHaveSucceeded } from "./contracts-api";
import { eligibility, formatDecimal, type Contract, type Plan, type PlantOption } from "./contract-model";
import { ContractError } from "./contract-ui";
import { IdentityNotice } from "./identity-notice";
import { useContractResource } from "./use-contract-resource";
import { ContractSiteStage, type SitePhase } from "./contract-site-stage";
import { PlanSelectStep } from "./plan-select-step";
import "./contracts-workspace.css";

type WizardStep = 1 | 2 | 3 | 4;
type Submission =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "uncertain"; readonly matches: readonly Contract[] };

const LABELS = [
  "انشعاب و نیروگاه",
  "وضعیت بررسی",
  "انتخاب پلن",
  "مرور نهایی",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function stepState(index: number, current: WizardStep): StepState {
  if (index + 1 < current) return "done";
  if (index + 1 === current) return "current";
  return "blocked";
}

function initialStep(search: URLSearchParams): WizardStep {
  if (search.get("plant")) return 2;
  return 1;
}

function ContractCreateInner(): ReactElement {
  const router = useRouter();
  const search = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [sitePhase, setSitePhase] = useState<SitePhase>(() => (search.get("plant") ? 2 : 1));
  const [step, setStep] = useState<WizardStep>(() => initialStep(search));
  const [selectedPlant, setSelectedPlant] = useState<PlantOption>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [submission, setSubmission] = useState<Submission>({ status: "idle" });
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const loadPlans = useCallback((signal: AbortSignal) => getPlanChoices(signal), []);
  const plans = useContractResource("plans", loadPlans);
  const pending = submission.status === "submitting";
  const planStep = step === 3;

  const stepperSteps: StepItem[] = LABELS.map((label, index) => ({
    id: String(index + 1),
    label,
    state: stepState(index, step),
  }));

  function go(value: WizardStep): void {
    setStep(value);
    if (value <= 2) setSitePhase(value as SitePhase);
    setSubmission({ status: "idle" });
    heading.current?.focus();
  }

  async function submit(): Promise<void> {
    if (
      inFlight.current ||
      !selectedPlant ||
      !selectedPlan ||
      eligibility(selectedPlant) ||
      !selectedPlan.active ||
      submission.status === "uncertain"
    ) {
      return;
    }
    inFlight.current = true;
    setSubmission({ status: "submitting" });
    try {
      const result = await createDraft(selectedPlant.plant.uuid, selectedPlan.uuid);
      router.push(`/panel/contracts/${encodeURIComponent(result.uuid)}`);
    } catch (error) {
      if (mutationMayHaveSucceeded(error)) {
        let matches: readonly Contract[] = [];
        try {
          matches = (await getContracts(1)).results.filter(
            (contract) =>
              contract.plantUuid === selectedPlant.plant.uuid && contract.planUuid === selectedPlan.uuid,
          );
        } catch {
          /* never auto-retry uncertain mutation */
        }
        setSubmission({ status: "uncertain", matches });
      } else {
        setSubmission({ status: "error", message: contractError(error) });
      }
    } finally {
      inFlight.current = false;
    }
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        },
      };

  return (
    <motion.div
      className={planStep ? "contracts-workspace contracts-workspace--plan mx-auto max-w-6xl" : "contracts-workspace mx-auto max-w-6xl"}
      {...motionProps}
    >
      <motion.div variants={reduceMotion ? undefined : fadeUp}>
        <Link
          href="/panel/contracts"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <Icon name="arrow" className="size-4" />
          بازگشت به قراردادها
        </Link>
      </motion.div>

      {!planStep ? (
        <motion.header className="contracts-create-hero" variants={reduceMotion ? undefined : fadeUp}>
          <div>
            <p className="contracts-kicker">مسیر ساخت پیش‌نویس</p>
            <h2 ref={heading} tabIndex={-1} className="mt-2 text-h2 tracking-tight outline-none">
              {LABELS[step - 1]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground-muted">
              {step === 4
                ? "انتخاب‌ها را یک‌بار مرور کنید؛ با تأیید، فقط پیش‌نویس ساخته می‌شود — نه امضا و نه شروع خرید برق."
                : "ساخت پیش‌نویس به‌معنی امضای قرارداد یا آغاز خرید برق نیست. نرخ و تعهد فقط در متن پیش‌نویس ذخیره می‌شوند."}
            </p>
            <div className="mt-6">
              <Stepper steps={stepperSteps} />
            </div>
          </div>
          <PanelArt
            name={step >= 4 ? "contracts/agreement" : "contracts/create"}
            width={180}
            height={180}
            className="contracts-create-art"
          />
        </motion.header>
      ) : null}

      <IdentityNotice />

      <section className="space-y-5" aria-busy={pending}>
        {step <= 2 ? (
          <ContractSiteStage
            phase={sitePhase}
            onPhaseChange={(phase) => {
              setSitePhase(phase);
              setStep(phase);
              heading.current?.focus();
            }}
            onReady={(option) => {
              setSelectedPlant(option);
              go(3);
            }}
            onSkipReview={(option) => {
              setSelectedPlant(option);
              go(3);
            }}
          />
        ) : null}

        {planStep ? (
          <PlanSelectStep
            plans={plans.state.status === "ready" ? plans.state.data.results : []}
            loading={plans.state.status === "loading"}
            error={plans.state.status === "error" ? plans.state.message : null}
            onRetry={plans.reload}
            selectedPlan={selectedPlan}
            selectedPlant={selectedPlant}
            stepLabels={LABELS}
            currentStep={step}
            onSelect={setSelectedPlan}
            onContinue={() => go(4)}
            onBack={() => go(2)}
            headingRef={heading}
          />
        ) : null}

        {step === 4 && selectedPlant && selectedPlan ? (
          <section className="contracts-final-review" aria-labelledby="contracts-final-review-title">
            <div className="contracts-final-sheet">
              <header className="contracts-final-sheet__head">
                <div>
                  <h3 id="contracts-final-review-title" className="contracts-final-sheet__title">
                    خلاصهٔ انتخاب‌ها
                  </h3>
                  <p className="contracts-final-sheet__lede">
                    همین ترکیب به‌عنوان پیش‌نویس ذخیره می‌شود؛ هنوز امضا یا خرید برق نیست.
                  </p>
                </div>
                <p className="contracts-final-sheet__badge" role="status">
                  <Icon name="check" className="size-3.5" />
                  آمادهٔ ساخت
                </p>
              </header>

              <div className="contracts-final-sheet__body">
                <dl className="contracts-final-facts">
                  <div className="contracts-final-fact">
                    <dt>
                      <Icon name="solarPanel" className="size-3.5" />
                      نیروگاه
                    </dt>
                    <dd>{selectedPlant.plant.name}</dd>
                    <p className="contracts-final-fact__meta">
                      {selectedPlant.plant.capacity ? (
                        <>
                          ظرفیت <bdi dir="ltr">{formatDecimal(selectedPlant.plant.capacity)}</bdi> kWp
                        </>
                      ) : (
                        "ظرفیت ثبت نشده"
                      )}
                    </p>
                  </div>

                  <div className="contracts-final-fact">
                    <dt>
                      <Icon name="home" className="size-3.5" />
                      انشعاب
                    </dt>
                    <dd>{selectedPlant.branch?.name || "—"}</dd>
                    <p className="contracts-final-fact__meta">
                      شناسه قبض{" "}
                      <bdi dir="ltr">{selectedPlant.branch?.billId || "—"}</bdi>
                      {selectedPlant.branch?.address ? ` · ${selectedPlant.branch.address}` : null}
                    </p>
                  </div>

                  <div className="contracts-final-fact contracts-final-fact--plan">
                    <dt>
                      <Icon name="plan" className="size-3.5" />
                      پلن
                    </dt>
                    <dd>{selectedPlan.name}</dd>
                    <p className="contracts-final-fact__meta tabular-nums">
                      نرخ <bdi dir="ltr">{formatDecimal(selectedPlan.rate)}</bdi> تومان/kWh
                      {" · "}
                      تعهد <bdi dir="ltr">{formatDecimal(selectedPlan.commitment)}</bdi> kWh
                    </p>
                    {selectedPlan.benefits.length ? (
                      <ul className="contracts-final-benefits">
                        {selectedPlan.benefits.slice(0, 3).map((benefit) => (
                          <li key={benefit}>
                            <Icon name="check" className="size-3.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </dl>
              </div>
            </div>

            <Alert tone="warning" title="ساخت پیش‌نویس ≠ امضا و ≠ شروع خرید برق">
              پس از ساخت می‌توانید جزئیات را ببینید؛ دکمهٔ امضا تا آماده‌شدن سند رسمی غیرفعال می‌ماند.
            </Alert>
          </section>
        ) : null}

        {submission.status === "error" ? <ContractError message={submission.message} /> : null}
        {submission.status === "uncertain" ? (
          <Alert tone="warning" title="نتیجهٔ درخواست ساخت مشخص نیست">
            <p>برای جلوگیری از ساخت تکراری، درخواست خودکار دیگری نفرستادیم. فهرست را بررسی کنید.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {submission.matches.map((contract) => (
                <ButtonLink
                  key={contract.uuid}
                  href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}
                  variant="secondary"
                  size="sm"
                >
                  قرارداد مشابه
                </ButtonLink>
              ))}
              <ButtonLink href="/panel/contracts" variant="ghost" size="sm">
                فهرست قراردادها
              </ButtonLink>
            </div>
          </Alert>
        ) : null}

        {step === 4 ? (
          <footer className="contracts-create-footer">
            <Button
              variant="secondary"
              disabled={pending || submission.status === "uncertain"}
              onClick={() => go(3)}
            >
              مرحلهٔ قبل
            </Button>
            <span className="text-caption text-foreground-muted" role="status">
              {pending ? "در حال ساخت پیش‌نویس…" : `مرحلهٔ ${faNumber(step)} از ${faNumber(4)}`}
            </span>
            <Button
              disabled={pending || submission.status === "uncertain" || !selectedPlant || !selectedPlan}
              onClick={() => {
                void submit();
              }}
            >
              <Icon name="plus" className="size-4" />
              {pending ? "در حال ثبت…" : "ساخت پیش‌نویس"}
            </Button>
          </footer>
        ) : null}
      </section>
    </motion.div>
  );
}

export function ContractCreate(): ReactElement {
  return <ContractCreateInner />;
}
