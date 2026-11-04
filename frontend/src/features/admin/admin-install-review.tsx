"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { Alert, Button, ConfirmDialog, Input, Select, Textarea } from "@/components/ui";
import { formatBytes, localDate } from "@/features/installs/install-model";
import { installStatusMeta } from "@/features/installs/status-map";
import { SCHEME_OPTIONS, SYSTEM_OPTIONS, type SchemeType, type SystemType } from "@/features/plants/plant-options";
import { faNumber } from "@/shared/lib/fa";
import {
  advanceInstallRequest,
  getInstallMediaContent,
  recordInstallProposal,
  scheduleInstallVisit,
  staffInstallError,
  type InstallAdvanceTarget,
} from "./admin-installs-api";
import type { ReviewHistoryEvent, ReviewItem, ReviewMedia } from "./reviews-api";
import "./admin-install-review.css";

type StaffAction = "visit" | "proposal" | "advance";

export function InstallReviewExtras({
  item,
  onSaved,
}: {
  readonly item: ReviewItem;
  readonly onSaved: (message: string) => void;
}): ReactElement {
  const [action, setAction] = useState<StaffAction>();

  return (
    <div className="space-y-5">
      {item.note?.trim() ? (
        <section className="grid gap-1">
          <h4 className="text-sm font-bold">یادداشت کاربر</h4>
          <p className="text-sm leading-7 text-foreground-muted">{item.note}</p>
        </section>
      ) : null}

      <InstallMediaGallery media={item.media ?? []} />

      {item.history?.length ? <InstallHistoryList events={item.history} /> : null}

      <section className="admin-install-actions">
        <h4 className="text-sm font-bold">اقدامات تکمیلی کارکنان</h4>
        <p className="text-caption text-foreground-muted">
          پس از بررسی رسانه می‌توانید بازدید، پیشنهاد فنی یا پیشبرد مرحله را ثبت کنید.
        </p>
        <div className="admin-install-actions-row">
          <Button variant="secondary" size="sm" onClick={() => setAction("visit")}>
            زمان‌بندی بازدید
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAction("proposal")}>
            ثبت پیشنهاد
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAction("advance")}>
            پیشبرد مرحله
          </Button>
        </div>
      </section>

      {action === "visit" ? (
        <VisitDialog
          item={item}
          onClose={() => setAction(undefined)}
          onSaved={() => {
            setAction(undefined);
            onSaved("زمان بازدید ثبت شد.");
          }}
        />
      ) : null}
      {action === "proposal" ? (
        <ProposalDialog
          item={item}
          onClose={() => setAction(undefined)}
          onSaved={() => {
            setAction(undefined);
            onSaved("پیشنهاد نصب ثبت شد.");
          }}
        />
      ) : null}
      {action === "advance" ? (
        <AdvanceDialog
          item={item}
          onClose={() => setAction(undefined)}
          onSaved={() => {
            setAction(undefined);
            onSaved("مرحله درخواست پیش برده شد.");
          }}
        />
      ) : null}
    </div>
  );
}

