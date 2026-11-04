"use client";

import { useCallback, useEffect, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  Skeleton,
  StatusPill,
  Timeline,
} from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { getContract } from "./contracts-api";
import { formatDecimal, localDate, signedSnapshot, type Contract, type Identity } from "./contract-model";
import { ContractError } from "./contract-ui";
import { ContractSignature } from "./contract-signature";
import { contractStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import { SignaturePreview } from "./signature-preview";
import "./contracts-workspace.css";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function ContractDetail(): ReactElement {
  const { uuid } = useParams<{ uuid: string }>();
  const reduceMotion = useReducedMotion();
  const load = useCallback((signal: AbortSignal) => getContract(uuid, signal), [uuid]);
  const { state, reload, refreshing, refreshError, replaceData } = useContractResource(
    `contract:${uuid}`,
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
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <motion.div className="contracts-workspace mx-auto max-w-5xl" {...motionProps}>
      <motion.div className="contracts-page-header" variants={reduceMotion ? undefined : fadeUp}>
        <Link
          href="/panel/contracts"
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
        <ContractError message={state.message} retry={reload} />
      ) : (
        <ContractContents
          contract={state.data}
          reduceMotion={Boolean(reduceMotion)}
          onServerChange={replaceData}
        />
      )}
    </motion.div>
  );
}

function ContractContents({
  contract,
  reduceMotion,
  onServerChange,
}: {
  readonly contract: Contract;
  readonly reduceMotion: boolean;
  readonly onServerChange: (contract: Contract) => void;
}): ReactElement {
  const snapshot = signedSnapshot(contract);
  const hasSignedEvidence = Boolean(contract.signedAt || contract.history.some((event) => event.type === "signed"));
  const seller = snapshot?.seller ?? contract.seller;
  const plant = snapshot?.plant ?? { name: contract.plantName, uuid: contract.plantUuid, capacity: contract.capacity };
  const branch = snapshot?.branch ?? { billId: contract.billId, uuid: contract.branchUuid, address: contract.address };
  const terms = snapshot?.terms ?? {
    planName: contract.planName,
    rate: contract.rate,
    commitment: contract.commitment,
  };
  const meta = contractStatusMeta(contract.status);
  const isDraft = contract.status === "draft";

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
      title: historyTitle(event.type),
      description: event.reason || undefined,
      time: localDate(event.createdAt),
      tone:
        event.type === "rejected" || event.type === "expired"
          ? ("rejected" as const)
          : event.type === "approved" || event.type === "renewed"
            ? ("approved" as const)
            : ("pending" as const),
    })),
  ];

  return (
    <>
      <motion.section className="contracts-detail-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={meta.tone} label={meta.label} />
          <span className="text-caption text-foreground-muted">{meta.next}</span>
        </div>
        <h2 className="mt-3 text-h2 tracking-tight">{plant.name || "قرارداد فروش برق"}</h2>
        <div className="contracts-detail-facts">
          <div>
            <span>پلن</span>
            <strong>{terms.planName || "—"}</strong>
          </div>
          <div>
            <span>نرخ</span>
            <strong className="tabular-nums">
              <bdi dir="ltr">{formatDecimal(terms.rate)}</bdi> تومان/kWh
            </strong>
          </div>
          <div>
            <span>تعهد</span>
            <strong className="tabular-nums">
              <bdi dir="ltr">{formatDecimal(terms.commitment)}</bdi> kWh
            </strong>
          </div>
          <div>
            <span>ظرفیت</span>
            <strong className="tabular-nums">{formatDecimal(plant.capacity)} kWp</strong>
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

      {contract.status === "pending" ? (
        <motion.div variants={reduceMotion ? undefined : fadeUp}>
          <Alert tone="info" title="در انتظار بررسی شرکت">
            امضا ثبت شد. تا تصمیم شرکت، وضعیت را از همین صفحه پیگیری کنید.
          </Alert>
        </motion.div>
      ) : null}

      {isDraft ? (
        <motion.div variants={reduceMotion ? undefined : fadeUp}>
          <ContractSignature contract={contract} onServerChange={onServerChange} />
        </motion.div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <motion.section className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
            <h3 className="text-h4">اطلاعات قرارداد</h3>
            <p className="mt-1 text-caption text-foreground-muted">خلاصه نیروگاه، انشعاب و فروشنده</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="نیروگاه" value={plant.name || "ثبت نشده"} />
              <Field label="شناسه قبض" value={branch.billId || "ثبت نشده"} dir="ltr" />
              <Field label="نشانی انشعاب" value={branch.address || "ثبت نشده"} wide />
            </dl>
            <h4 className="mt-5 text-sm font-bold">فروشنده</h4>
            <SellerIdentity value={seller} />
            {hasSignedEvidence && contract.signatureUuid ? (
              <div className="mt-5 border-t border-border pt-5">
                <h4 className="text-sm font-bold">تصویر امضای ثبت‌شده</h4>
                <div className="mt-3">
                  <SignaturePreview key={contract.signatureUuid} uuid={contract.signatureUuid} />
                </div>
              </div>
            ) : null}
          </motion.section>

          <motion.section className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
            <h3 className="text-h4">تاریخچه</h3>
            <p className="mt-1 text-caption text-foreground-muted">رویدادهای ثبت‌شده در سرور</p>
            <div className="mt-4">
              <Timeline events={timelineEvents} />
            </div>
          </motion.section>
        </div>
      )}
    </>
  );
}

function historyTitle(type: string): string {
  if (type === "signed") return "ثبت امضای فروشنده";
  if (type === "approved") return "تأیید شرکت";
  if (type === "rejected") return "رد شرکت";
  if (type === "renewal_requested") return "درخواست تمدید";
  if (type === "renewed") return "تمدید توسط شرکت";
  if (type === "expired") return "انقضای قرارداد";
  return "تغییر ثبت‌شده";
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
      <dd className="mt-1 font-semibold leading-6" dir={dir}>
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
      <Field
        label={legal ? "شماره شناسنامه نماینده" : "شماره شناسنامه"}
        value={
          (legal ? value.representative_birth_certificate_number : value.birth_certificate_number) ||
          "ثبت نشده"
        }
        dir="ltr"
      />
      <Field
        label={legal ? "تاریخ تولد نماینده" : "تاریخ تولد"}
        value={(legal ? value.representative_date_of_birth : value.date_of_birth) || "ثبت نشده"}
        dir="ltr"
      />
    </dl>
  );
}
