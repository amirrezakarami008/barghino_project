import {
  ConsumptionChart,
  DashboardPage,
  MobileDataCard,
  Panel,
  PanelHeader,
  QuickActions,
  ResponsiveTable,
  StatCard,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { BILL_ACCOUNTS, CONTRACTS, DASHBOARD_STATS, DASHBOARD_USER, INVOICES, MONTHLY_CONSUMPTION, NOTIFICATIONS, QUICK_ACTIONS } from "@/features/dashboard/constants";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد" };

export default function DashboardOverviewPage() {
  const pendingInvoices = INVOICES.filter((i) => i.status === "pending");
  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read).slice(0, 3);
  const activeContracts = CONTRACTS.filter((c) => c.status === "active");

  return (
    <DashboardPage
      title={`سلام، ${DASHBOARD_USER.name.split(" ")[0]} 👋`}
      subtitle="خلاصه وضعیت تامین برق و مصرف شما"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <PanelHeader title="دسترسی سریع" description="کارهای پرتکرار را از اینجا انجام دهید" />
        <QuickActions actions={QUICK_ACTIONS} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="روند مصرف ۶ ماه اخیر"
            action={
              <Button href="/dashboard/consumption" variant="ghost" size="sm" className="group">
                جزئیات
                <LinkArrow />
              </Button>
            }
          />
          <ConsumptionChart data={MONTHLY_CONSUMPTION} showCost />
        </Panel>

        <Panel>
          <PanelHeader title="قراردادهای فعال" />
          <div className="space-y-4">
            {activeContracts.map((contract) => (
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
                  <span className="text-slate-500">صرفه‌جویی: {contract.savings}</span>
                  <span className="font-medium text-emerald-600">تا {contract.endDate}</span>
                </div>
              </Link>
            ))}
            <Button href="/dashboard/contracts" variant="outline" size="sm" fullWidth>
              همه قراردادها
            </Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="فاکتورهای معوق"
            action={<StatusBadge status="pending" label={`${pendingInvoices.length} فاکتور`} />}
          />
          {pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{invoice.billAccount}</p>
                    <p className="text-xs text-slate-500">{invoice.period} — سررسید: {invoice.dueDate}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{invoice.amount}</p>
                    <p className="text-xs text-amber-600">تومان</p>
                  </div>
                </div>
              ))}
              <Button href="/dashboard/invoices" fullWidth>
                پرداخت فاکتورها
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">فاکتور معوقی ندارید.</p>
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
        <PanelHeader title="شناسه‌های قبض" description={`${BILL_ACCOUNTS.length} واحد ثبت‌شده`} />
        <ResponsiveTable
          headers={["نام واحد", "شناسه قبض", "نوع", "مصرف ماهانه", "وضعیت"]}
          mobileCards={
            <>
              {BILL_ACCOUNTS.map((bill) => (
                <MobileDataCard
                  key={bill.id}
                  title={bill.name}
                  badge={<StatusBadge status={bill.status} />}
                  fields={[
                    { label: "شناسه قبض", value: <span className="font-mono text-xs">{bill.billId}</span> },
                    { label: "نوع", value: bill.type },
                    { label: "مصرف ماهانه", value: bill.monthlyUsage },
                  ]}
                />
              ))}
            </>
          }
          rows={BILL_ACCOUNTS.map((bill) => [
            <span key="name" className="font-medium text-slate-900">{bill.name}</span>,
            <span key="id" className="font-mono text-xs text-slate-600">{bill.billId}</span>,
            <span key="type" className="text-slate-600">{bill.type}</span>,
            <span key="usage" className="text-slate-600">{bill.monthlyUsage}</span>,
            <StatusBadge key="status" status={bill.status} />,
          ])}
        />
      </Panel>
    </DashboardPage>
  );
}
