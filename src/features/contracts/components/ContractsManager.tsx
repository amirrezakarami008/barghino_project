"use client";

import {
  DashboardPage,
  EmptyState,
  Panel,
  PanelHeader,
} from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { CONTRACT_STATUS_FILTERS } from "../constants";
import { useContracts } from "../hooks/useContracts";
import { filterContracts, getContractStats, getExpiryNotifications } from "../lib/store";
import type { ContractStatus } from "../types";
import { ContractsTable } from "./ContractsTable";
import { useMemo, useState } from "react";

export function ContractsManager() {
  const { contracts } = useContracts();
  const [status, setStatus] = useState<ContractStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [roleOnly, setRoleOnly] = useState(true);

  const stats = useMemo(() => getContractStats(contracts), [contracts]);
  const expiryAlerts = useMemo(() => getExpiryNotifications(contracts), [contracts]);

  const filtered = useMemo(
    () =>
      filterContracts(contracts, {
        status,
        query,
        role: roleOnly ? DASHBOARD_USER.role : undefined,
      }),
    [contracts, status, query, roleOnly],
  );

  return (
    <DashboardPage
      title="قراردادها"
      subtitle="مدیریت قراردادهای فروش برق خانگی و نصب نیروگاه"
      action={
        <Button href="/dashboard/buy" size="sm" className="group">
          مسیر فروش برق
          <LinkArrow />
        </Button>
      }
    >
      {expiryAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {expiryAlerts.map((alert) => (
            <Panel key={alert.id} padding="sm" className="border-amber-200 bg-amber-50/60">
              <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900">{alert.title}</p>
                  <p className="text-xs text-amber-800">{alert.message}</p>
                </div>
                <Button href={`/dashboard/contracts/${alert.contractId}`} variant="outline" size="sm">
                  مشاهده
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل قراردادها", value: stats.total, tone: "text-slate-900" },
          { label: "فعال", value: stats.active, tone: "text-emerald-600" },
          { label: "در انتظار امضا", value: stats.pending, tone: "text-amber-600" },
          { label: "نزدیک انقضا", value: stats.expiresSoon, tone: "text-brand-600" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={cn("mt-1 font-display text-3xl font-extrabold", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {CONTRACT_STATUS_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                status === item.id
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={roleOnly}
              onChange={(event) => setRoleOnly(event.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            فقط مرتبط با حساب حقیقی
          </label>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو عنوان، نیروگاه یا نوع…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-brand-400 placeholder:text-slate-400 focus:ring-2 sm:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="قراردادی یافت نشد"
          description="با تغییر فیلتر یا جستجو دوباره امتحان کنید، یا مسیر فروش را شروع کنید."
          action={
            <Button href="/dashboard/buy" className="group">
              شروع فروش برق
              <LinkArrow />
            </Button>
          }
        />
      ) : (
        <Panel padding="sm">
          <div className="px-2 pt-2 sm:px-3 sm:pt-3">
            <PanelHeader title="فهرست قراردادها" description={`${filtered.length} مورد`} />
          </div>
          <ContractsTable contracts={filtered} />
        </Panel>
      )}
    </DashboardPage>
  );
}
