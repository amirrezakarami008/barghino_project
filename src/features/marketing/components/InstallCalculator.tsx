"use client";

import { useMemo, useState } from "react";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { parsePersianNumber } from "@/shared/lib/numbers";
import { EquipmentPriceList } from "@/features/equipment/components/EquipmentPriceList";
import { useActiveEquipment } from "@/features/equipment/hooks/useEquipment";
import {
  estimateEquipmentCost,
  formatEquipmentMoney,
} from "@/features/equipment/lib/pricing";
import { EQUIPMENT_CATEGORY_LABELS } from "@/features/equipment/constants";

const CITIES = [
  { id: "tehran", label: "تهران", yieldKwhPerKwp: 1550 },
  { id: "isfahan", label: "اصفهان", yieldKwhPerKwp: 1700 },
  { id: "shiraz", label: "شیراز", yieldKwhPerKwp: 1750 },
  { id: "yazd", label: "یزد", yieldKwhPerKwp: 1850 },
  { id: "mashhad", label: "مشهد", yieldKwhPerKwp: 1500 },
  { id: "tabriz", label: "تبریز", yieldKwhPerKwp: 1400 },
  { id: "ahvaz", label: "اهواز", yieldKwhPerKwp: 1650 },
  { id: "karaj", label: "کرج", yieldKwhPerKwp: 1520 },
] as const;

const ROOF_TYPES = [
  { id: "flat", label: "سقف صاف", factor: 1 },
  { id: "sloped", label: "سقف شیب‌دار", factor: 0.95 },
  { id: "mixed", label: "ترکیبی / محدود", factor: 0.85 },
] as const;

/** متر مربع تقریبی به ازای هر کیلووات */
const M2_PER_KWP = 9;

