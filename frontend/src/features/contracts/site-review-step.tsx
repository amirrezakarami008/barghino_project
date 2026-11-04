"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import {
  AlertSlot,
  Button,
  Skeleton,
  StatusPill,
  useToast,
} from "@/components/ui";
import {
  getBranch,
  getPlant,
  schemeTypeLabel,
  systemTypeLabel,
  type Branch,
  type Plant,
} from "@/features/plants";
import { PanelArt } from "@/features/panel/panel-art";
import { Icon, type IconName } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { ContractEmpty, ContractError } from "./contract-ui";
import { type PlantOption } from "./contract-model";
import { plantStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import {
  selectSiteReviewAlerts,
  type SiteReviewAlertActions,
} from "./site-review-alerts";
import { SiteReviewEditDrawer } from "./site-review-edit-drawer";
import type { Registration } from "@/features/plants";
import "./site-review.css";

type Props = {
  readonly branchId: string;
  readonly plantId: string;
  readonly onBack: () => void;
  readonly onReady: (option: PlantOption) => void;
};

type OverallState = "ready" | "pending" | "rejected" | "blocked";

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
      billId: branch.bill_id,
      address: branch.address,
      status: branch.status,
    },
  };
}

function formatWhen(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function lastActionLine(item: Branch | Plant): string {
  if (item.reviewed_at && item.review_decision) {
    const label =
      item.review_decision === "approved"
        ? "تأیید"
        : item.review_decision === "rejected"
          ? "رد"
          : item.review_decision;
    return `آخرین اقدام: ${label} · ${formatWhen(item.reviewed_at)}`;
  }
  if (item.updated_at) return `آخرین اقدام: به‌روزرسانی · ${formatWhen(item.updated_at)}`;
  if (item.created_at) return `آخرین اقدام: ثبت · ${formatWhen(item.created_at)}`;
  return "آخرین اقدام: هنوز ثبت نشده";
}

function reviewLabel(status: string): { tone: ReturnType<typeof plantStatusMeta>["tone"]; label: string } {
  if (status === "active") return { tone: "approved", label: "تأیید شده" };
  if (status === "pending") return { tone: "pending", label: "در انتظار بررسی" };
  if (status === "inactive") return { tone: "rejected", label: "رد شده" };
  return plantStatusMeta(status);
}

function relativeUpdate(at: number | null): string {
  if (!at) return "هنوز بروزرسانی نشده";
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 10) return "همین الان";
  if (seconds < 60) return `${faNumber(seconds)} ثانیه پیش`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${faNumber(minutes)} دقیقه پیش`;
  return formatWhen(new Date(at).toISOString());
}

function overallCopy(state: OverallState): {
  eyebrow: string;
  title: string;
  body: string;
  art: "contracts/approved" | "contracts/pending" | "contracts/rejected" | "contracts/agreement";
} {
  if (state === "ready") {
    return {
      eyebrow: "آمادهٔ ادامه",
      title: "انشعاب و نیروگاه تأیید شدند",
      body: "هر دو مورد از سوی شرکت تأیید شده‌اند. می‌توانید پلن فروش را انتخاب کنید.",
      art: "contracts/approved",
    };
  }
  if (state === "rejected") {
    return {
      eyebrow: "نیاز به اصلاح",
      title: "یکی از موارد رد شده است",
      body: "دلیل رد را بخوانید، اطلاعات را اصلاح کنید و دوباره برای بررسی بفرستید.",
      art: "contracts/rejected",
    };
  }
  if (state === "blocked") {
    return {
      eyebrow: "ترتیب بررسی",
      title: "ابتدا انشعاب باید تأیید شود",
      body: "بررسی نیروگاه تا تأیید انشعاب آغاز نمی‌شود. وضعیت انشعاب را پیگیری کنید.",
      art: "contracts/agreement",
    };
  }
  return {
    eyebrow: "صف بررسی شرکت",
    title: "در انتظار بررسی انشعاب و نیروگاه",
    body: "می‌توانید از این صفحه خارج شوید؛ وضعیت در «نیروگاه من» و همین مسیر قرارداد قابل مشاهده است.",
    art: "contracts/pending",
  };
}

function gateState(statusAttr: string): OverallState | "ready" {
  if (statusAttr === "active") return "ready";
  if (statusAttr === "inactive") return "rejected";
  if (statusAttr === "blocked") return "blocked";
  return "pending";
}

export function SiteReviewStep({ branchId, plantId, onBack, onReady }: Props): ReactElement {
  const { push: toast } = useToast();
  const [registration, setRegistration] = useState<Registration>();
  const [celebrate, setCelebrate] = useState(false);
  const [flashKeys, setFlashKeys] = useState<ReadonlySet<string>>(new Set());
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const prevStatuses = useRef<{ branch?: string; plant?: string }>({});
  const celebrated = useRef(false);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const [branch, plant] = await Promise.all([
        branchId ? getBranch(branchId, signal) : Promise.resolve(undefined),
        plantId ? getPlant(plantId, signal) : Promise.resolve(undefined),
      ]);
      return { branch, plant };
    },
    [branchId, plantId],
  );

  const resource = useContractResource(
    `site-review:${branchId}:${plantId}`,
    load,
  );
  const reload = resource.reload;

  const branch = resource.state.status === "ready" ? resource.state.data.branch : undefined;
  const plant = resource.state.status === "ready" ? resource.state.data.plant : undefined;
  const linked = Boolean(branch && plant && plant.branch_uuid === branch.uuid);
  const branchApproved = branch?.status === "active";
  const plantBlocked = Boolean(plant && branch && !branchApproved && plant.status !== "inactive");
  const bothApproved = Boolean(
    linked && branch?.status === "active" && plant?.status === "active",
  );
  const anyRejected = branch?.status === "inactive" || plant?.status === "inactive";
  const pendingReview = Boolean(
    linked &&
      !bothApproved &&
      !anyRejected &&
      (branch?.status === "pending" ||
        plant?.status === "pending" ||
        plantBlocked ||
        branch?.status === "maintenance" ||
        plant?.status === "maintenance"),
  );

  useEffect(() => {
    if (resource.state.status === "ready" && !resource.refreshing) {
      queueMicrotask(() => setLastFetchedAt(Date.now()));
    }
  }, [resource.state, resource.refreshing]);

  useEffect(() => {
    function onVisible(): void {
      if (document.visibilityState === "visible") reload();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  useEffect(() => {
    if (!pendingReview) return;
    const timer = window.setInterval(() => reload(), 30_000);
    return () => window.clearInterval(timer);
  }, [pendingReview, reload]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!branch || !plant) return;
    const prev = prevStatuses.current;
    const nextFlash = new Set<string>();
    if (prev.branch && prev.branch !== branch.status) {
      toast({ tone: "info", title: "وضعیت انشعاب بروزرسانی شد" });
      nextFlash.add("branch");
    }
    if (prev.plant && prev.plant !== plant.status) {
      toast({ tone: "info", title: "وضعیت نیروگاه بروزرسانی شد" });
      nextFlash.add("plant");
    }
    if (nextFlash.size) {
      queueMicrotask(() => {
        setFlashKeys(nextFlash);
        window.setTimeout(() => setFlashKeys(new Set()), 700);
      });
    }
    prevStatuses.current = { branch: branch.status, plant: plant.status };
  }, [branch, plant, toast]);

  useEffect(() => {
    if (bothApproved && !celebrated.current) {
      celebrated.current = true;
      queueMicrotask(() => setCelebrate(true));
      const timer = window.setTimeout(() => setCelebrate(false), 800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [bothApproved]);

  void tick;

  if (!branchId || !plantId) {
    return (
      <ContractEmpty title="انشعاب و نیروگاه این قرارداد را مشخص کنید">
        <Button onClick={onBack}>بازگشت به انشعاب و نیروگاه</Button>
      </ContractEmpty>
    );
  }

  if (resource.state.status === "loading") {
    return (
      <div className="site-review">
        <Skeleton className="h-40 rounded-[28px]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-[14px]" />
          <Skeleton className="h-16 rounded-[14px]" />
        </div>
        <div className="site-review-chain">
          <Skeleton className="h-56 rounded-[24px]" />
          <Skeleton className="h-8 w-10 justify-self-center" />
          <Skeleton className="h-56 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (resource.state.status === "error") {
    return <ContractError message={resource.state.message} retry={reload} />;
  }

  if (!linked || !branch || !plant) {
    return (
      <ContractEmpty title="انشعاب و نیروگاه این قرارداد را مشخص کنید">
        <Button onClick={onBack}>بازگشت به انشعاب و نیروگاه</Button>
      </ContractEmpty>
    );
  }

  const readyOption = contractOption(plant, branch);
  const approvedForContinue =
    bothApproved && !resource.refreshing && !resource.refreshError;

  const actions: SiteReviewAlertActions = {
    editBranch: () => setRegistration({ kind: "branch", item: branch }),
    editPlant: () => setRegistration({ kind: "plant", item: plant }),
  };

  const alerts = selectSiteReviewAlerts({
    state: {
      branch,
      plant,
      branchApproved: Boolean(branchApproved),
      plantBlocked: Boolean(plantBlocked),
      anyRejected: Boolean(anyRejected),
      pendingReview,
    },
    actions,
  });

  const branchMeta = reviewLabel(branch.status);
  const plantMeta = plantBlocked
    ? { tone: "draft" as const, label: "مسدود تا تأیید انشعاب" }
    : reviewLabel(plant.status);

  const connectorState = branchApproved
    ? "ready"
    : branch.status === "inactive"
      ? "blocked"
      : "waiting";

  const overallState: OverallState = bothApproved
    ? "ready"
    : anyRejected
      ? "rejected"
      : plantBlocked && branch.status !== "inactive"
        ? "blocked"
        : "pending";
  const hero = overallCopy(overallState);
  const branchStatusAttr = branch.status;
  const plantStatusAttr = plantBlocked ? "blocked" : plant.status;

  function renderCard(input: {
    kind: "branch" | "plant";
    kicker: string;
    title: string;
    icon: IconName;
    facts: ReadonlyArray<{ label: string; value: string }>;
    statusAttr: string;
    meta: { tone: ReturnType<typeof reviewLabel>["tone"]; label: string };
    actionLine: string;
    blockedNote?: string;
    onEdit?: () => void;
  }): ReactElement {
    return (
      <article
        className="site-review-card"
        data-status={input.statusAttr}
        data-flash={flashKeys.has(input.kind) ? "true" : undefined}
      >
        <div className="site-review-card__head">
          <div className="site-review-card__identity">
            <span className="site-review-card__icon" aria-hidden>
              <Icon name={input.blockedNote ? "lock" : input.icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="site-review-card__kicker">{input.kicker}</p>
              <h3 className="site-review-card__title">{input.title}</h3>
            </div>
          </div>
          <StatusPill status={input.meta.tone} label={input.meta.label} />
        </div>

        <div className="site-review-facts">
          {input.facts.map((fact) => (
            <div key={`${input.kind}-${fact.label}`}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>

        {input.blockedNote ? (
          <p className="site-review-blocked">
            <Icon name="lock" className="site-review-blocked__icon size-4" />
            <span>{input.blockedNote}</span>
          </p>
        ) : null}

        <div className="site-review-card__foot">
          <p className="site-review-card__action">{input.actionLine}</p>
          {input.onEdit ? (
            <Button variant="secondary" size="sm" onClick={input.onEdit}>
              <Icon name="edit" className="size-3.5" />
              اصلاح اطلاعات
            </Button>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <div className="site-review">
      <header
        className="site-review-hero"
        data-state={overallState}
        data-celebrate={celebrate ? "true" : undefined}
      >
        <div className="site-review-hero__copy">
          <p className="site-review-hero__eyebrow">{hero.eyebrow}</p>
          <h3 className="site-review-hero__title">{hero.title}</h3>
          <p className="site-review-hero__body">{hero.body}</p>
          <div className="site-review-hero__toolbar">
            <p className="site-review-updated" role="status">
              آخرین بروزرسانی: {relativeUpdate(lastFetchedAt)}
              {resource.refreshing ? " · در حال دریافت…" : ""}
            </p>
            <Button variant="secondary" size="sm" disabled={resource.refreshing} onClick={reload}>
              {resource.refreshing ? "در حال بروزرسانی…" : "بروزرسانی وضعیت"}
            </Button>
          </div>
        </div>
        <div className="site-review-hero__art">
          <PanelArt
            name={hero.art}
            width={200}
            height={200}
            className="site-review-hero__image"
          />
        </div>
      </header>

      {resource.refreshError ? (
        <ContractError message={resource.refreshError} retry={reload} />
      ) : null}

      <ol className="site-review-gates" aria-label="مراحل بررسی شرکت">
        <li className="site-review-gate" data-state={gateState(branchStatusAttr)}>
          <span className="site-review-gate__index" aria-hidden>
            {branchStatusAttr === "active" ? (
              <Icon name="check" className="size-3.5" />
            ) : (
              faNumber(1)
            )}
          </span>
          <span className="site-review-gate__body">
            <strong>انشعاب</strong>
            <span>{branchMeta.label}</span>
          </span>
          <span className="site-review-gate__glyph" aria-hidden>
            <Icon name="home" className="size-4" />
          </span>
        </li>
        <li className="site-review-gate" data-state={gateState(plantStatusAttr)}>
          <span className="site-review-gate__index" aria-hidden>
            {plantStatusAttr === "active" ? (
              <Icon name="check" className="size-3.5" />
            ) : plantBlocked ? (
              <Icon name="lock" className="size-3.5" />
            ) : (
              faNumber(2)
            )}
          </span>
          <span className="site-review-gate__body">
            <strong>نیروگاه</strong>
            <span>{plantMeta.label}</span>
          </span>
          <span className="site-review-gate__glyph" aria-hidden>
            <Icon name="solarPanel" className="size-4" />
          </span>
        </li>
      </ol>

      <div className="site-review-chain" aria-label="وابستگی انشعاب و نیروگاه">
        {renderCard({
          kind: "branch",
          kicker: "گام ۱ · انشعاب",
          title: branch.name,
          icon: "home",
          facts: [
            { label: "شناسه قبض", value: branch.bill_id },
            { label: "نشانی", value: branch.address },
          ],
          statusAttr: branchStatusAttr,
          meta: branchMeta,
          actionLine: lastActionLine(branch),
          onEdit: branch.status === "inactive" ? actions.editBranch : undefined,
        })}

        <div className="site-review-connector" data-state={connectorState} aria-hidden>
          <div className="site-review-connector__line" />
          <span className="site-review-connector__badge">
            <Icon
              name={connectorState === "ready" ? "check" : connectorState === "blocked" ? "close" : "clock"}
              className="size-3.5"
            />
          </span>
          <span className="site-review-connector__label">
            {connectorState === "ready"
              ? "انشعاب تأیید شد"
              : connectorState === "blocked"
                ? "مسیر متوقف"
                : "وابستگی بررسی"}
          </span>
        </div>

        {renderCard({
          kind: "plant",
          kicker: "گام ۲ · نیروگاه",
          title: plant.name,
          icon: "solarPanel",
          facts: [
            { label: "ظرفیت", value: `${plant.capacity_kwp} کیلووات` },
            { label: "کاربری طرح", value: schemeTypeLabel(plant.scheme_type) },
            { label: "اتصال شبکه", value: systemTypeLabel(plant.system_type) },
            ...(plant.address ? [{ label: "نشانی", value: plant.address }] : []),
          ],
          statusAttr: plantStatusAttr,
          meta: plantMeta,
          actionLine: plantBlocked
            ? "آخرین اقدام: بررسی هنوز آغاز نشده"
            : lastActionLine(plant),
          blockedNote: plantBlocked
            ? "بررسی نیروگاه پس از تأیید انشعاب آغاز می‌شود"
            : undefined,
          onEdit:
            plant.status === "inactive" && branchApproved ? actions.editPlant : undefined,
        })}
      </div>

      <div className="site-review-next" data-celebrate={celebrate ? "true" : undefined}>
        {bothApproved ? (
          <div className="site-review-ready" role="status">
            <p className="site-review-ready__title">مسیر برای انتخاب پلن باز است</p>
            <p className="site-review-ready__body">
              نرخ و تعهد پلن فقط در پیش‌نویس ذخیره می‌شود و به‌معنی امضا یا شروع خرید نیست.
            </p>
          </div>
        ) : (
          <AlertSlot placement="review-next" alerts={alerts} />
        )}
      </div>

      <div className="site-review-actions">
        <p className="site-review-actions__note">
          اصلاح مشخصات تأییدشده یا ردشده، آن‌ها را دوباره به بررسی می‌فرستد. کاربر نمی‌تواند چیزی را تأیید کند.
        </p>
        <div className="site-review-actions__buttons">
          <Button variant="secondary" onClick={onBack}>
            مرحلهٔ انشعاب و نیروگاه
          </Button>
          {bothApproved ? (
            <Button
              disabled={!approvedForContinue}
              onClick={() => {
                if (approvedForContinue) onReady(readyOption);
              }}
            >
              ادامه: انتخاب پلن
            </Button>
          ) : null}
        </div>
      </div>

      <SiteReviewEditDrawer
        registration={registration}
        branch={branch}
        onClose={() => setRegistration(undefined)}
        onSaved={(message) => {
          setRegistration(undefined);
          toast({ tone: "success", title: message });
          setFlashKeys(new Set(["branch", "plant"]));
          window.setTimeout(() => setFlashKeys(new Set()), 700);
          reload();
        }}
      />
    </div>
  );
}