function InstallMediaGallery({ media }: { readonly media: readonly ReviewMedia[] }): ReactElement {
  if (!media.length) {
    return <p className="text-sm text-foreground-muted">رسانه‌ای برای بررسی پیوست نشده است.</p>;
  }

  return (
    <section className="grid gap-2">
      <h4 className="text-sm font-bold">رسانه‌های پیوست‌شده · {faNumber(media.length)}</h4>
      <ul className="admin-install-media-grid">
        {media.map((item) => (
          <li key={item.uuid}>
            <InstallMediaThumb item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function InstallMediaThumb({ item }: { readonly item: ReviewMedia }): ReactElement {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!attempt) return;
    const controller = new AbortController();
    let objectUrl = "";
    setState("loading");
    void getInstallMediaContent(item.storedFileUuid, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setMessage(staffInstallError(error));
        setState("error");
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attempt, item.storedFileUuid]);

  return (
    <figure className="admin-install-media-card">
      {state === "ready" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={item.originalName || "رسانه نصب"} />
      ) : (
        <button
          type="button"
          className="admin-install-media-load"
          disabled={state === "loading"}
          onClick={() => setAttempt((value) => value + 1)}
        >
          {state === "loading" ? "در حال دریافت…" : "مشاهده"}
        </button>
      )}
      <figcaption>
        <p className="truncate text-xs font-bold">{item.originalName || "فایل"}</p>
        <p className="text-caption text-foreground-muted">{formatBytes(item.sizeBytes)}</p>
        {state === "error" ? <p className="text-caption text-danger">{message}</p> : null}
      </figcaption>
    </figure>
  );
}

function InstallHistoryList({ events }: { readonly events: readonly ReviewHistoryEvent[] }): ReactElement {
  return (
    <section className="grid gap-2">
      <h4 className="text-sm font-bold">تاریخچه مراحل</h4>
      <ol className="admin-install-history">
        {events.map((event) => {
          const to = installStatusMeta(event.toStage);
          const from = event.fromStage ? installStatusMeta(event.fromStage).label : "";
          return (
            <li key={event.uuid}>
              <strong>{event.event || to.label}</strong>
              <span>
                {from ? `از «${from}» به «${to.label}»` : to.label} · {localDate(event.createdAt)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function VisitDialog({
  item,
  onClose,
  onSaved,
}: {
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [visitLocal, setVisitLocal] = useState(toDatetimeLocal(item.visitAt));
  const [reason, setReason] = useState("");

  async function confirm(): Promise<void> {
    if (inFlight.current) return;
    const visitAt = fromDatetimeLocal(visitLocal);
    if (!visitAt) {
      setError("زمان بازدید را انتخاب کنید.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await scheduleInstallVisit(item.uuid, { visitAt, reason: reason.trim() });
      onSaved();
    } catch (failure) {
      setError(staffInstallError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      onConfirm={() => {
        void confirm();
      }}
      title="زمان‌بندی بازدید"
      description={`برای «${item.title}» زمان بازدید میدانی ثبت می‌شود.`}
      confirmLabel="ثبت بازدید"
      pending={pending}
      confirmDisabled={!visitLocal}
      tone="primary"
    >
      <div className="grid gap-3">
        <Input
          label="زمان بازدید"
          type="datetime-local"
          value={visitLocal}
          onChange={(event) => setVisitLocal(event.target.value)}
          required
        />
        <Textarea
          label="یادداشت (اختیاری)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          maxLength={1000}
        />
        {error ? <Alert tone="danger" title={error} /> : null}
      </div>
    </ConfirmDialog>
  );
}

function ProposalDialog({
  item,
  onClose,
  onSaved,
}: {
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [capacityKwp, setCapacityKwp] = useState("");
  const [panelCount, setPanelCount] = useState("1");
  const [costToman, setCostToman] = useState("");
  const [monthlyKwh, setMonthlyKwh] = useState("");
  const [monthlyIncomeToman, setMonthlyIncomeToman] = useState("0");
  const [visitSummary, setVisitSummary] = useState(item.visitSummary ?? "");
  const [includeCatalogEstimate, setIncludeCatalogEstimate] = useState(false);

  async function confirm(): Promise<void> {
    if (inFlight.current) return;
    const panels = Number(panelCount);
    const cost = Number(costToman);
    const income = Number(monthlyIncomeToman);
    if (!/^\d+(\.\d+)?$/.test(capacityKwp.trim())) {
      setError("ظرفیت پیشنهادی را عددی وارد کنید.");
      return;
    }
    if (!Number.isFinite(panels) || panels < 1 || !Number.isInteger(panels)) {
      setError("تعداد پنل باید عدد صحیح و حداقل ۱ باشد.");
      return;
    }
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(income) || income < 0) {
      setError("مبالغ پیشنهادی را درست وارد کنید.");
      return;
    }
    if (!monthlyKwh.trim()) {
      setError("برآورد تولید ماهانه را وارد کنید.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await recordInstallProposal(item.uuid, {
        capacityKwp: capacityKwp.trim(),
        panelCount: panels,
        costToman: cost,
        monthlyKwh: monthlyKwh.trim(),
        monthlyIncomeToman: income,
        visitSummary: visitSummary.trim(),
        includeCatalogEstimate,
      });
      onSaved();
    } catch (failure) {
      setError(staffInstallError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      onConfirm={() => {
        void confirm();
      }}
      title="ثبت پیشنهاد نصب"
      description={`پیشنهاد فنی و مالی برای «${item.title}» ذخیره می‌شود.`}
      confirmLabel="ثبت پیشنهاد"
      pending={pending}
      tone="primary"
    >
      <div className="grid gap-3">
        <Input
          label="ظرفیت (kWp)"
          value={capacityKwp}
          onChange={(event) => setCapacityKwp(event.target.value)}
          inputMode="decimal"
          required
        />
        <Input
          label="تعداد پنل"
          type="number"
          min={1}
          step={1}
          value={panelCount}
          onChange={(event) => setPanelCount(event.target.value)}
          required
        />
        <Input
          label="هزینه (تومان)"
          type="number"
          min={0}
          step={1}
          value={costToman}
          onChange={(event) => setCostToman(event.target.value)}
          required
        />
        <Input
          label="تولید ماهانه (kWh)"
          value={monthlyKwh}
          onChange={(event) => setMonthlyKwh(event.target.value)}
          inputMode="decimal"
          required
        />
        <Input
          label="درآمد ماهانه (تومان)"
          type="number"
          min={0}
          step={1}
          value={monthlyIncomeToman}
          onChange={(event) => setMonthlyIncomeToman(event.target.value)}
        />
        <Textarea
          label="خلاصه بازدید"
          value={visitSummary}
          onChange={(event) => setVisitSummary(event.target.value)}
          rows={3}
          maxLength={2000}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeCatalogEstimate}
            onChange={(event) => setIncludeCatalogEstimate(event.target.checked)}
          />
          محاسبه برآورد از کاتالوگ تجهیزات
        </label>
        {error ? <Alert tone="danger" title={error} /> : null}
      </div>
    </ConfirmDialog>
  );
}

function AdvanceDialog({
  item,
  onClose,
  onSaved,
}: {
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<InstallAdvanceTarget>("contract");
  const [branchName, setBranchName] = useState("");
  const [billId, setBillId] = useState("");
  const [schemeType, setSchemeType] = useState<SchemeType>("residential");
  const [systemType, setSystemType] = useState<SystemType>("on_grid");

  async function confirm(): Promise<void> {
    if (inFlight.current) return;
    if (target === "contract" && (!branchName.trim() || !billId.trim())) {
      setError("برای ورود به قرارداد، نام انشعاب و شناسه قبض لازم است.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await advanceInstallRequest(item.uuid, {
        target,
        branchName: branchName.trim(),
        billId: billId.trim(),
        schemeType,
        systemType,
      });
      onSaved();
    } catch (failure) {
      setError(staffInstallError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      onConfirm={() => {
        void confirm();
      }}
      title="پیشبرد مرحله نصب"
      description={`درخواست «${item.title}» به مرحله انتخاب‌شده منتقل می‌شود.`}
      confirmLabel="اعمال پیشبرد"
      pending={pending}
      tone="primary"
    >
      <div className="grid gap-3">
        <Select
          label="مرحله مقصد"
          value={target}
          onChange={(event) => setTarget(event.target.value as InstallAdvanceTarget)}
          options={[
            { value: "contract", label: "قرارداد" },
            { value: "installation", label: "نصب" },
            { value: "active", label: "فعال‌سازی" },
          ]}
        />
        {target === "contract" ? (
          <>
            <Input
              label="نام انشعاب"
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
              required
            />
            <Input
              label="شناسه قبض"
              value={billId}
              onChange={(event) => setBillId(event.target.value)}
              required
            />
            <Select
              label="کاربری طرح"
              value={schemeType}
              onChange={(event) => setSchemeType(event.target.value as SchemeType)}
              options={SCHEME_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <Select
              label="اتصال شبکه"
              value={systemType}
              onChange={(event) => setSystemType(event.target.value as SystemType)}
              options={SYSTEM_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
          </>
        ) : null}
        {error ? <Alert tone="danger" title={error} /> : null}
      </div>
    </ConfirmDialog>
  );
}

function toDatetimeLocal(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}
