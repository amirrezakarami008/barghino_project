"use client";

import { useCallback, useEffect, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  LockedFeature,
  Skeleton,
  StatusPill,
  Timeline,
} from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { getContract } from "./contracts-api";
import { formatDecimal, localDate, signedSnapshot, type Contract, type Identity } from "./contract-model";
import { ContractError } from "./contract-ui";
import { contractStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import { IdentityNotice } from "./identity-notice";
import { SignaturePreview } from "./signature-preview";

export function ContractDetail(): ReactElement {
  const { uuid } = useParams<{ uuid: string }>();
  const load = useCallback((signal: AbortSignal) => getContract(uuid, signal), [uuid]);
  const { state, reload, refreshing, refreshError } = useContractResource(`contract:${uuid}`, load);

  useEffect(() => {
    function visible(): void {
      if (document.visibilityState === "visible") reload();
    }
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [reload]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      {refreshError ? (
        <Alert tone="warning" title="اطلاعات تازه نشد">
          آخرین دادهٔ دریافت‌شده را می‌بینید. {refreshError}
        </Alert>
      ) : null}

      {state.status === "loading" ? (
        <Skeleton className="h-64" />
      ) : state.status === "error" ? (
        <ContractError message={state.message} retry={reload} />
      ) : (
        <ContractContents contract={state.data} />
      )}
    </div>
  );
}

function ContractContents({ contract }: { readonly contract: Contract }): ReactElement {
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
      <Card variant="gradient-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <StatusPill status={meta.tone} label={meta.label} />
            <h2 className="mt-3 text-h2">{plant.name || "قرارداد فروش برق"}</h2>
            <p className="mt-2 text-sm text-foreground-muted">{meta.next}</p>
            <p className="mt-2 text-caption text-foreground-muted">
              شناسه · <bdi dir="ltr">{contract.uuid}</bdi>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
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
      </Card>

      {contract.status === "cancelled" || contract.reviewDecision === "rejected" ? (
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
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <h3 className="text-h4">خلاصه</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="پلن" value={terms.planName || "ثبت نشده"} />
              <Field
                label="ظرفیت نیروگاه"
                value={`${formatDecimal(plant.capacity)} kWp`}
              />
              <Field label="نیروگاه" value={plant.name || "ثبت نشده"} />
              <Field label="شماره کنتور" value={branch.meter || "ثبت نشده"} dir="ltr" />
              <Field label="نشانی انشعاب" value={branch.address || "ثبت نشده"} wide />
            </dl>
            <h4 className="mt-6 text-h4">فروشنده</h4>
            <SellerIdentity value={seller} />
          </Card>

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
            <Card>
              <h3 className="text-h4">ردپای امضای ثبت‌شده</h3>
              <SignaturePreview key={contract.signatureUuid} uuid={contract.signatureUuid} />
            </Card>
          ) : null}
        </div>

        <Card>
          <h3 className="text-h4">تاریخچه رویدادها</h3>
          <div className="mt-4">
            <Timeline events={timelineEvents} />
          </div>
        </Card>
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
    <div className={wide ? "rounded-md bg-surface p-3 sm:col-span-2" : "rounded-md bg-surface p-3"}>
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
