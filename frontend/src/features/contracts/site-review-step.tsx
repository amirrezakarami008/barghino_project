"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import {
  AlertSlot,
  Button,
  Skeleton,
  StatusPill,
  useToast,
} from "@/components/ui";
import { getBranch, getPlant, type Branch, type Plant } from "@/features/plants";
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
      setLastFetchedAt(Date.now());
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
      setFlashKeys(nextFlash);
      window.setTimeout(() => setFlashKeys(new Set()), 700);
    }
    prevStatuses.current = { branch: branch.status, plant: plant.status };
  }, [branch, plant, toast]);

  useEffect(() => {
    if (bothApproved && !celebrated.current) {
      celebrated.current = true;
      setCelebrate(true);
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
        <Skeleton className="h-12" />
        <div className="site-review-chain">
          <Skeleton className="h-40" />
          <Skeleton className="h-8 w-10 justify-self-center" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-28" />
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
    continueToPlan: () => {
      if (approvedForContinue) onReady(readyOption);
    },
  };

  const alerts = selectSiteReviewAlerts({
    state: {
      branch,
      plant,
      branchApproved: Boolean(branchApproved),
      plantBlocked: Boolean(plantBlocked),
      bothApproved,
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

  function renderCard(input: {
    kind: "branch" | "plant";
    title: string;
    icon: IconName;
    name: string;
    details: string[];
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
              <h3 className="site-review-card__title">
                {input.title}: {input.name}
              </h3>
              <div className="site-review-card__details">
                {input.details.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
          </div>
          <StatusPill status={input.meta.tone} label={input.meta.label} />
        </div>

        {input.blockedNote ? <p className="site-review-blocked">{input.blockedNote}</p> : null}

        <p className="site-review-card__action">{input.actionLine}</p>

        {input.onEdit ? (
          <Button variant="secondary" size="sm" onClick={input.onEdit}>
            اصلاح اطلاعات
          </Button>
        ) : null}
      </article>
    );
  }

  return (
    <div className="site-review">
      <div className="site-review-toolbar">
        <p className="site-review-updated" role="status">
          آخرین بروزرسانی: {relativeUpdate(lastFetchedAt)}
          {resource.refreshing ? " · در حال دریافت…" : ""}
        </p>
        <Button variant="secondary" size="sm" disabled={resource.refreshing} onClick={reload}>
          {resource.refreshing ? "در حال بروزرسانی…" : "بروزرسانی وضعیت"}
        </Button>
      </div>

      {resource.refreshError ? (
        <ContractError message={resource.refreshError} retry={reload} />
      ) : null}

      <div className="site-review-chain" aria-label="وابستگی انشعاب و نیروگاه">
        {renderCard({
          kind: "branch",
          title: "انشعاب",
          icon: "home",
          name: branch.name,
          details: [`کنتور ${branch.meter_number}`, branch.address],
          statusAttr: branch.status,
          meta: branchMeta,
          actionLine: lastActionLine(branch),
          onEdit: branch.status === "inactive" ? actions.editBranch : undefined,
        })}

        <div className="site-review-connector" data-state={connectorState} aria-hidden>
          <div className="site-review-connector__line" />
          <span className="site-review-connector__label">
            {connectorState === "ready" ? "انشعاب تأیید شد" : "وابستگی"}
          </span>
        </div>

        {renderCard({
          kind: "plant",
          title: "نیروگاه",
          icon: "solarPanel",
          name: plant.name,
          details: [`${plant.capacity_kwp} کیلووات`, plant.address],
          statusAttr: plantBlocked ? "blocked" : plant.status,
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
        <AlertSlot placement="review-next" alerts={alerts} />
      </div>

      <div className="site-review-actions">
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

      <p className="text-caption text-foreground-muted">
        اصلاح مشخصات تأییدشده یا ردشده، آن‌ها را دوباره به بررسی می‌فرستد. کاربر نمی‌تواند چیزی را تأیید کند.
      </p>

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
