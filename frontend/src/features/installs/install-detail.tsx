"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  ConfirmDialog,
  Skeleton,
  StatusPill,
  Timeline,
  useToast,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { formatIranMobile } from "@/features/auth/lib/phone";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import {
  getInstallRequest,
  installError,
  mutationMayHaveSucceeded,
  removeInstallMedia,
  submitInstallRequest,
} from "./installs-api";
import {
  formatArea,
  formatBytes,
  formatMoney,
  localDate,
  type InstallRequest,
} from "./install-model";
import { installStatusMeta } from "./status-map";
import { useInstallResource } from "./use-install-resource";
import { InstallError } from "./install-ui";
import "./installs-workspace.css";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function InstallDetail(): ReactElement {
  return <InstallDetailInner />;
}

function InstallDetailInner(): ReactElement {
  const { uuid } = useParams<{ uuid: string }>();
  const reduceMotion = useReducedMotion();
  const load = useCallback((signal: AbortSignal) => getInstallRequest(uuid, signal), [uuid]);
  const { state, reload, refreshing, refreshError, replaceData } = useInstallResource(
    `install:${uuid}`,
    load,
  );

  useEffect(() => {
    function visible(): void {
      if (document.visibilityState === "visible") reload();
    }
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [reload]);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
      };

  return (
    <motion.div className="installs-workspace mx-auto max-w-5xl" {...motionProps}>
      <motion.div className="installs-page-header" variants={reduceMotion ? undefined : fadeUp}>
        <Link
          href="/panel/install"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <Icon name="arrow" className="size-4" />
          بازگشت به فهرست
        </Link>
        <Button variant="secondary" size="sm" disabled={refreshing} onClick={reload}>
          {refreshing ? "در حال دریافت…" : "تازه‌سازی"}
        </Button>
      </motion.div>

      {refreshError ? (
        <Alert tone="warning" title="اطلاعات تازه نشد">
          آخرین دادهٔ دریافت‌شده را می‌بینید. {refreshError}
        </Alert>
      ) : null}

      {state.status === "loading" ? (
        <div className="grid gap-4">
          <Skeleton className="h-40 rounded-[22px]" />
          <Skeleton className="h-72 rounded-[22px]" />
        </div>
      ) : state.status === "error" ? (
        <InstallError message={state.message} retry={reload} />
      ) : (
        <InstallContents
          request={state.data}
          reduceMotion={Boolean(reduceMotion)}
          onServerChange={replaceData}
        />
      )}
    </motion.div>
  );
}