export function InstallCalculator() {
  const { items: equipment } = useActiveEquipment();
  const [cityId, setCityId] = useState<(typeof CITIES)[number]["id"]>("tehran");
  const [roofM2, setRoofM2] = useState(80);
  const [roofType, setRoofType] = useState<(typeof ROOF_TYPES)[number]["id"]>("flat");
  const [monthlyBill, setMonthlyBill] = useState(2_500_000);

  const result = useMemo(() => {
    const city = CITIES.find((c) => c.id === cityId)!;
    const roof = ROOF_TYPES.find((r) => r.id === roofType)!;
    const rawKwp = roofM2 / M2_PER_KWP;
    const capacityKwp = Math.max(1, Math.round(rawKwp * roof.factor * 2) / 2);
    const annualKwh = Math.round(capacityKwp * city.yieldKwhPerKwp);
    const rate = parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);
    const govRate = parsePersianNumber(SITE_CONFIG.valueProps.governmentPrice);
    const annualIncome = annualKwh * rate;
    const annualGov = annualKwh * govRate;
    const costEstimate = estimateEquipmentCost(capacityKwp, equipment);
    const installCost = costEstimate.totalToman;
    const paybackYears = annualIncome > 0 ? installCost / annualIncome : 0;
    const extraVsGov = annualIncome - annualGov;

    return {
      capacityKwp,
      annualKwh,
      annualIncome,
      installCost,
      paybackYears,
      extraVsGov,
      monthlyIncome: Math.round(annualIncome / 12),
      billHint: monthlyBill,
      costEstimate,
    };
  }, [cityId, roofM2, roofType, monthlyBill, equipment]);

  return (
    <section id="calculator" className="bg-slate-50 py-12 sm:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="mb-3 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            ماشین حساب تجهیزات
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            اگر نیروگاه نصب کنی، چقدر درآمد داری؟
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            با چند عدد ساده، ظرفیت پیشنهادی، هزینه تقریبی بر اساس تجهیزات تعریف‌شده و
            درآمد فروش به برقینو را ببین.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">شهر</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value as typeof cityId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  متراژ قابل‌استفاده پشت‌بام (متر مربع)
                </label>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={roofM2}
                  onChange={(e) => setRoofM2(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>۲۰</span>
                  <span className="font-semibold text-slate-800">{roofM2} م²</span>
                  <span>۲۰۰</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">نوع سقف</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROOF_TYPES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoofType(r.id)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                        roofType === r.id
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  قبض برق ماهانه تقریبی (تومان)
                </label>
                <input
                  type="number"
                  min={500_000}
                  step={100_000}
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  فقط برای حس مقیاس — درآمد فروش جدا از قبض مصرف محاسبه می‌شود.
                </p>
              </div>
            </div>

            <EquipmentPriceList
              capacityKwp={result.capacityKwp}
              costLines={result.costEstimate.lines}
            />
          </div>

          <div className="rounded-[1.5rem] border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-5 shadow-lg shadow-brand-500/10 sm:p-6">
            <p className="text-xs font-semibold text-brand-700">برآورد نمونه برقینو</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "ظرفیت پیشنهادی", value: `${result.capacityKwp} kWp` },
                {
                  label: "تولید سالانه تقریبی",
                  value: `${result.annualKwh.toLocaleString("fa-IR")} kWh`,
                },
                {
                  label: "هزینه تقریبی تجهیزات و نصب",
                  value: `${formatEquipmentMoney(result.installCost)} تومان`,
                },
                {
                  label: "درآمد سالانه",
                  value: `${formatEquipmentMoney(result.annualIncome)} تومان`,
                },
                {
                  label: "درآمد ماهانه تقریبی",
                  value: `${formatEquipmentMoney(result.monthlyIncome)} تومان`,
                },
                {
                  label: "بازگشت سرمایه تقریبی",
                  value: `${result.paybackYears.toFixed(1)} سال`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-100">
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            {result.costEstimate.lines.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-700">
                    تجهیزات استفاده‌شده در این برآورد
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {result.costEstimate.lines.length.toLocaleString("fa-IR")} قلم
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {result.costEstimate.lines.map((line) => {
                    const unit = line.item.unitLabel ?? "واحد";
                    return (
                      <li
                        key={line.item.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {line.item.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {EQUIPMENT_CATEGORY_LABELS[line.item.category]} ·{" "}
                            {line.item.unitPriceToman.toLocaleString("fa-IR")} تومان / {unit}
                          </p>
                        </div>
                        <div className="shrink-0 text-end">
                          <p className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold tabular-nums text-brand-700 ring-1 ring-brand-100">
                            {line.quantity.toLocaleString("fa-IR")} {unit}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold tabular-nums text-slate-600">
                            {formatEquipmentMoney(line.lineTotalToman)} تومان
                          </p>
                        </div>
                      </li>
                    );
                  })}
                  <li className="flex items-center justify-between bg-brand-50/60 px-4 py-3">
                    <span className="text-xs font-bold text-brand-800">جمع تجهیزات</span>
                    <span className="text-xs font-extrabold text-brand-800">
                      {formatEquipmentMoney(result.installCost)} تومان
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3">
              <p className="text-xs text-emerald-700">سود بیشتر نسبت به فروش پایه در سال</p>
              <p className="mt-1 font-display text-xl font-extrabold text-emerald-700">
                +{formatEquipmentMoney(result.extraVsGov)} تومان
              </p>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-slate-500">
              اعداد نمونه و تقریبی‌اند؛ هزینه بر اساس تجهیزات فعال کاتالوگ محاسبه
              می‌شود و ظرفیت نهایی پس از بازدید کارشناس مشخص می‌گردد.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button href="/register" size="sm" className="group flex-1 whitespace-nowrap">
                درخواست نصب نیروگاه
                <LinkArrow />
              </Button>
              <Button
                href="/dashboard/install"
                variant="outline"
                size="sm"
                className="flex-1 whitespace-nowrap"
              >
                پیگیری در پنل
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
