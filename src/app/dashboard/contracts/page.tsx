import { DashboardPage, Panel, StatusBadge } from "@/features/dashboard/components";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { CONTRACTS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "قراردادها" };

export default function ContractsPage() {
  return (
    <DashboardPage title="قراردادها" subtitle="مدیریت قراردادهای تامین برق">
      <div className="grid gap-4">
        {CONTRACTS.map((contract) => (
          <Panel key={contract.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{contract.title}</h3>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="text-sm text-slate-500">{contract.billAccount}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "نوع قرارداد", value: contract.type },
                    { label: "حجم ماهانه", value: contract.volume },
                    { label: "نرخ", value: contract.rate },
                    { label: "صرفه‌جویی", value: contract.savings },
                  ].map((field) => (
                    <div key={field.label} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">{field.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{field.value}</p>
                    </div>
                  ))}
                </div>
                {contract.status === "active" && (
                  <p className="mt-3 text-xs text-slate-500">
                    دوره: {contract.startDate} تا {contract.endDate}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {contract.status === "active" && (
                  <>
                    <Button variant="outline" size="sm">دانلود PDF</Button>
                    <Button variant="outline" size="sm">درخواست تمدید</Button>
                  </>
                )}
                {contract.status === "draft" && (
                  <Button href="/dashboard/buy" size="sm" className="group">
                    تکمیل قرارداد
                    <LinkArrow />
                  </Button>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
