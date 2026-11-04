"use client";

import { useRef, useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input } from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import {
  equipmentCategoryLabel,
  equipmentPriceModeLabel,
  estimateEquipmentCost,
  formatEquipmentMoney,
  formatEquipmentUnits,
  type EquipmentEstimate,
} from "@/features/catalog/equipment-api";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import "./plant-calculator.css";

function averagePerKwp(estimate: EquipmentEstimate): number | null {
  const capacity = Number(estimate.capacity_kwp);
  if (!Number.isFinite(capacity) || capacity <= 0) return null;
  return estimate.total_toman / capacity;
}

export function PlantCalculator(): ReactElement {
  const inFlight = useRef(false);
  const [capacity, setCapacity] = useState("5");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<EquipmentEstimate | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current) return;
    const value = Number(capacity.replace(/[,\s]/g, ""));
    if (!Number.isFinite(value) || value < 0.001) {
      setError("ظرفیت باید عددی بیشتر از صفر (بر حسب kWp) باشد.");
      setEstimate(null);
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const result = await estimateEquipmentCost(value);
      setEstimate(result);
    } catch (failure) {
      setEstimate(null);
      setError(failure instanceof ApiError ? failure.message : "محاسبه برآورد انجام نشد.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const average = estimate ? averagePerKwp(estimate) : null;

  return (
    <div className="plant-calc">
      <section className="plant-calc-hero">
        <div className="plant-calc-hero-inner">
          <p className="plant-calc-eyebrow">برآورد نصب</p>
          <h1 className="plant-calc-title">ماشین حساب نیروگاه</h1>
          <p className="plant-calc-lead">
            ظرفیت موردنظر را وارد کنید؛ برآورد هزینه تجهیزات از کاتالوگ فعال سایت محاسبه می‌شود و میانگین تومان به ازای هر
            کیلووات‌پیک را می‌بینید.
          </p>
        </div>
      </section>

      <section className="plant-calc-body">
        <form className="plant-calc-form" onSubmit={(event) => void submit(event)} noValidate>
          <Input
            label="ظرفیت نیروگاه (kWp)"
            dir="ltr"
            inputMode="decimal"
            value={capacity}
            required
            helperText="مثلاً ۵ برای یک نیروگاه پنج کیلووات‌پیک"
            onChange={(event) => setCapacity(event.target.value)}
          />
          <Button type="submit" variant="primary" disabled={pending} className="plant-calc-submit">
            <Icon name="chart" className="size-4" />
            {pending ? "در حال محاسبه…" : "محاسبه برآورد"}
          </Button>
        </form>

        {error ? <Alert tone="danger" title={error} /> : null}

        {estimate ? (
          <div className="plant-calc-result" aria-live="polite">
            <div className="plant-calc-summary">
              <div>
                <span>جمع برآورد</span>
                <strong dir="ltr">{formatEquipmentMoney(estimate.total_toman)} تومان</strong>
              </div>
              <div>
                <span>میانگین به ازای هر kWp</span>
                <strong dir="ltr">
                  {average == null ? "—" : `${formatEquipmentMoney(Math.round(average))} تومان`}
                </strong>
              </div>
              <div>
                <span>ظرفیت</span>
                <strong dir="ltr">{faNumber(Number(estimate.capacity_kwp), { maximumFractionDigits: 3 })} kWp</strong>
              </div>
            </div>

            {estimate.items.length === 0 ? (
              <Alert
                tone="warning"
                title="کاتالوگ فعال خالی است"
                description="فعلاً تجهیز فعالی برای برآورد ثبت نشده؛ پس از تعریف در پنل ادمین، نتیجه اینجا دیده می‌شود."
              />
            ) : (
              <ul className="plant-calc-lines" aria-label="جزئیات اقلام">
                {estimate.items.map((line) => (
                  <li key={line.equipment_uuid}>
                    <div className="min-w-0">
                      <h3>{line.name}</h3>
                      <p>
                        {equipmentCategoryLabel(line.category)} · {equipmentPriceModeLabel(line.price_mode)} · تعداد{" "}
                        <bdi dir="ltr">{formatEquipmentUnits(line.quantity)}</bdi>
                      </p>
                    </div>
                    <strong dir="ltr">{formatEquipmentMoney(line.total_toman)} تومان</strong>
                  </li>
                ))}
              </ul>
            )}

            <p className="plant-calc-note">
              این عدد برآورد تجهیزات بر اساس قیمت‌های ثبت‌شده است و جایگزین بازدید یا پیشنهاد رسمی نصب نمی‌شود.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
