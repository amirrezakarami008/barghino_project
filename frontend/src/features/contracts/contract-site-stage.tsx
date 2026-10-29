"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { getBranches, getPlants, getBranch, getPlant, PlantRegistrationForm, type Branch, type Plant, type Registration, type RegistrationResult } from "@/features/plants";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { ContractEmpty, ContractError, ContractPagination } from "./contract-ui";
import { formatDecimal, type PlantOption } from "./contract-model";
import { useContractResource } from "./use-contract-resource";
import "@/features/plants/plants.css";

export type SitePhase = 1 | 2 | 3;
type Props = { readonly phase: SitePhase; readonly onPhaseChange: (phase: SitePhase) => void; readonly onReady: (option: PlantOption) => void };

function statusLabel(value: string): string {
  return value === "active"
    ? "تأییدشده"
    : value === "pending"
      ? "در انتظار بررسی شرکت"
      : value === "inactive"
        ? "تأیید نشده"
        : value === "maintenance"
          ? "در حال تعمیر"
          : "وضعیت نامشخص";
}

function statusTone(value: string): string {
  return value === "active" ? "emerald" : value === "pending" ? "amber" : value === "inactive" ? "coral" : "neutral";
}

function contractOption(plant: Plant, branch: Branch): PlantOption {
  return {
    plant: {
      uuid: plant.uuid,
      name: plant.name,
      branchUuid: plant.branch_uuid,
      capacity: plant.capacity_kwp,
      status: plant.status,
      reviewNote: plant.review_note,
    },
    branch: {
      uuid: branch.uuid,
      name: branch.name,
      meter: branch.meter_number,
      address: branch.address,
      status: branch.status,
    },
  };
}

