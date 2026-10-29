"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { contractError, createDraft, getContracts, getPlanChoices, mutationMayHaveSucceeded } from "./contracts-api";
import { eligibility, formatDecimal, type Contract, type Plan, type PlantOption } from "./contract-model";
import { ContractEmpty, ContractError, ContractPagination } from "./contract-ui";
import { IdentityNotice } from "./identity-notice";
import { useContractResource } from "./use-contract-resource";
import { ContractSiteStage, type SitePhase } from "./contract-site-stage";
import "./contracts.css";

type Submission =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "uncertain"; readonly matches: readonly Contract[] };

const STEPS = ["انشعاب", "نیروگاه", "تأیید شرکت", "پلن فروش", "پیش‌نویس"] as const;

function stageTitle(step: 1 | 2 | 3, sitePhase: SitePhase): string {
  if (step === 1) {
    if (sitePhase === 1) return "انشعاب این قرارداد را ثبت یا انتخاب کنید";
    if (sitePhase === 2) return "نیروگاه متصل به انشعاب را معرفی کنید";
    return "تأیید انشعاب و نیروگاه را همین‌جا پیگیری کنید";
  }
  if (step === 2) return "شرایط فروش مناسب خود را انتخاب کنید";
  return "یک بار دیگر، پیش از ساخت پیش‌نویس";
}

function PlanTile({ plan, selected, onSelect }: { readonly plan: Plan; readonly selected: boolean; readonly onSelect: () => void }): ReactElement {
  return (
    <label className="contract-plan-tile" data-selected={selected} data-featured={plan.recommended}>
      <input type="radio" name="contract-plan" checked={selected} onChange={onSelect} />
      <div className="contract-plan-tile-top">
        {plan.recommended ? (
          <small>
            <Icon name="star" className="size-3" />
            پیشنهاد شرکت
          </small>
        ) : (
          <small>پلن فعال</small>
        )}
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
      </div>
      <dl className="contract-plan-tile-metrics">
        <div>
          <dt>نرخ خرید هر kWh</dt>
          <dd>
            <bdi dir="ltr">{formatDecimal(plan.rate)}</bdi>
            <small>تومان</small>
          </dd>
        </div>
        <div>
          <dt>تعهد انرژی</dt>
          <dd>
            <bdi dir="ltr">{formatDecimal(plan.commitment)}</bdi>
            <small>
              <bdi dir="ltr">kWh</bdi>
            </small>
          </dd>
        </div>
      </dl>
      <ul className="contract-plan-tile-benefits">
        {plan.benefits.map((benefit, index) => (
          <li key={`${index}-${benefit}`}>
            <Icon name="check" className="size-4" />
            {benefit}
          </li>
        ))}
      </ul>
      <span className="contract-plan-select-label">{selected ? "انتخاب شده" : "انتخاب این پلن"}</span>
    </label>
  );
}

