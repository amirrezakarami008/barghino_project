"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  PlanCard,
  Skeleton,
  Stepper,
  type StepItem,
  type StepState,
} from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { contractError, createDraft, getContracts, getPlanChoices, mutationMayHaveSucceeded } from "./contracts-api";
import { eligibility, formatDecimal, type Contract, type Plan, type PlantOption } from "./contract-model";
import { ContractEmpty, ContractError, ContractPagination } from "./contract-ui";
import { IdentityNotice } from "./identity-notice";
import { useContractResource } from "./use-contract-resource";
import { ContractSiteStage, type SitePhase } from "./contract-site-stage";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type Submission =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "uncertain"; readonly matches: readonly Contract[] };

const LABELS = [
  "انشعاب",
  "نیروگاه",
  "وضعیت بررسی",
  "انتخاب پلن",
  "مرور نهایی",
  "ساخت پیش‌نویس",
] as const;

function stepState(index: number, current: WizardStep): StepState {
  if (index + 1 < current) return "done";
  if (index + 1 === current) return "current";
  return "blocked";
}

export function ContractCreate(): ReactElement {
  const router = useRouter();
  const search = useSearchParams();
  const [sitePhase, setSitePhase] = useState<SitePhase>(() =>
    search.get("plant") ? 3 : search.get("branch") ? 2 : 1,
  );
  const [step, setStep] = useState<WizardStep>(() =>
    search.get("plant") ? 3 : search.get("branch") ? 2 : 1,
  );
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
    if (value <= 3) setSitePhase(value as SitePhase);
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/panel/contracts" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground">
          <Icon name="arrow" className="size-4" />
          بازگشت به قراردادها
        </Link>
      </div>

      <header className="glass-strong rounded-xl border border-border p-5 shadow-soft sm:p-6">
        <p className="text-caption text-accent">مسیر ساخت پیش‌نویس</p>
        <h2 ref={heading} tabIndex={-1} className="mt-2 text-h2 outline-none">
          {LABELS[step - 1]}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground-muted">
          ساخت پیش‌نویس به‌معنی امضای قرارداد یا آغاز خرید برق نیست. نرخ و تعهد فقط در متن پیش‌نویس ذخیره می‌شوند.
        </p>
        <div className="mt-6">
          <Stepper steps={stepperSteps} />
        </div>
      </header>

      <IdentityNotice />

      <section className="space-y-5" aria-busy={pending}>
        {step <= 3 ? (
          <ContractSiteStage
            phase={sitePhase}
            onPhaseChange={(phase) => {
              setSitePhase(phase);
              setStep(phase);
              heading.current?.focus();
            }}
            onReady={(option) => {
              setSelectedPlant(option);
              go(4);
            }}
          />
        ) : null}

        {step === 4 ? (
          plans.state.status === "loading" ? (
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : plans.state.status === "error" ? (
            <ContractError message={plans.state.message} retry={plans.reload} />
          ) : !plans.state.data.results.some((plan) => plan.active) ? (
            <ContractEmpty title="پلن فعالی در دسترس نیست">
              <p>کمی بعد دوباره بررسی کنید.</p>
              <Button variant="secondary" onClick={plans.reload}>
                دریافت دوباره
              </Button>
            </ContractEmpty>
          ) : (
            <>
              <p className="text-sm text-foreground-muted">
                پلن‌ها برای مقایسه هم‌ارتفاع‌اند. نرخ‌ها شرایط فعلی کاتالوگ‌اند و هنگام ساخت پیش‌نویس در قرارداد قفل می‌شوند.
              </p>
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

        {step === 5 && selectedPlant && selectedPlan ? (
          <Card>
            <h3 className="text-h3">مرور نهایی پیش‌نویس</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-surface p-3">
                <dt className="text-caption text-foreground-muted">نیروگاه</dt>
                <dd className="mt-1 font-semibold">{selectedPlant.plant.name}</dd>
              </div>
              <div className="rounded-md bg-surface p-3">
                <dt className="text-caption text-foreground-muted">انشعاب / کنتور</dt>
                <dd className="mt-1 font-semibold">
                  {selectedPlant.branch?.name} · <bdi dir="ltr">{selectedPlant.branch?.meter}</bdi>
                </dd>
              </div>
              <div className="rounded-md bg-surface p-3">
                <dt className="text-caption text-foreground-muted">پلن</dt>
                <dd className="mt-1 font-semibold">{selectedPlan.name}</dd>
              </div>
              <div className="rounded-md bg-surface p-3">
                <dt className="text-caption text-foreground-muted">نرخ و تعهد</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  <bdi dir="ltr">{formatDecimal(selectedPlan.rate)}</bdi> تومان/kWh ·{" "}
                  <bdi dir="ltr">{formatDecimal(selectedPlan.commitment)}</bdi> kWh
                </dd>
              </div>
              <div className="rounded-md bg-surface p-3 sm:col-span-2">
                <dt className="text-caption text-foreground-muted">نشانی انشعاب</dt>
                <dd className="mt-1 font-semibold">{selectedPlant.branch?.address}</dd>
              </div>
            </dl>
            <Alert tone="info" className="mt-4" title="این مرحله امضا نیست">
              با ادامه، فقط پیش‌نویس ساخته می‌شود. خرید برق و تعهدات نهایی فقط پس از سند رسمی و امضای فعال آغاز می‌شود.
            </Alert>
          </Card>
        ) : null}

        {step === 6 && selectedPlant && selectedPlan ? (
          <Card>
            <h3 className="text-h3">ساخت پیش‌نویس</h3>
            <p className="mt-2 text-sm leading-7 text-foreground-muted">
              با تأیید، پلن «{selectedPlan.name}» روی نیروگاه «{selectedPlant.plant.name}» به‌صورت پیش‌نویس ذخیره می‌شود.
            </p>
            <Alert tone="warning" className="mt-4" title="ساخت پیش‌نویس ≠ امضا و ≠ شروع خرید برق">
              پس از ساخت می‌توانید جزئیات را ببینید؛ دکمهٔ امضا تا آماده‌شدن سند رسمی غیرفعال می‌ماند.
            </Alert>
          </Card>
        ) : null}

        {submission.status === "error" ? <ContractError message={submission.message} /> : null}
        {submission.status === "uncertain" ? (
          <Alert tone="warning" title="نتیجهٔ درخواست ساخت مشخص نیست">
            <p>
              برای جلوگیری از ساخت تکراری، درخواست خودکار دیگری نفرستادیم. فهرست را بررسی کنید.
            </p>
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

        {step >= 4 ? (
          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
            <Button
              variant="secondary"
              disabled={pending || submission.status === "uncertain"}
              onClick={() => go((step - 1) as WizardStep)}
            >
              مرحلهٔ قبل
            </Button>
            <span className="text-caption text-foreground-muted" role="status">
              {pending ? "در حال ساخت پیش‌نویس…" : `مرحلهٔ ${faNumber(step)} از ${faNumber(6)}`}
            </span>
            {step < 6 ? (
              <Button
                disabled={
                  (step === 4 && !selectedPlan) ||
                  (step === 5 && (!selectedPlant || !selectedPlan))
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
    </div>
  );
}