export function ContractSiteStage({ phase, onPhaseChange, onReady }: Props): ReactElement {
  const search = useSearchParams();
  const [selection, setSelection] = useState(() => ({ branchId: search.get("branch") ?? "", plantId: search.get("plant") ?? "" }));
  const { branchId, plantId } = selection;
  const [branchPage, setBranchPage] = useState(1);
  const [plantPage, setPlantPage] = useState(1);
  const [registration, setRegistration] = useState<Registration>();
  const [notice, setNotice] = useState("");
  const load = useCallback(async (signal: AbortSignal) => {
    const [branches, plants] = await Promise.all([getBranches(branchPage, signal), getPlants(plantPage, signal)]);
    return { branches, plants };
  }, [branchPage, plantPage]);
  const loadSelection = useCallback(async (signal: AbortSignal) => {
    const [branch, plant] = await Promise.all([
      branchId ? getBranch(branchId, signal) : Promise.resolve(undefined),
      plantId ? getPlant(plantId, signal) : Promise.resolve(undefined),
    ]);
    return { branch, plant };
  }, [branchId, plantId]);
  const { state, reload, refreshing, refreshError } = useContractResource(`contract-site:${branchPage}:${plantPage}`, load);
  const selected = useContractResource(`contract-site-selection:${branchId}:${plantId}`, loadSelection);
  const reloadSelection = selected.reload;

  function refresh(): void {
    reload();
    reloadSelection();
  }

  useEffect(() => {
    function visible(): void {
      if (document.visibilityState === "visible") {
        reload();
        reloadSelection();
      }
    }
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [reload, reloadSelection]);

  function select(branch: string, plant: string, next: SitePhase): void {
    setSelection({ branchId: branch, plantId: plant });
    const params = new URLSearchParams(window.location.search);
    if (branch) params.set("branch", branch);
    else params.delete("branch");
    if (plant) params.set("plant", plant);
    else params.delete("plant");
    window.history.replaceState(null, "", `/panel/contracts/new${params.size ? `?${params}` : ""}`);
    setRegistration(undefined);
    onPhaseChange(next);
  }

  function saved(message: string, result: RegistrationResult): void {
    setNotice(message);
    setBranchPage(1);
    setPlantPage(1);
    if (result.kind === "branch") select(result.item.uuid, registration?.item ? plantId : "", registration?.item ? phase : 2);
    else select(result.item.branch_uuid, result.item.uuid, 3);
    refresh();
  }

  if (state.status === "loading") return <LoadingCards label="دریافت مراحل ثبت و بررسی نیروگاه…" />;
  if (state.status === "error") {
    return (
      <>
        <ContractError message={state.message} retry={reload} />
        <Button variant="secondary" onClick={() => select("", "", 1)}>
          بازگشت به انتخاب انشعاب
        </Button>
      </>
    );
  }

  const { branches, plants } = state.data;
  const branch = selected.state.status === "ready" ? selected.state.data.branch : branches.results.find((entry) => entry.uuid === branchId);
  const plant = selected.state.status === "ready" ? selected.state.data.plant : plants.results.find((entry) => entry.uuid === plantId);
  const matchingPlants = plants.results.filter((item) => item.branch_uuid === branchId);
  const linked = branch && plant && plant.branch_uuid === branch.uuid;
  const approved = linked && branch.status === "active" && plant.status === "active" && selected.state.status === "ready" && !selected.refreshing && !selected.refreshError;

  return (
    <div className="contract-site-stage">
      {notice ? (
        <p className="plant-success" role="status">
          <Icon name="check" className="size-5" />
          {notice}
        </p>
      ) : null}
      {refreshError ? <ContractError message={refreshError} retry={refresh} /> : null}
      {selected.state.status === "error" ? (
        <ContractError message={selected.state.message} retry={reloadSelection} />
      ) : selected.refreshError ? (
        <ContractError message={selected.refreshError} retry={reloadSelection} />
      ) : null}

      {registration ? (
        <PlantRegistrationForm
          key={`${registration.kind}:${registration.item?.uuid ?? "new"}`}
          registration={registration}
          branches={branch ? [branch] : branches.results}
          onSaved={saved}
          onClose={() => {
            setRegistration(undefined);
            refresh();
          }}
        />
      ) : (
        <>
          {phase === 1 ? (
            <>
              <div className="contract-intake-heading">
                <p>انشعاب برق را انتخاب کنید یا همین‌جا ثبت کنید. اطلاعات پس از ثبت برای بررسی شرکت ارسال می‌شود.</p>
                <Button onClick={() => setRegistration({ kind: "branch" })}>
                  <Icon name="plus" className="size-4" />
                  ثبت انشعاب
                </Button>
              </div>
              {!branches.results.length ? (
                <ContractEmpty title="قرارداد را با ثبت انشعاب شروع کنید" icon="home">
                  <p>نام انشعاب، شماره کنتور و نشانی را ثبت کنید؛ سپس نیروگاه را روی همین انشعاب معرفی کنید.</p>
                </ContractEmpty>
              ) : (
                <fieldset className="contract-select-list">
                  <legend className="sr-only">انتخاب انشعاب قرارداد</legend>
                  {branches.results.map((entry) => (
                    <label key={entry.uuid} className={`contract-select-card contract-tone-${statusTone(entry.status)}`} data-selected={branchId === entry.uuid}>
                      <input
                        type="radio"
                        name="contract-branch"
                        checked={branchId === entry.uuid}
                        onChange={() => select(entry.uuid, entry.uuid === branchId ? plantId : "", 1)}
                      />
                      <span className="contract-select-mark" aria-hidden="true">
                        <Icon name="home" />
                      </span>
                      <span className="contract-select-body">
                        <span className="contract-select-title">
                          <strong>{entry.name}</strong>
                          <small className={`contract-inline-status contract-tone-${statusTone(entry.status)}`}>{statusLabel(entry.status)}</small>
                        </span>
                        <span>
                          شماره کنتور: <bdi dir="ltr">{entry.meter_number}</bdi>
                        </span>
                        <span>{entry.address}</span>
                        {entry.review_note ? <span className="contract-select-note">{entry.review_note}</span> : null}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {branches.next || branches.previous ? <ContractPagination page={branchPage} {...branches} onChange={setBranchPage} /> : null}
              <div className="contract-stage-actions">
                <ButtonLink href="/panel/contracts" variant="secondary">
                  انصراف
                </ButtonLink>
                <Button disabled={!branch} onClick={() => onPhaseChange(2)}>
                  ادامه به نیروگاه
                </Button>
              </div>
            </>
          ) : null}

          {phase === 2 ? (
            !branch ? (
              <ContractEmpty title="ابتدا انشعاب این قرارداد را انتخاب کنید">
                <Button onClick={() => onPhaseChange(1)}>انتخاب انشعاب</Button>
              </ContractEmpty>
            ) : (
              <>
                <div className="contract-intake-heading">
                  <div>
                    <p>
                      انشعاب انتخابی: <strong>{branch.name}</strong> · <bdi dir="ltr">{branch.meter_number}</bdi>
                    </p>
                    <p className="contract-note">نیروگاه را به همین انشعاب متصل کنید؛ لازم نیست برای ثبت نیروگاه منتظر تأیید انشعاب بمانید.</p>
                  </div>
                  <Button onClick={() => setRegistration({ kind: "plant" })}>
                    <Icon name="plus" className="size-4" />
                    ثبت نیروگاه
                  </Button>
                </div>
                {!matchingPlants.length ? (
                  <ContractEmpty title="نیروگاه متصل به این انشعاب در این صفحه ثبت نشده" icon="solarPanel">
                    <p>با «ثبت نیروگاه»، نام، ظرفیت و نشانی آن را در همین مسیر وارد کنید.</p>
                  </ContractEmpty>
                ) : (
                  <fieldset className="contract-select-list">
                    <legend className="sr-only">انتخاب نیروگاه قرارداد</legend>
                    {matchingPlants.map((entry) => (
                      <label key={entry.uuid} className={`contract-select-card contract-tone-${statusTone(entry.status)}`} data-selected={plantId === entry.uuid}>
                        <input type="radio" name="contract-plant" checked={plantId === entry.uuid} onChange={() => select(branch.uuid, entry.uuid, 2)} />
                        <span className="contract-select-mark" aria-hidden="true">
                          <Icon name="solarPanel" />
                        </span>
                        <span className="contract-select-body">
                          <span className="contract-select-title">
                            <strong>{entry.name}</strong>
                            <small className={`contract-inline-status contract-tone-${statusTone(entry.status)}`}>{statusLabel(entry.status)}</small>
                          </span>
                          <span>
                            <bdi dir="ltr">{formatDecimal(entry.capacity_kwp)} kWp</bdi>
                          </span>
                          <span>{entry.address}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
                {plants.next || plants.previous ? (
                  <>
                    <p className="contract-note">نیروگاه‌های متصل به این انشعاب فقط در صفحهٔ فعلی نمایش داده می‌شوند.</p>
                    <ContractPagination page={plantPage} {...plants} onChange={setPlantPage} />
                  </>
                ) : null}
                <div className="contract-stage-actions">
                  <Button variant="secondary" onClick={() => onPhaseChange(1)}>
                    مرحلهٔ انشعاب
                  </Button>
                  <Button disabled={!linked} onClick={() => onPhaseChange(3)}>
                    ادامه به بررسی شرکت
                  </Button>
                </div>
              </>
            )
          ) : null}

          {phase === 3 ? (
            !linked ? (
              <ContractEmpty title="انشعاب و نیروگاه این قرارداد را مشخص کنید">
                <Button onClick={() => onPhaseChange(branch ? 2 : 1)}>بازگشت به انتخاب</Button>
              </ContractEmpty>
            ) : (
              <>
                <div className={`contract-feedback ${approved ? "contract-feedback-approved" : "contract-feedback-warning"}`} role="status">
                  <Icon name={approved ? "check" : "clock"} className="size-5" />
                  <div>
                    <strong>{approved ? "انشعاب و نیروگاه تأیید شده‌اند" : "مرحلهٔ بررسی شرکت"}</strong>
                    <p>
                      {approved
                        ? "می‌توانید پلن را انتخاب و پیش‌نویس قرارداد را بسازید."
                        : "اطلاعات ثبت شده است؛ پس از تأیید هر دو مورد، انتخاب پلن و ساخت پیش‌نویس فعال می‌شود. می‌توانید خارج شوید و بعداً همین مسیر را ادامه دهید."}
                    </p>
                  </div>
                </div>
                <div className="contract-site-review">
                  {(
                    [
                      { kind: "branch" as const, item: branch, title: "انشعاب", icon: "home" as const },
                      { kind: "plant" as const, item: plant, title: "نیروگاه", icon: "solarPanel" as const },
                    ]
                  ).map((entry) => (
                    <article key={entry.kind} className={`contract-review-tile contract-tone-${statusTone(entry.item.status)}`}>
                      <div className="contract-review-tile-head">
                        <span className="contract-select-mark">
                          <Icon name={entry.icon} />
                        </span>
                        <div>
                          <h3>
                            {entry.title}: {entry.item.name}
                          </h3>
                          <small className={`contract-inline-status contract-tone-${statusTone(entry.item.status)}`}>{statusLabel(entry.item.status)}</small>
                        </div>
                      </div>
                      <p>{entry.item.address}</p>
                      {entry.item.review_note ? <p className="plant-warning">نتیجهٔ بررسی: {entry.item.review_note}</p> : null}
                      <Button
                        variant="secondary"
                        onClick={() => setRegistration(entry.kind === "branch" ? { kind: "branch", item: branch } : { kind: "plant", item: plant })}
                      >
                        اصلاح اطلاعات {entry.title}
                      </Button>
                    </article>
                  ))}
                </div>
                <p className="contract-note">
                  اصلاح مشخصات تأییدشده، آن‌ها را به بررسی دوباره می‌فرستد. تغییر انشعاب، نیروگاه‌های متصل را نیز نیازمند تأیید مجدد می‌کند.
                </p>
                <Button variant="secondary" disabled={refreshing || selected.refreshing} onClick={refresh}>
                  {refreshing || selected.refreshing ? "در حال بررسی…" : "بررسی دوبارهٔ تأیید شرکت"}
                </Button>
                <div className="contract-stage-actions">
                  <Button variant="secondary" onClick={() => onPhaseChange(2)}>
                    مرحلهٔ نیروگاه
                  </Button>
                  <Button
                    disabled={!approved || refreshing}
                    onClick={() => {
                      if (approved) onReady(contractOption(plant, branch));
                    }}
                  >
                    ادامه و انتخاب پلن
                  </Button>
                </div>
              </>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
