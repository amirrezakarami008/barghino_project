"use client";

import { Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { useSolarPlants } from "@/features/dashboard/hooks/useSolarPlants";

export function SellPlantsPanel() {
  const { plants } = useSolarPlants();

  if (plants.length === 0) {
    return (
      <Panel className="mt-6">
        <PanelHeader
          title="هنوز نیروگاهی ندارید؟"
          description="ابتدا مسیر نصب را کامل کنید؛ بعد از راه‌اندازی می‌توانید فروش را شروع کنید."
        />
        <Button href="/dashboard/install" size="lg">
          درخواست نصب نیروگاه
        </Button>
      </Panel>
    );
  }

  return (
    <Panel className="mt-6">
      <PanelHeader
        title="نیروگاه‌های من"
        description="نیروگاه‌هایی که برای فروش برق در دسترس‌اند (شامل نیروگاه‌های راه‌اندازی‌شده از مسیر نصب)"
      />
      <div className="space-y-3">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{plant.name}</p>
              <p className="mt-0.5 text-sm text-slate-500">{plant.address}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">{plant.capacityKwp} kWp</span>
              <span className="font-bold text-emerald-600">
                {plant.monthlyProductionKwh} kWh/ماه
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <Button href="/dashboard/plant" variant="outline" size="sm">
          مدیریت نیروگاه
        </Button>
        <Button href="/dashboard/install" size="sm">
          افزودن نیروگاه جدید
        </Button>
      </div>
    </Panel>
  );
}
