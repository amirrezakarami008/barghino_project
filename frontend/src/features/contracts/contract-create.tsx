"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  PlanCard,
  Skeleton,
  Stepper,
  ToastProvider,
  type StepItem,
  type StepState,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { contractError, createDraft, getContracts, getPlanChoices, mutationMayHaveSucceeded } from "./contracts-api";
import { eligibility, formatDecimal, type Contract, type Plan, type PlantOption } from "./contract-model";
import { ContractEmpty, ContractError, ContractPagination } from "./contract-ui";
import { IdentityNotice } from "./identity-notice";
import { useContractResource } from "./use-contract-resource";
import { ContractSiteStage, type SitePhase } from "./contract-site-stage";
import "./contracts-workspace.css";

type WizardStep = 1 | 2 | 3 | 4 | 5;
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
  "ساخت پیش‌نویس",
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
  const [planPage, setPlanPage] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState<PlantOption>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [submission, setSubmission] = useState<Submission>({ status: "idle" });
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const loadPlans = useCallback((signal: AbortSignal) => getPlanChoices(planPage, signal), [planPage]);
  const plans = useContractResource(`plans:${planPage}`, loadPlans);
  const pending = submission.status === "submitting";

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
    <motion.div className="contracts-workspace mx-auto max-w-6xl" {...motionProps}>
      <motion.div variants={reduceMotion ? undefined : fadeUp}>
        <Link
          href="/panel/contracts"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <Icon name="arrow" className="size-4" />
          بازگشت به قراردادها
        </Link>
      </motion.div>

      <motion.header className="contracts-create-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div>
          <p className="contracts-kicker">مسیر ساخت پیش‌نویس</p>
          <h2 ref={heading} tabIndex={-1} className="mt-2 text-h2 tracking-tight outline-none">
            {LABELS[step - 1]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground-muted">
            ساخت پیش‌نویس به‌معنی امضای قرارداد یا آغاز خرید برق نیست. نرخ و تعهد فقط در متن پیش‌نویس ذخیره می‌شوند.
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

        {step === 3 ? (
          plans.state.status === "loading" ? (
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-64 rounded-[22px]" />
              <Skeleton className="h-64 rounded-[22px]" />
              <Skeleton className="h-64 rounded-[22px]" />
            </div>
          ) : plans.state.status === "error" ? (
            <ContractError message={plans.state.message} retry={plans.reload} />
          ) : !plans.state.data.results.some((plan) => plan.active) ? (
            <div className="contracts-empty">
              <PanelArt name="contracts/agreement" width={160} height={160} className="contracts-empty-art" />
              <ContractEmpty title="پلن فعالی در دسترس نیست">
                <p>کمی بعد دوباره بررسی کنید.</p>
                <Button variant="secondary" onClick={plans.reload}>
                  دریافت دوباره
                </Button>
              </ContractEmpty>
            </div>
          ) : (
            <>
              <div className="panel-surface">
                <p className="text-sm leading-7 text-foreground-muted">
                  پلن‌ها برای مقایسه هم‌ارتفاع‌اند. نرخ‌ها شرایط فعلی کاتالوگ‌اند و هنگام ساخت پیش‌نویس در قرارداد قفل
                  می‌شوند.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {plans.state.data.results
                  .filter((plan) => plan.active)
                  .map((plan) => (
                    <PlanCard
                      key={plan.uuid}
                      name={plan.name}
                      buyRate={Number(plan.rate)}
                      energyCommitment={`${formatDecimal(plan.commitment)} kWh`}
                      benefits={[...plan.benefits]}
                      recommended={plan.recommended}
                      sample={false}
                      selected={selectedPlan?.uuid === plan.uuid}
                      actionLabel="انتخاب این پلن"
                      onSelect={() => setSelectedPlan(plan)}
                    />
                  ))}
              </div>
              <ContractPagination page={planPage} {...plans.state.data} onChange={setPlanPage} />
            </>
          )
        ) : null}

        {step === 4 && selectedPlant && selectedPlan ? (
          <section className="panel-surface">
            <div className="mb-4 flex items-center gap-3">
              <PanelArt
                name="contracts/agreement"
                width={72}
                height={72}
                className="size-16 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              />
              <div>
                <h3 className="text-h3">مرور نهایی پیش‌نویس</h3>
                <p className="text-caption text-foreground-muted">قبل از ساخت، شرایط ذخیره‌شونده را تأیید کنید</p>
              </div>
            </div>
            <dl className="contracts-review-grid">
              <div className="contracts-field">
                <dt className="text-caption text-foreground-muted">نیروگاه</dt>
                <dd className="mt-1 font-semibold">{selectedPlant.plant.name}</dd>
              </div>
              <div className="contracts-field">
                <dt className="text-caption text-foreground-muted">انشعاب / کنتور</dt>
                <dd className="mt-1 font-semibold">
                  {selectedPlant.branch?.name} · <bdi dir="ltr">{selectedPlant.branch?.meter}</bdi>
                </dd>
              </div>
              <div className="contracts-field">
                <dt className="text-caption text-foreground-muted">پلن</dt>
                <dd className="mt-1 font-semibold">{selectedPlan.name}</dd>
              </div>
              <div className="contracts-field">
                <dt className="text-caption text-foreground-muted">نرخ و تعهد</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  <bdi dir="ltr">{formatDecimal(selectedPlan.rate)}</bdi> تومان/kWh ·{" "}
                  <bdi dir="ltr">{formatDecimal(selectedPlan.commitment)}</bdi> kWh
                </dd>
              </div>
              <div className="contracts-field sm:col-span-2">
                <dt className="text-caption text-foreground-muted">نشانی انشعاب</dt>
                <dd className="mt-1 font-semibold">{selectedPlant.branch?.address}</dd>
              </div>
            </dl>
            <Alert tone="info" className="mt-4" title="این مرحله امضا نیست">
              با ادامه، فقط پیش‌نویس ساخته می‌شود. خرید برق و تعهدات نهایی فقط پس از سند رسمی و امضای فعال آغاز می‌شود.
            </Alert>
          </section>
        ) : null}

        {step === 5 && selectedPlant && selectedPlan ? (
          <section className="panel-surface">
            <div className="mb-4 flex items-center gap-3">
              <PanelArt
                name="contracts/approved"
                width={72}
                height={72}
                className="size-16 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              />
              <div>
                <h3 className="text-h3">ساخت پیش‌نویس</h3>
                <p className="text-caption text-foreground-muted">آخرین تأیید قبل از ذخیره در سرور</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-foreground-muted">
              با تأیید، پلن «{selectedPlan.name}» روی نیروگاه «{selectedPlant.plant.name}» به‌صورت پیش‌نویس ذخیره
              می‌شود.
            </p>
            <Alert tone="warning" className="mt-4" title="ساخت پیش‌نویس ≠ امضا و ≠ شروع خرید برق">
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

        {step >= 3 ? (
          <footer className="contracts-create-footer">
            <Button
              variant="secondary"
              disabled={pending || submission.status === "uncertain"}
              onClick={() => go((step - 1) as WizardStep)}
            >
              مرحلهٔ قبل
            </Button>
            <span className="text-caption text-foreground-muted" role="status">
              {pending ? "در حال ساخت پیش‌نویس…" : `مرحلهٔ ${faNumber(step)} از ${faNumber(5)}`}
            </span>
            {step < 5 ? (
              <Button
                disabled={
                  (step === 3 && !selectedPlan) || (step === 4 && (!selectedPlant || !selectedPlan))
                }
                onClick={() => go((step + 1) as WizardStep)}
              >
                ادامه
              </Button>
            ) : (
              <Button
                disabled={pending || submission.status === "uncertain"}
                onClick={() => {
                  void submit();
                }}
              >
                <Icon name="plus" className="size-4" />
                {pending ? "در حال ثبت…" : "ساخت پیش‌نویس"}
              </Button>
            )}
          </footer>
        ) : null}
      </section>
    </motion.div>
  );
}

export function ContractCreate(): ReactElement {
  return (
    <ToastProvider mobileOffsetClassName="ui-toast-stack--above-actions">
      <ContractCreateInner />
    </ToastProvider>
  );
}
