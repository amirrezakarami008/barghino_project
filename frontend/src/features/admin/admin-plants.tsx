"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  useToast,
  StatusPill,
  Select,
  Textarea,
} from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { schemeTypeLabel, systemTypeLabel } from "@/features/plants";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { AdminAuditLine } from "./admin-page";
import { AdminPlantForm } from "./admin-plant-form";
import { AdminPlantMonitoring } from "./admin-plant-monitoring";
import {
  adminPlantError,
  deleteAdminPlant,
  getAdminPlants,
  plantStatusLabel,
  plantStatusTone,
  reviewAdminPlant,
  uncertainPlantMutation,
  type AdminPlantStatus,
  type AdminPlant,
  type InventoryPage,
} from "./admin-plants-api";
import { rejectReasonMinLength } from "./reviews-api";
import "./admin-workspace.css";
import "./admin-plants-workspace.css";

type State =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: InventoryPage<AdminPlant> };

type Modal =
  | { readonly kind: "new" }
  | { readonly kind: "edit"; readonly plant: AdminPlant }
  | { readonly kind: "devices"; readonly plant: AdminPlant }
  | { readonly kind: "delete"; readonly plant: AdminPlant }
  | { readonly kind: "approve"; readonly plant: AdminPlant }
  | { readonly kind: "reject"; readonly plant: AdminPlant };

const REJECT_MIN = rejectReasonMinLength();

