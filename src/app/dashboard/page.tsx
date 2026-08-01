import {
  DashboardPage,
  GovernmentComparePanel,
  HealthScorePanel,
  IncomeForecastPanel,
  MaintenanceAlertsPanel,
  MobileDataCard,
  Panel,
  PanelHeader,
  ProductionChart,
  QuickActions,
  ResponsiveTable,
  StatCard,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button, LinkArrow } from "@/shared/ui/Button";
import {
  CONTRACTS,
  DASHBOARD_STATS,
  DASHBOARD_USER,
  MONTHLY_PRODUCTION,
  NOTIFICATIONS,
  QUICK_ACTIONS,
  SELL_INVOICES,
  SOLAR_PLANTS,
} from "@/features/dashboard/constants";
import {
  getAllPlantHealth,
  getMaintenanceAlerts,
} from "@/features/dashboard/lib/assistant";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد" };

export default function DashboardOverviewPage() {
  const pendingInvoices = SELL_INVOICES.filter((i) => i.status === "pending");
  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read).slice(0, 3);
  const activeContracts = CONTRACTS.filter((c) => c.status === "active");
  const primaryHealth = getAllPlantHealth()[0];
  const alerts = getMaintenanceAlerts();

  return (
    <DashboardPage
      title={`سلام، ${DASHBOARD_USER.name.split(" ")[0]} 👋`}
      subtitle="خلاصه وضعیت نیروگاه و درآمد فروش برق شما"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <GovernmentComparePanel />
      </div>

      <div className="mt-6">
        <IncomeForecastPanel />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {primaryHealth && <HealthScorePanel health={primaryHealth} compact />}
        <MaintenanceAlertsPanel alerts={alerts} limit={3} />
      </div>

      <div className="mt-8">
        <PanelHeader title="دسترسی سریع" description="کارهای پرتکرار را از اینجا انجام دهید" />
        <QuickActions actions={QUICK_ACTIONS} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="تولید ۶ ماه اخیر"
            action={
              <Button href="/dashboard/production" variant="ghost" size="sm" className="group">
                جزئیات
                <LinkArrow />
              </Button>
            }
          />
          <ProductionChart data={MONTHLY_PRODUCTION} showEarnings />
        </Panel>

        <Panel>
          <PanelHeader title="قراردادهای فعال" />
          <div className="space-y-4">
            {activeContracts.length > 0 ? (
              activeContracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  className="block rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{contract.title}</p>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-xs text-slate-500">{contract.billAccount}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">نرخ: {contract.rate}</span>
                    <span className="font-medium text-emerald-600">تا {contract.endDate}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">قرارداد فعالی ندارید.</p>
            )}
            <Button href="/dashboard/contracts" variant="outline" size="sm" fullWidth>
              همه قراردادها
            </Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="صورت‌حساب‌های در انتظار پرداخت"
            action={<StatusBadge status="pending" label={`${pendingInvoices.length} صورت‌حساب`} />}
          />
          {pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{invoice.plantName}</p>
                    <p className="text-xs text-slate-500">
                      {invoice.period} — {invoice.energyKwh} kWh × {invoice.ratePerKwh} تومان
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{invoice.amount}</p>
                    <p className="text-xs text-emerald-600">تومان — حداکثر {invoice.dueDate}</p>
                  </div>
                </div>
              ))}
              <Button href="/dashboard/invoices" fullWidth>
                مشاهده صورت‌حساب‌ها
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">صورت‌حساب معوقی ندارید.</p>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="اعلان‌های اخیر"
            action={
              <Link href="/dashboard/notifications" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                مشاهده همه
              </Link>
            }
          />
          <div className="space-y-3">
            {unreadNotifications.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader title="نیروگاه‌های من" description={`${SOLAR_PLANTS.length} نیروگاه ثبت‌شده`} />
        <ResponsiveTable
          headers={["نام نیروگاه", "ظرفیت", "تولید ماه جاری", "وضعیت"]}
          mobileCards={
            <>
              {SOLAR_PLANTS.map((plant) => (
                <MobileDataCard
                  key={plant.id}
                  title={plant.name}
                  badge={<StatusBadge status={plant.status} />}
                  fields={[
                    { label: "ظرفیت", value: `${plant.capacityKwp} kWp` },
                    { label: "تولید ماه جاری", value: `${plant.monthlyProductionKwh} kWh` },
                    { label: "آدرس", value: plant.address },
                  ]}
                />
              ))}
            </>
          }
          rows={SOLAR_PLANTS.map((plant) => [
            <span key="name" className="font-medium text-slate-900">{plant.name}</span>,
            <span key="cap" className="text-slate-600">{plant.capacityKwp} kWp</span>,
            <span key="prod" className="font-medium text-emerald-600">{plant.monthlyProductionKwh} kWh</span>,
            <StatusBadge key="status" status={plant.status} />,
          ])}
        />
      </Panel>
    </DashboardPage>
  );
}
