"use client";

import { useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Alert, ButtonLink, EmptyState, Skeleton, StatusPill } from "@/components/ui";
import { useAuth } from "@/features/auth/session-provider";
import { getContracts } from "@/features/contracts/contracts-api";
import { contractStatusMeta } from "@/features/contracts/status-map";
import { useContractResource } from "@/features/contracts/use-contract-resource";
import { usePlantInventory } from "@/features/plants/use-plant-inventory";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon, type IconName } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import type { Contract } from "@/features/contracts/contract-model";
import "./panel-home.css";

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

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function PanelHome() {
  const { profile } = useAuth();
  const reduceMotion = useReducedMotion();
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
    <motion.div className="panel-home" {...motionProps}>
      <motion.header className="panel-home-greeting" variants={reduceMotion ? undefined : fadeUp}>
        <p className="panel-home-kicker">فضای کار خورشیدی</p>
        <h2 className="text-h2 tracking-tight">سلام، {greetingName(profile?.firstName, profile?.lastName)}</h2>
        <p className="text-body text-foreground-muted">
          آمار زیر فقط از دادهٔ واقعی حساب شماست — بدون عدد نمونه.
        </p>
      </motion.header>

      {error ? (
        <Alert tone="danger" title="دریافت اطلاعات کامل نشد">
          {error}
        </Alert>
      ) : null}

      <motion.section className="panel-hero" variants={reduceMotion ? undefined : fadeUp} aria-label="گام بعدی">
        <div className="panel-hero-copy">
          <p className="panel-hero-eyebrow">گام بعدی</p>
          <h3 className="panel-hero-title">{action.title}</h3>
          <p className="panel-hero-body">{action.body}</p>
          <ButtonLink href={action.href} className="panel-hero-cta mt-5">
            {action.cta}
            <Icon name="arrow" className="size-4 -scale-x-100" />
          </ButtonLink>
        </div>
        <div className="panel-hero-art" aria-hidden>
          <PanelArt name="hero-solar" width={720} height={405} className="panel-hero-image" priority />
          <PanelArt name="decor-orb" width={120} height={120} className="panel-hero-orb" />
        </div>
      </motion.section>

      <section aria-label="آمار واقعی" className="panel-stat-grid">
        {loading ? (
          <>
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
          </>
        ) : (
          <>
            <StatCard
              label="قراردادها"
              value={contractData ? faNumber(contractData.count) : "—"}
              href="/panel/contracts"
              art="stat-contracts"
              tone="volt"
              reduceMotion={Boolean(reduceMotion)}
            />
            <StatCard
              label="انشعاب‌ها"
              value={plantData ? faNumber(plantData.branches.count) : "—"}
              href="/panel/branch"
              art="energy-bulb"
              tone="volt"
              reduceMotion={Boolean(reduceMotion)}
            />
            <StatCard
              label="نیروگاه‌ها"
              value={plantData ? faNumber(plantData.plants.count) : "—"}
              href="/panel/plant"
              art="stat-plants"
              tone="mint"
              reduceMotion={Boolean(reduceMotion)}
            />
          </>
        )}
      </section>

      <section className="panel-split">
        <motion.div className="panel-surface panel-shortcuts" variants={reduceMotion ? undefined : fadeUp}>
          <h3 className="text-h4">میانبرها</h3>
          <ul className="mt-4 grid gap-2">
            <Shortcut href="/panel/contracts/new" label="قرارداد جدید" icon="plus" tone="sun" />
            <Shortcut href="/panel/branch" label="انشعاب‌ها" icon="bolt" tone="volt" />
            <Shortcut href="/panel/plant" label="نیروگاه من" icon="solarPanel" tone="mint" />
            <Shortcut href="/panel/profile" label="پروفایل" icon="user" tone="sky" />
          </ul>
        </motion.div>

        <motion.div className="panel-surface" variants={reduceMotion ? undefined : fadeUp}>
          <h3 className="text-h4">آخرین قراردادها</h3>
          {loading ? (
            <Skeleton className="mt-4 h-28 rounded-xl" />
          ) : !contractData?.results.length ? (
            <div className="panel-empty-contracts mt-4">
              <PanelArt name="empty-contracts" width={160} height={160} className="panel-empty-art" />
              <EmptyState
                hideIcon
                className="border-0 bg-transparent p-0 shadow-none"
                title="قراردادی نیست"
                description="با ساخت پیش‌نویس مسیر فروش را شروع کنید."
                action={<ButtonLink href="/panel/contracts/new">شروع قرارداد</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {contractData.results.slice(0, 3).map((contract) => {
                const meta = contractStatusMeta(contract.status);
                return (
                  <li key={contract.uuid}>
                    <Link
                      href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}
                      className="panel-contract-row"
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
        </motion.div>
      </section>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  href,
  hint,
  art,
  tone,
  reduceMotion,
}: {
  label: string;
  value: string;
  href: string;
  hint?: string;
  art: string;
  tone: "sun" | "mint" | "volt";
  reduceMotion: boolean;
}) {
  return (
    <motion.div variants={reduceMotion ? undefined : fadeUp}>
      <Link href={href} className={cn("panel-stat-card", `panel-stat-card--${tone}`)}>
        <div className="panel-stat-copy">
          <p className="text-caption text-foreground-muted">{label}</p>
          <p className="panel-stat-value tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-caption text-foreground-muted">{hint}</p> : null}
        </div>
        <PanelArt name={art} width={112} height={112} className="panel-stat-art" />
      </Link>
    </motion.div>
  );
}

function Shortcut({
  href,
  label,
  icon,
  tone,
}: {
  href: string;
  label: string;
  icon: IconName;
  tone: "sun" | "volt" | "mint" | "sky";
}) {
  return (
    <li>
      <Link href={href} className="panel-shortcut">
        <span className={cn("panel-shortcut-icon", `panel-shortcut-icon--${tone}`)} aria-hidden>
          <Icon name={icon} className="size-4" />
        </span>
        {label}
      </Link>
    </li>
  );
}
