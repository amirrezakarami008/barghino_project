"use client";

import { useCallback, useEffect, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  LockedFeature,
  Skeleton,
  StatusPill,
  Timeline,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { Icon } from "@/shared/ui/icon";
import { getContract } from "./contracts-api";
import { formatDecimal, localDate, signedSnapshot, type Contract, type Identity } from "./contract-model";
import { ContractError } from "./contract-ui";
import { contractStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import { IdentityNotice } from "./identity-notice";
import { SignaturePreview } from "./signature-preview";
import "./contracts-workspace.css";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function statusArt(status: string): string {
  if (status === "pending") return "contracts/pending";
  if (status === "active") return "contracts/approved";
  if (status === "cancelled" || status === "expired") return "contracts/rejected";
  if (status === "draft") return "contracts/create";
  return "contracts/agreement";
}

export function ContractDetail(): ReactElement {
  const { uuid } = useParams<{ uuid: string }>();
  const reduceMotion = useReducedMotion();
  const load = useCallback((signal: AbortSignal) => getContract(uuid, signal), [uuid]);
  const { state, reload, refreshing, refreshError } = useContractResource(`contract:${uuid}`, load);

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
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        },
      };

  return (
    <motion.div className="contracts-workspace mx-auto max-w-5xl" {...motionProps}>
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3"
        variants={reduceMotion ? undefined : fadeUp}
      >
        <Link
          href="/panel/contracts"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <Icon name="arrow" className="size-4" />
          بازگشت به قراردادها
        </Link>
        <Button variant="secondary" disabled={refreshing} onClick={reload}>
          {refreshing ? "در حال دریافت…" : "تازه‌سازی وضعیت"}
        </Button>
      </motion.div>

      {refreshError ? (
        <Alert tone="warning" title="اطلاعات تازه نشد">
          آخرین دادهٔ دریافت‌شده را می‌بینید. {refreshError}
        </Alert>
      ) : null}

      {state.status === "loading" ? (
        <div className="grid gap-4">
          <Skeleton className="h-56 rounded-[28px]" />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="h-72 rounded-[22px]" />
            <Skeleton className="h-72 rounded-[22px]" />
          </div>
        </div>
      ) : state.status === "error" ? (
        <ContractError message={state.message} retry={reload} />
      ) : (
        <ContractContents contract={state.data} reduceMotion={Boolean(reduceMotion)} />
      )}
    </motion.div>
  );
}