function InstallContents({
  request,
  reduceMotion,
  onServerChange,
}: {
  readonly request: InstallRequest;
  readonly reduceMotion: boolean;
  readonly onServerChange: (request: InstallRequest) => void;
}): ReactElement {
  const meta = installStatusMeta(request.stage);
  const { push: toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isDraft = request.stage === "draft";

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const submitted = await submitInstallRequest(request.uuid);
      onServerChange(submitted);
      toast({ tone: "success", title: "درخواست ارسال شد." });
      setConfirmSubmit(false);
    } catch (error) {
      if (mutationMayHaveSucceeded(error)) {
        setActionError("پاسخ سرور نامشخص است. صفحه را تازه‌سازی کنید.");
      } else {
        setActionError(installError(error));
      }
    } finally {
      setBusy(false);
    }
  }

  async function onRemoveMedia(mediaUuid: string) {
    if (busy) return;
    setBusy(true);
    setRemovingId(mediaUuid);
    setActionError(null);
    try {
      await removeInstallMedia(request.uuid, mediaUuid);
      onServerChange({
        ...request,
        media: request.media.filter((item) => item.uuid !== mediaUuid),
      });
      toast({ tone: "info", title: "تصویر حذف شد." });
    } catch (error) {
      setActionError(installError(error));
    } finally {
      setBusy(false);
      setRemovingId(null);
    }
  }

  const timelineEvents = request.history.map((event) => ({
    id: event.uuid,
    title: historyTitle(event.event, event.toStage),
    description: event.fromStage
      ? `از «${installStatusMeta(event.fromStage).label}» به «${installStatusMeta(event.toStage).label}»`
      : installStatusMeta(event.toStage).label,
    time: localDate(event.createdAt),
    tone: installStatusMeta(event.toStage).tone,
  }));

  return (
    <>
      <motion.section className="installs-detail-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={meta.tone} label={meta.label} />
              <span className="text-caption text-foreground-muted">{meta.next}</span>
            </div>
            <h2 className="mt-3 text-h2 tracking-tight">جزئیات درخواست نصب</h2>
          </div>
          <PanelArt
            name={request.stage === "submitted" ? "installs/success" : "installs/document"}
            width={96}
            height={96}
            className="installs-section-art"
          />
        </div>
        <div className="installs-detail-facts">
          <div>
            <span>شناسه</span>
            <strong className="dir-ltr text-start text-xs">{request.uuid}</strong>
          </div>
          <div>
            <span>ایجاد</span>
            <strong>{localDate(request.createdAt)}</strong>
          </div>
          <div>
            <span>مرحله</span>
            <strong>{meta.label}</strong>
          </div>
          <div>
            <span>مساحت</span>
            <strong>{formatArea(request.areaM2)} متر مربع</strong>
          </div>
        </div>
      </motion.section>

      {actionError ? (
        <Alert tone="danger" title="عملیات کامل نشد">
          {actionError}
        </Alert>
      ) : null}

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-section-head">
          <div>
            <h3 className="text-base font-extrabold">محل و تماس</h3>
            <p className="mt-1 text-sm text-foreground-muted">اطلاعات ثبت‌شده برای بازدید و هماهنگی.</p>
          </div>
          <PanelArt name="installs/location" width={80} height={80} className="installs-section-art" />
        </div>
        <div className="installs-detail-facts !mt-0">
          <div className="sm:col-span-2">
            <span>نشانی</span>
            <strong>{request.address}</strong>
          </div>
          <div>
            <span>موبایل</span>
            <strong className="dir-ltr text-start">{formatIranMobile(request.phone)}</strong>
          </div>
          <div>
            <span>مساحت</span>
            <strong>{formatArea(request.areaM2)} متر مربع</strong>
          </div>
        </div>
      </motion.section>

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <h3 className="text-base font-extrabold">یادداشت</h3>
        <p className="mt-3 text-sm leading-7 text-foreground-muted">
          {request.note.trim() ? request.note : "یادداشتی ثبت نشده است."}
        </p>
      </motion.section>

      {(request.visitAt ||
        request.proposalCapacityKwp ||
        request.proposalCostToman !== null ||
        request.visitSummary) && (
        <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
          <h3 className="text-base font-extrabold">بازدید و پیشنهاد</h3>
          <div className="installs-detail-facts">
            {request.visitAt ? (
              <div>
                <span>زمان بازدید</span>
                <strong>{localDate(request.visitAt)}</strong>
              </div>
            ) : null}
            {request.proposalCapacityKwp ? (
              <div>
                <span>ظرفیت پیشنهادی</span>
                <strong>{formatArea(request.proposalCapacityKwp)} کیلووات‌پیک</strong>
              </div>
            ) : null}
            {request.proposalPanelCount !== null ? (
              <div>
                <span>تعداد پنل</span>
                <strong>{faNumber(request.proposalPanelCount)}</strong>
              </div>
            ) : null}
            {request.proposalCostToman !== null ? (
              <div>
                <span>هزینه پیشنهادی</span>
                <strong>{formatMoney(request.proposalCostToman)} تومان</strong>
              </div>
            ) : null}
          </div>
          {request.visitSummary ? (
            <p className="mt-3 text-sm leading-7 text-foreground-muted">{request.visitSummary}</p>
          ) : null}
        </motion.section>
      )}

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-section-head">
          <div>
            <h3 className="text-base font-extrabold">تصاویر پیوست‌شده</h3>
            <p className="mt-1 text-sm text-foreground-muted">{faNumber(request.media.length)} فایل</p>
          </div>
        </div>
        {request.media.length ? (
          <ul className="installs-media-grid">
            {request.media.map((item) => (
              <li key={item.uuid}>
                <figure className="installs-media-card">
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.originalName || "تصویر محل"} />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-surface text-caption text-foreground-muted">
                      بدون پیش‌نمایش
                    </div>
                  )}
                  {isDraft ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="installs-media-remove"
                      disabled={busy}
                      onClick={() => void onRemoveMedia(item.uuid)}
                    >
                      {removingId === item.uuid ? "…" : "حذف"}
                    </Button>
                  ) : null}
                  <figcaption>
                    <p className="truncate text-xs font-bold">{item.originalName || "فایل"}</p>
                    <p className="text-caption text-foreground-muted">{formatBytes(item.sizeBytes)}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-muted">هنوز تصویری پیوست نشده است.</p>
        )}
      </motion.section>

      {timelineEvents.length ? (
        <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
          <h3 className="mb-3 text-base font-extrabold">تاریخچه مراحل</h3>
          <Timeline events={timelineEvents} />
        </motion.section>
      ) : null}

      {isDraft ? (
        <motion.div className="installs-sticky-actions" variants={reduceMotion ? undefined : fadeUp}>
          <ButtonLink href="/panel/install/new" variant="secondary">
            درخواست جدید
          </ButtonLink>
          <Button type="button" disabled={busy} onClick={() => setConfirmSubmit(true)}>
            ارسال نهایی درخواست
          </Button>
        </motion.div>
      ) : (
        <motion.div className="installs-section text-center" variants={reduceMotion ? undefined : fadeUp}>
          <PanelArt name="installs/success" width={120} height={120} className="installs-empty-art mx-auto" />
          <p className="mt-3 text-sm font-semibold">درخواست شما ثبت شده و در صف بررسی است.</p>
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        title="ارسال نهایی درخواست؟"
        description="پس از ارسال، امکان ویرایش این پیش‌نویس وجود ندارد."
        confirmLabel={busy ? "در حال ارسال…" : "بله، ارسال شود"}
        cancelLabel="بعداً"
        pending={busy}
        onClose={() => !busy && setConfirmSubmit(false)}
        onConfirm={() => void onSubmit()}
      />
    </>
  );
}

function historyTitle(event: string, toStage: string): string {
  if (event === "created") return "ایجاد درخواست";
  if (event === "submitted") return "ارسال درخواست";
  return installStatusMeta(toStage).label;
}