const STAGES = [
  { title: "ثبت روی انشعاب", body: "نیروگاه به انشعاب مالک وصل می‌شود." },
  { title: "صف بررسی", body: "وضعیت «در انتظار» برای تصمیم شرکت." },
  { title: "تأیید یا رد", body: "تأیید مالک را جلو می‌برد؛ رد دلیل می‌خواهد." },
  { title: "بورد و قرائت", body: "بعد از تأیید، بورد و تولید را مدیریت کنید." },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function nextHint(plant: AdminPlant): string {
  if (plant.status === "pending") return "این پرونده در صف بررسی است؛ تأیید یا رد را مشخص کنید.";
  if (plant.status === "active") return "نیروگاه تأیید شده؛ بوردهای متصل را مدیریت کنید.";
  if (plant.status === "inactive") return "رد یا غیرفعال شده؛ در صورت نیاز ویرایش و ارسال دوباره به بررسی.";
  if (plant.status === "maintenance") return "در حال تعمیر است؛ پس از آماده‌شدن وضعیت را به‌روز کنید.";
  return plant.lastAction;
}

function cardArt(status: string): string {
  if (status === "active") return "stat-plants";
  if (status === "pending") return "installs/document";
  if (status === "maintenance") return "installs/location";
  return "installs/empty";
}

export function AdminPlants(): ReactElement {
  const { push: toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminPlantStatus | "">("");
  const [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState<Modal>();
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const key = `${page}:${status}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const controller = new AbortController();
    void getAdminPlants(page, controller.signal, "", status || undefined)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: adminPlantError(failure) } });
        }
      });
    return () => controller.abort();
  }, [key, page, status, attempt]);

  function reload(): void {
    setAttempt((value) => value + 1);
  }

  function saved(message: string): void {
    toast({ tone: "success", title: message });
    setModal(undefined);
    setPage(1);
    reload();
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <>
      <motion.div className="admin-workspace admin-plants-workspace" {...motionProps}>
        <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
          <div className="min-w-0">
            <p className="admin-ws-hero-eyebrow">عملیات نیروگاه</p>
            <h2 className="admin-ws-hero-title">مدیریت نیروگاه‌های خورشیدی</h2>
            <p className="admin-ws-hero-body">
              از ثبت نیروگاه تا مدیریت بوردهای متصل.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" className="admin-ws-hero-cta" onClick={() => setModal({ kind: "new" })}>
                <Icon name="plus" className="size-4" />
                ثبت نیروگاه جدید
              </Button>
              <Button variant="secondary" onClick={reload}>
                تازه‌سازی
              </Button>
            </div>
          </div>
          <div className="admin-ws-hero-art">
            <PanelArt name="stat-plants" width={280} height={280} className="admin-ws-hero-image" />
          </div>
        </motion.section>

        <motion.ol className="admin-ws-stages" aria-label="مسیر بررسی نیروگاه" variants={reduceMotion ? undefined : fadeUp}>
          {STAGES.map((stage, index) => (
            <li key={stage.title} className="admin-ws-stage">
              <span className="admin-ws-stage-index" aria-hidden>
                {faNumber(index + 1)}
              </span>
              <strong>{stage.title}</strong>
              <p>{stage.body}</p>
            </li>
          ))}
        </motion.ol>

        <div className="admin-ws-toolbar">
          <Select
            label="وضعیت نیروگاه‌ها"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as AdminPlantStatus | "");
              setPage(1);
            }}
            options={[
              { value: "", label: "همهٔ وضعیت‌ها" },
              { value: "active", label: "فعال" },
              { value: "pending", label: "در انتظار بررسی" },
              { value: "maintenance", label: "در حال تعمیر" },
              { value: "inactive", label: "غیرفعال" },
            ]}
          />
        </div>

        {state.status === "ready" ? (
          <p className="admin-ws-result">{faNumber(state.data.count)} نیروگاه ثبت‌شده</p>
        ) : null}

        {state.status === "loading" ? (
          <div className="admin-ws-list">
            <Skeleton className="h-48 rounded-[26px]" />
            <Skeleton className="h-48 rounded-[26px]" />
          </div>
        ) : state.status === "error" ? (
          <Alert tone="danger" title={state.message}>
            <Button variant="secondary" className="mt-3" onClick={reload}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : !state.data.results.length ? (
          <motion.div className="admin-ws-empty" variants={reduceMotion ? undefined : fadeUp}>
            <PanelArt name="installs/empty" width={180} height={180} className="admin-ws-empty-art" />
            <EmptyState
              hideIcon
              className="border-0 bg-transparent p-0 shadow-none"
              title="هنوز نیروگاهی ثبت نشده"
              description="اولین نیروگاه را روی انشعاب موجود ثبت کنید تا وارد صف بررسی شود."
              action={
                <Button variant="primary" onClick={() => setModal({ kind: "new" })}>
                  <Icon name="plus" className="size-4" />
                  ثبت نیروگاه
                </Button>
              }
            />
          </motion.div>
        ) : (
          <ul className="admin-ws-list">
            {state.data.results.map((plant) => (
              <motion.li key={plant.uuid} variants={reduceMotion ? undefined : fadeUp}>
                <PlantCard
                  plant={plant}
                  onApprove={() => setModal({ kind: "approve", plant })}
                  onReject={() => setModal({ kind: "reject", plant })}
                  onMonitor={() => setModal({ kind: "devices", plant })}
                  onEdit={() => setModal({ kind: "edit", plant })}
                  onDelete={() => setModal({ kind: "delete", plant })}
                />
              </motion.li>
            ))}
          </ul>
        )}

        {state.status === "ready" && (state.data.next || state.data.previous) ? (
          <nav className="admin-ws-pager" aria-label="صفحه‌بندی نیروگاه‌ها">
            <Button
              variant="ghost"
              disabled={!state.data.previous}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              قبلی
            </Button>
            <span>صفحهٔ {faNumber(page)}</span>
            <Button variant="ghost" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>
              بعدی
            </Button>
          </nav>
        ) : null}
      </motion.div>

      {modal?.kind === "new" || modal?.kind === "edit" ? (
        <AdminPlantForm
          key={modal.kind === "edit" ? modal.plant.uuid : "new"}
          plant={modal.kind === "edit" ? modal.plant : undefined}
          onClose={(refresh) => {
            setModal(undefined);
            if (refresh) reload();
          }}
          onSaved={() => saved("نیروگاه ذخیره شد و به صف بررسی رفت.")}
        />
      ) : null}

      {modal?.kind === "devices" ? (
        <AdminPlantMonitoring key={modal.plant.uuid} plant={modal.plant} onClose={() => setModal(undefined)} />
      ) : null}

      {modal?.kind === "delete" ? (
        <DeletePlant
          plant={modal.plant}
          onClose={(refresh) => {
            setModal(undefined);
            if (refresh) reload();
          }}
          onSaved={() => saved("نیروگاه از فهرست حذف شد.")}
        />
      ) : null}

      {modal?.kind === "approve" || modal?.kind === "reject" ? (
        <ReviewPlant
          plant={modal.plant}
          decision={modal.kind === "approve" ? "approved" : "rejected"}
          onClose={() => setModal(undefined)}
          onSaved={(decision) =>
            saved(decision === "approved" ? "نیروگاه تأیید شد." : "نیروگاه با ثبت دلیل رد شد.")
          }
        />
      ) : null}
    </>
  );
}

function PlantCard({
  plant,
  onApprove,
  onReject,
  onMonitor,
  onEdit,
  onDelete,
}: {
  readonly plant: AdminPlant;
  readonly onApprove: () => void;
  readonly onReject: () => void;
  readonly onMonitor: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}): ReactElement {
  const pending = plant.status === "pending";

  return (
    <article className="admin-plants-card admin-ws-card" data-status={plant.status}>
      <div className="admin-ws-card-top">
        <div className="min-w-0">
          <div className="mb-2">
            <StatusPill status={plantStatusTone(plant.status)} label={plantStatusLabel(plant.status)} />
          </div>
          <h3 className="admin-ws-card-title">{plant.name}</h3>
          <p className="admin-ws-card-hint">{nextHint(plant)}</p>
        </div>
        <PanelArt name={cardArt(plant.status)} width={96} height={96} className="admin-plants-card-art" />
      </div>

      <div className="admin-ws-card-body is-split">
        <div className="admin-ws-metric" aria-label="ظرفیت نیروگاه">
          <span>ظرفیت نصب‌شده</span>
          <strong dir="ltr">{formatDecimal(plant.capacity_kwp)}</strong>
          <em>کیلووات‌پیک</em>
        </div>
        <div className="admin-plants-facts">
          <div className="admin-plants-fact">
            <span className="admin-plants-fact-icon" aria-hidden>
              <Icon name="phone" className="size-4" />
            </span>
            <p>
              <span className="label">مالک</span>
              <span className="value" dir="ltr">
                {plant.owner_phone || "—"}
              </span>
            </p>
          </div>
          <div className="admin-plants-fact">
            <span className="admin-plants-fact-icon admin-plants-fact-icon--mint" aria-hidden>
              <Icon name="solarPanel" className="size-4" />
            </span>
            <p>
              <span className="label">نشانی</span>
              <span className="value">{plant.address || "—"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="admin-ws-chips">
        <span className="admin-ws-chip">{schemeTypeLabel(plant.scheme_type)}</span>
        <span className="admin-ws-chip">{systemTypeLabel(plant.system_type)}</span>
      </div>

      <div className="admin-ws-card-foot">
        <AdminAuditLine text={plant.lastAction} />
        <div className="admin-ws-actions">
          {pending ? (
            <>
              <Button variant="primary" size="sm" onClick={onApprove}>
                تأیید
              </Button>
              <Button variant="danger" size="sm" onClick={onReject}>
                رد
              </Button>
              <Button variant="secondary" size="sm" onClick={onMonitor}>
                مدیریت بوردها
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={onMonitor}>
              مدیریت بوردها
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}

function ReviewPlant({
  plant,
  decision,
  onClose,
  onSaved,
}: {
  readonly plant: AdminPlant;
  readonly decision: "approved" | "rejected";
  readonly onClose: () => void;
  readonly onSaved: (decision: "approved" | "rejected") => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const confirmDisabled = pending || (decision === "rejected" && reason.trim().length < REJECT_MIN);

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => {
        if (inFlight.current || confirmDisabled) return;
        if (decision === "rejected" && reason.trim().length < REJECT_MIN) {
          setError(`دلیل رد باید حداقل ${faNumber(REJECT_MIN)} نویسه باشد و برای کاربر نمایش داده می‌شود.`);
          return;
        }
        inFlight.current = true;
        setPending(true);
        setError("");
        void reviewAdminPlant(plant.uuid, decision, decision === "rejected" ? reason.trim() : "")
          .then(() => onSaved(decision))
          .catch((failure) => setError(adminPlantError(failure)))
          .finally(() => {
            inFlight.current = false;
            setPending(false);
          });
      }}
      title={decision === "approved" ? "تأیید نیروگاه؟" : "رد نیروگاه"}
      description={
        decision === "approved"
          ? `«${plant.name}» تأیید می‌شود و وضعیت برای مالک به‌روز می‌گردد.`
          : `دلیل رد برای کاربر نمایش داده می‌شود (حداقل ${faNumber(REJECT_MIN)} نویسه).`
      }
      confirmLabel={decision === "approved" ? "تأیید نهایی" : "ثبت رد"}
      pending={pending}
      confirmDisabled={confirmDisabled}
      tone={decision === "approved" ? "primary" : "danger"}
    >
      <div className="space-y-3">
        <AdminAuditLine text={plant.lastAction} />
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-caption text-foreground-muted">مالک</dt>
            <dd>
              <bdi dir="ltr">{plant.owner_phone || "—"}</bdi>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-foreground-muted">ظرفیت</dt>
            <dd dir="ltr">{formatDecimal(plant.capacity_kwp)} kWp</dd>
          </div>
          <div>
            <dt className="text-caption text-foreground-muted">کاربری طرح</dt>
            <dd>{schemeTypeLabel(plant.scheme_type)}</dd>
          </div>
          <div>
            <dt className="text-caption text-foreground-muted">اتصال به شبکه</dt>
            <dd>{systemTypeLabel(plant.system_type)}</dd>
          </div>
          <div>
            <dt className="text-caption text-foreground-muted">نشانی</dt>
            <dd>{plant.address || "—"}</dd>
          </div>
        </dl>
        {decision === "rejected" ? (
          <Textarea
            label="دلیل رد"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={1000}
            required
            error={
              reason.trim().length > 0 && reason.trim().length < REJECT_MIN
                ? `حداقل ${faNumber(REJECT_MIN)} نویسه لازم است`
                : undefined
            }
            helperText={`${faNumber(reason.trim().length)} نویسه · حداقل ${faNumber(REJECT_MIN)}`}
          />
        ) : null}
        {error ? <Alert tone="danger" title={error} /> : null}
      </div>
    </ConfirmDialog>
  );
}

function DeletePlant({
  plant,
  onClose,
  onSaved,
}: {
  readonly plant: AdminPlant;
  readonly onClose: (refresh?: boolean) => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);

  return (
    <ConfirmDialog
      open
      onClose={() => onClose(uncertain)}
      onConfirm={() => {
        if (inFlight.current || uncertain) return;
        inFlight.current = true;
        setPending(true);
        setError("");
        void deleteAdminPlant(plant.uuid)
          .then(onSaved)
          .catch((failure) => {
            setError(adminPlantError(failure));
            setUncertain(uncertainPlantMutation(failure));
          })
          .finally(() => {
            inFlight.current = false;
            setPending(false);
          });
      }}
      title="حذف نرم نیروگاه؟"
      description={`«${plant.name}» از فهرست جاری حذف می‌شود. مالک: ${plant.owner_phone || "نامشخص"}`}
      confirmLabel={uncertain ? "بستن و بررسی فهرست" : "تأیید حذف"}
      pending={pending}
      tone="danger"
    >
      <AdminAuditLine text={plant.lastAction} />
      {error ? <Alert tone="danger" className="mt-3" title={error} /> : null}
    </ConfirmDialog>
  );
}