export function ContractCreate(): ReactElement {
  const router = useRouter();
  const search = useSearchParams();
  const [sitePhase, setSitePhase] = useState<SitePhase>(() => (search.get("plant") ? 3 : search.get("branch") ? 2 : 1));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [planPage, setPlanPage] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState<PlantOption>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [submission, setSubmission] = useState<Submission>({ status: "idle" });
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const loadPlans = useCallback((signal: AbortSignal) => getPlanChoices(planPage, signal), [planPage]);
  const plans = useContractResource(`plans:${planPage}`, loadPlans);
  const currentStage = step === 1 ? sitePhase : step + 2;
  const pending = submission.status === "submitting";

  function go(value: 1 | 2 | 3): void {
    setStep(value);
    setSubmission({ status: "idle" });
    heading.current?.focus();
  }

  async function submit(): Promise<void> {
    if (inFlight.current || !selectedPlant || !selectedPlan || eligibility(selectedPlant) || !selectedPlan.active || submission.status === "uncertain") return;
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
            (contract) => contract.plantUuid === selectedPlant.plant.uuid && contract.planUuid === selectedPlan.uuid,
          );
        } catch {
          /* An uncertain mutation must never be retried automatically. */
        }
        setSubmission({ status: "uncertain", matches });
      } else setSubmission({ status: "error", message: contractError(error) });
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div className="contracts-feature">
      <WorkspacePage
        title="قرارداد جدید"
        icon="file"
        lede="ثبت انشعاب، معرفی نیروگاه و پیگیری تأیید شرکت؛ همه در مسیر همین قرارداد، تا انتخاب پلن و بررسی پیش‌نویس."
      >
        <Link href="/panel/contracts" className="contract-back">
          <Icon name="arrow" className="size-4" />
          بازگشت به قراردادها
        </Link>
        <IdentityNotice />

        <div className="contract-create-layout">
          <ol className="contract-stepper" aria-label="مراحل ایجاد پیش‌نویس">
            {STEPS.map((label, index) => (
              <li key={label} aria-current={currentStage === index + 1 ? "step" : undefined} data-complete={currentStage > index + 1}>
                <span>{index < currentStage - 1 ? <Icon name="check" /> : (index + 1).toLocaleString("fa-IR")}</span>
                <em>{label}</em>
              </li>
            ))}
          </ol>

          <section className="contract-create-stage" aria-busy={pending}>
            <header className="contract-stage-header">
              <p className="contract-stage-kicker">مرحلهٔ {currentStage.toLocaleString("fa-IR")} از ۵</p>
              <h2 ref={heading} tabIndex={-1}>
                {stageTitle(step, sitePhase)}
              </h2>
            </header>

            {step === 1 ? (
              <ContractSiteStage
                phase={sitePhase}
                onPhaseChange={(phase) => {
                  if (phase !== sitePhase) {
                    setSitePhase(phase);
                    heading.current?.focus();
                  }
                }}
                onReady={(option) => {
                  setSelectedPlant(option);
                  go(2);
                }}
              />
            ) : null}

            {step === 2 ? (
              plans.state.status === "loading" ? (
                <LoadingCards label="دریافت پلن‌های فعال…" />
              ) : plans.state.status === "error" ? (
                <ContractError message={plans.state.message} retry={plans.reload} />
              ) : !plans.state.data.results.some((plan) => plan.active) ? (
                <ContractEmpty title="در حال حاضر پلن فعالی در این صفحه وجود ندارد">
                  <p>کمی بعد دوباره بررسی کنید یا با پشتیبانی در ارتباط باشید.</p>
                  <Button variant="secondary" onClick={plans.reload}>
                    دریافت دوباره
                  </Button>
                </ContractEmpty>
              ) : (
                <>
                  <fieldset className="contract-plan-board">
                    <legend className="sr-only">انتخاب پلن فروش</legend>
                    {plans.state.data.results
                      .filter((plan) => plan.active)
                      .map((plan) => (
                        <PlanTile key={plan.uuid} plan={plan} selected={selectedPlan?.uuid === plan.uuid} onSelect={() => setSelectedPlan(plan)} />
                      ))}
                  </fieldset>
                  <ContractPagination page={planPage} {...plans.state.data} onChange={setPlanPage} />
                  <Button variant="ghost" onClick={() => { setSelectedPlan(undefined); plans.reload(); }}>
                    تازه‌سازی پلن‌های فعال
                  </Button>
                </>
              )
            ) : null}

            {step === 3 && selectedPlant && selectedPlan ? (
              <div className="contract-final-review">
                <div className="contract-final-review-head">
                  <span className="contract-review-label">
                    <Icon name="eye" />
                    مرور اطلاعات پیش‌نویس
                  </span>
                  <h3>{selectedPlant.plant.name}</h3>
                </div>
                <dl className="contract-spec-board">
                  <div>
                    <dt>پلن انتخابی</dt>
                    <dd>{selectedPlan.name}</dd>
                  </div>
                  <div>
                    <dt>شماره کنتور</dt>
                    <dd>
                      <bdi dir="ltr">{selectedPlant.branch?.meter}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>نرخ خرید هر kWh</dt>
                    <dd>
                      <bdi dir="ltr">{formatDecimal(selectedPlan.rate)}</bdi> تومان
                    </dd>
                  </div>
                  <div>
                    <dt>تعهد انرژی</dt>
                    <dd>
                      <bdi dir="ltr">{formatDecimal(selectedPlan.commitment)}</bdi> <bdi dir="ltr">kWh</bdi>
                    </dd>
                  </div>
                  <div className="contract-spec-wide">
                    <dt>نشانی انشعاب تأییدشده</dt>
                    <dd>{selectedPlant.branch?.address}</dd>
                  </div>
                </dl>
                <p className="contract-note">
                  با ساخت پیش‌نویس، نرخ و تعهد انتخابی در قرارداد ذخیره می‌شوند. این اقدام امضا یا ارسال به شرکت نیست. تغییر پلن پیش‌نویس از طریق API فعلی ممکن نیست.
                </p>
                <div className="contract-feedback contract-feedback-warning">
                  <Icon name="lock" className="size-5" />
                  <p>سند نهاییِ نسخه‌بندی‌شده هنوز ارائه نشده؛ پیش‌نویس را می‌توانید بسازید، اما ارسال امضا فعلاً فعال نیست.</p>
                </div>
              </div>
            ) : null}

            {submission.status === "error" ? <ContractError message={submission.message} /> : null}
            {submission.status === "uncertain" ? (
              <div className="contract-feedback contract-feedback-warning" role="alert">
                <Icon name="clock" className="size-5 shrink-0" />
                <div>
                  <strong>نتیجهٔ درخواست ساخت مشخص نیست</strong>
                  <p>
                    برای جلوگیری از ساخت تکراری، درخواست خودکار دیگری نفرستادیم. ابتدا فهرست را بررسی کنید؛ موارد زیر فقط قراردادهای مشابه‌اند، نه تأیید موفقیت همین درخواست.
                  </p>
                  {submission.matches.map((contract) => (
                    <Link key={contract.uuid} href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}>
                      بررسی قرارداد مشابه · <bdi dir="ltr">{contract.uuid.slice(0, 8)}</bdi>
                    </Link>
                  ))}
                  <ButtonLink href="/panel/contracts" variant="secondary" className="mt-3">
                    بررسی فهرست قراردادها
                  </ButtonLink>
                </div>
              </div>
            ) : null}

            {step > 1 ? (
              <footer className="contract-stage-actions">
                <Button variant="secondary" disabled={pending || submission.status === "uncertain"} onClick={() => go(step === 3 ? 2 : 1)}>
                  مرحلهٔ قبل
                </Button>
                <span role="status">{pending ? "در حال ساخت پیش‌نویس…" : `مرحلهٔ ${currentStage.toLocaleString("fa-IR")} از ۵`}</span>
                {step < 3 ? (
                  <Button disabled={step === 1 ? !selectedPlant || Boolean(eligibility(selectedPlant)) : !selectedPlan} onClick={() => go(step === 1 ? 2 : 3)}>
                    ادامه
                    <Icon name="chevron" className="size-4" />
                  </Button>
                ) : (
                  <Button disabled={pending || submission.status === "uncertain"} onClick={() => { void submit(); }}>
                    <Icon name="plus" className="size-4" />
                    {pending ? "در حال ثبت…" : "ساخت پیش‌نویس"}
                  </Button>
                )}
              </footer>
            ) : null}
          </section>
        </div>
      </WorkspacePage>
    </div>
  );
}