function ContractContents({
  contract,
  reduceMotion,
}: {
  readonly contract: Contract;
  readonly reduceMotion: boolean;
}): ReactElement {
  const snapshot = signedSnapshot(contract);
  const hasSignedEvidence = Boolean(contract.signedAt || contract.history.some((event) => event.type === "signed"));
  const seller = snapshot?.seller ?? contract.seller;
  const plant = snapshot?.plant ?? { name: contract.plantName, uuid: contract.plantUuid, capacity: contract.capacity };
  const branch = snapshot?.branch ?? { meter: contract.meter, uuid: contract.branchUuid, address: contract.address };
  const terms = snapshot?.terms ?? {
    planName: contract.planName,
    rate: contract.rate,
    commitment: contract.commitment,
  };
  const meta = contractStatusMeta(contract.status);

  const timelineEvents = [
    {
      id: "created",
      title: "ایجاد پیش‌نویس",
      description: "شرایط پلن در قرارداد ذخیره شد.",
      time: localDate(contract.createdAt),
      tone: "draft" as const,
    },
    ...contract.history.map((event) => ({
      id: event.uuid,
      title:
        event.type === "signed"
          ? "ثبت امضای فروشنده"
          : event.type === "approved"
            ? "تأیید شرکت"
            : event.type === "rejected"
              ? "رد شرکت"
              : "تغییر ثبت‌شده",
      description: event.reason || undefined,
      time: localDate(event.createdAt),
      tone:
        event.type === "rejected"
          ? ("rejected" as const)
          : event.type === "approved"
            ? ("approved" as const)
            : ("pending" as const),
    })),
  ];

  return (
    <>
      <motion.section className="contracts-detail-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-start">
          <div>
            <StatusPill status={meta.tone} label={meta.label} />
            <h2 className="mt-3 text-h2 tracking-tight">{plant.name || "قرارداد فروش برق"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-foreground-muted">{meta.next}</p>
            <dl className="mt-4 grid gap-2 text-caption text-foreground-muted sm:grid-cols-2">
              <div>
                ایجاد · <time dateTime={contract.createdAt}>{localDate(contract.createdAt)}</time>
              </div>
              <div>
                به‌روزرسانی · <time dateTime={contract.updatedAt}>{localDate(contract.updatedAt)}</time>
              </div>
              <div className="sm:col-span-2">
                شناسه · <bdi dir="ltr">{contract.uuid}</bdi>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row md:flex-col">
            <PanelArt
              name={statusArt(contract.status)}
              width={140}
              height={140}
              className="mx-auto size-28 rounded-[22px] object-cover shadow-[var(--panel-float)] md:mx-0"
            />
            <div className="contracts-detail-terms text-sm">
              <p className="text-caption text-foreground-muted">شرایط مالی ذخیره‌شده</p>
              <p className="mt-2 font-bold tabular-nums">
                <bdi dir="ltr">{formatDecimal(terms.rate)}</bdi> تومان/kWh
              </p>
              <p className="mt-1 tabular-nums text-foreground-muted">
                تعهد · <bdi dir="ltr">{formatDecimal(terms.commitment)}</bdi> kWh
              </p>
              <p className="mt-2 text-caption text-foreground-muted">
                این مقادیر هنگام ساخت پیش‌نویس قفل شده‌اند.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {contract.status === "cancelled" || contract.reviewDecision === "rejected" ? (
        <motion.div variants={reduceMotion ? undefined : fadeUp}>
          <Alert tone="danger" title={contract.reviewDecision === "rejected" ? "دلیل رد شرکت" : "این نسخه بسته شده است"}>
            <p>
              {contract.reviewNote ||
                contract.history.find((event) => event.type === "rejected")?.reason ||
                "دلیلی در اطلاعات دریافتی ثبت نشده است."}
            </p>
            <ButtonLink href="/panel/contracts/new" variant="secondary" className="mt-3">
              ساخت پیش‌نویس جدید
            </ButtonLink>
          </Alert>
        </motion.div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <motion.section className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
            <div className="mb-4 flex items-center gap-3">
              <PanelArt
                name="contracts/agreement"
                width={64}
                height={64}
                className="size-14 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              />
              <div>
                <h3 className="text-h4">خلاصه قرارداد</h3>
                <p className="text-caption text-foreground-muted">اطلاعات ذخیره‌شده از پاسخ سرور</p>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="پلن" value={terms.planName || "ثبت نشده"} />
              <Field label="ظرفیت نیروگاه" value={`${formatDecimal(plant.capacity)} kWp`} />
              <Field label="نیروگاه" value={plant.name || "ثبت نشده"} />
              <Field label="شماره کنتور" value={branch.meter || "ثبت نشده"} dir="ltr" />
              <Field label="نشانی انشعاب" value={branch.address || "ثبت نشده"} wide />
            </dl>
            <h4 className="mt-6 text-h4">فروشنده</h4>
            <SellerIdentity value={seller} />
          </motion.section>

          {contract.status === "draft" ? (
            <>
              <IdentityNotice />
              <LockedFeature
                title="امضای قرارداد فعلاً غیرفعال است"
                description="گام امضا وقتی سند رسمی و نسخه‌بندی‌شدهٔ قرارداد آماده شود باز می‌شود. ساخت پیش‌نویس به‌معنی امضا یا شروع خرید برق نیست."
              />
            </>
          ) : null}

          {hasSignedEvidence && contract.signatureUuid ? (
            <motion.section className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
              <h3 className="text-h4">ردپای امضای ثبت‌شده</h3>
              <p className="mt-1 text-caption text-foreground-muted">فایل خصوصی فقط با احراز هویت دریافت می‌شود.</p>
              <div className="mt-4">
                <SignaturePreview key={contract.signatureUuid} uuid={contract.signatureUuid} />
              </div>
            </motion.section>
          ) : null}
        </div>

        <motion.section className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
          <h3 className="text-h4">تاریخچه رویدادها</h3>
          <p className="mt-1 text-caption text-foreground-muted">فقط رویدادهای واقعی ثبت‌شده در سرور</p>
          <div className="mt-4">
            <Timeline events={timelineEvents} />
          </div>
        </motion.section>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  wide,
  dir,
}: {
  label: string;
  value: string;
  wide?: boolean;
  dir?: "ltr";
}) {
  return (
    <div className={wide ? "contracts-field sm:col-span-2" : "contracts-field"}>
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd className="mt-1 font-semibold" dir={dir}>
        {dir === "ltr" ? <bdi dir="ltr">{value}</bdi> : value}
      </dd>
    </div>
  );
}

function SellerIdentity({ value }: { readonly value: Identity | null }): ReactElement {
  if (!value) {
    return <p className="mt-3 text-sm text-foreground-muted">مشخصات هویتی در پاسخ قرارداد موجود نیست.</p>;
  }
  const legal = value.kind === "legal";
  return (
    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
      <Field
        label={legal ? "نام شرکت" : "نام و نام خانوادگی"}
        value={
          legal
            ? value.company_name || "ثبت نشده"
            : [value.first_name, value.last_name].filter(Boolean).join(" ") || "ثبت نشده"
        }
      />
      <Field
        label={legal ? "شناسه ملی شرکت" : "کد ملی"}
        value={legal ? value.company_national_id || "ثبت نشده" : value.national_id || "ثبت نشده"}
        dir="ltr"
      />
    </dl>
  );
}
