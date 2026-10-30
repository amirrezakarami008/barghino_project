"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Alert, ButtonLink, Card, EmptyState, Skeleton, StatusPill } from "@/components/ui";
import { useAuth } from "@/features/auth/session-provider";
import { getContracts } from "@/features/contracts/contracts-api";
import { contractStatusMeta } from "@/features/contracts/status-map";
import { useContractResource } from "@/features/contracts/use-contract-resource";
import { getPlants } from "@/features/plants/plants-api";
import { usePlantInventory } from "@/features/plants/use-plant-inventory";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import type { Contract } from "@/features/contracts/contract-model";

function greetingName(first?: string, last?: string) {
  const name = [first, last].filter(Boolean).join(" ");
  return name || "کاربر برقینو";
}

function nextAction(contracts: readonly Contract[], plantPending: boolean, plantRejected: boolean) {
  if (plantRejected) {
    return {
      title: "نیروگاه یا انشعاب رد شده است",
      body: "دلیل رد را ببینید، اطلاعات را اصلاح کنید و دوباره برای بررسی بفرستید.",
      href: "/panel/contracts/new",
      cta: "اصلاح و ادامه مسیر",
    };
  }
  if (plantPending) {
    return {
      title: "انشعاب یا نیروگاه در انتظار بررسی است",
      body: "پس از تأیید شرکت می‌توانید پلن را انتخاب و پیش‌نویس بسازید.",
      href: "/panel/contracts/new",
      cta: "پیگیری وضعیت بررسی",
    };
  }
  const draft = contracts.find((item) => item.status === "draft");
  if (draft) {
    return {
      title: "یک پیش‌نویس ناتمام دارید",
      body: "شرایط ذخیره‌شده را مرور کنید. امضا وقتی سند رسمی آماده شود فعال می‌شود.",
      href: `/panel/contracts/${encodeURIComponent(draft.uuid)}`,
      cta: "مشاهده پیش‌نویس",
    };
  }
  const pending = contracts.find((item) => item.status === "pending");
  if (pending) {
    return {
      title: "قرارداد در انتظار بررسی شرکت است",
      body: "نتیجهٔ بررسی در جزئیات قرارداد و تاریخچه رویدادها دیده می‌شود.",
      href: `/panel/contracts/${encodeURIComponent(pending.uuid)}`,
      cta: "جزئیات قرارداد",
    };
  }
  if (!contracts.length) {
    return {
      title: "پلن انتخاب کنید و پیش‌نویس بسازید",
      body: "مسیر از ثبت انشعاب و نیروگاه شروع می‌شود؛ ساخت پیش‌نویس به‌معنی امضا یا خرید برق نیست.",
      href: "/panel/contracts/new",
      cta: "شروع قرارداد",
    };
  }
  return {
    title: "همه‌چیز به‌روز است",
    body: "از قراردادها و نیروگاه‌ها وضعیت واقعی حساب را دنبال کنید.",
    href: "/panel/contracts",
    cta: "قراردادهای من",
  };
}

export function PanelHome() {
  const { profile } = useAuth();
  const loadContracts = useCallback((signal: AbortSignal) => getContracts(1, signal), []);
  const contracts = useContractResource("panel-home-contracts", loadContracts);
  const plants = usePlantInventory(1, 1);

  const contractData = contracts.state.status === "ready" ? contracts.state.data : null;
  const plantData = plants.state.status === "ready" ? plants.state.data : null;
  const plantPending = Boolean(
    plantData?.plants.results.some((item) => item.status === "pending") ||
      plantData?.branches.results.some((item) => item.status === "pending"),
  );
  const plantRejected = Boolean(
    plantData?.plants.results.some((item) => item.status === "inactive") ||
      plantData?.branches.results.some((item) => item.status === "inactive"),
  );
  const action = nextAction(contractData?.results ?? [], plantPending, plantRejected);
  const loading = contracts.state.status === "loading" || plants.state.status === "loading";
  const error =
    (contracts.state.status === "error" && contracts.state.message) ||
    (plants.state.status === "error" && plants.state.message) ||
    null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <p className="text-caption text-foreground-muted">فضای کار</p>
        <h2 className="text-h2">سلام، {greetingName(profile?.firstName, profile?.lastName)}</h2>
        <p className="text-body text-foreground-muted">
          آمار زیر فقط از دادهٔ واقعی حساب شماست — بدون عدد نمونه.
        </p>
      </header>

      {error ? (
        <Alert tone="danger" title="دریافت اطلاعات کامل نشد">
          {error}
        </Alert>
      ) : null}

      <Card variant="gradient-border">
        <p className="text-caption font-semibold text-accent">گام بعدی</p>
        <h3 className="mt-2 text-h3">{action.title}</h3>
        <p className="mt-2 text-sm leading-7 text-foreground-muted">{action.body}</p>
        <ButtonLink href={action.href} className="mt-5">
          {action.cta}
          <Icon name="arrow" className="size-4 -scale-x-100" />
        </ButtonLink>
      </Card>

      <section aria-label="آمار واقعی" className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Stat label="قراردادها" value={contractData ? faNumber(contractData.count) : "—"} href="/panel/contracts" />
            <Stat
              label="نیروگاه‌ها"
              value={plantData ? faNumber(plantData.plants.count) : "—"}
              href="/panel/plant"
            />
            <Stat
              label="پیش‌نویس‌های باز"
              value={
                contractData
                  ? faNumber(contractData.results.filter((item) => item.status === "draft").length)
                  : "—"
              }
              href="/panel/contracts?status=draft"
              hint="در صفحهٔ فعلی فهرست"
            />
          </>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-h4">میانبرها</h3>
          <ul className="mt-4 grid gap-2">
            <Shortcut href="/panel/contracts/new" label="قرارداد جدید" icon="plus" />
            <Shortcut href="/panel/contracts" label="قراردادهای من" icon="file" />
            <Shortcut href="/panel/plant" label="نیروگاه من" icon="solarPanel" />
            <Shortcut href="/panel/profile" label="پروفایل" icon="user" />
          </ul>
        </Card>
        <Card>
          <h3 className="text-h4">آخرین قراردادها</h3>
          {loading ? (
            <Skeleton className="mt-4 h-24" />
          ) : !contractData?.results.length ? (
            <EmptyState
              className="mt-4 border-0 shadow-none"
              title="قراردادی نیست"
              description="با ساخت پیش‌نویس مسیر فروش را شروع کنید."
              action={<ButtonLink href="/panel/contracts/new">شروع قرارداد</ButtonLink>}
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {contractData.results.slice(0, 3).map((contract) => {
                const meta = contractStatusMeta(contract.status);
                return (
                  <li key={contract.uuid}>
                    <Link
                      href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {contract.plantName || "قرارداد بدون نام نیروگاه"}
                        </span>
                        <span className="text-caption text-foreground-muted">
                          {contract.planName || "پلن ثبت نشده"}
                        </span>
                      </span>
                      <StatusPill status={meta.tone} label={meta.label} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string;
  href: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-card p-5 shadow-soft transition-shadow duration-fast ease-out hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <p className="text-caption text-foreground-muted">{label}</p>
      <p className="mt-2 text-h2 tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-caption text-foreground-muted">{hint}</p> : null}
    </Link>
  );
}

function Shortcut({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "plus" | "file" | "solarPanel" | "user";
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm font-semibold hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="grid size-9 place-items-center rounded-md bg-surface text-foreground">
          <Icon name={icon} className="size-4" />
        </span>
        {label}
      </Link>
    </li>
  );
}
