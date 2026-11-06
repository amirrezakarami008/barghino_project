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

const capacityPresets = [1, 5, 10, 20];

function parseCapacity(value: string): number {
  const normalized = value
    .replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10))
    .replace(/[٬,\s]/g, "")
    .replace(/[٫،]/g, ".");
  return Number(normalized);
}

function averagePerKwp(estimate: EquipmentEstimate): number | null {
  const capacity = Number(estimate.capacity_kwp);
  if (!Number.isFinite(capacity) || capacity <= 0) return null;
  return estimate.total_toman / capacity;
}

function estimateBreakdown(estimate: EquipmentEstimate) {
  const totals = new Map<string, number>();
  for (const item of estimate.items) {
    totals.set(item.category, (totals.get(item.category) ?? 0) + Number(item.total_toman));
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((first, second) => second.total - first.total);
}

export function PlantCalculator(): ReactElement {
  const inFlight = useRef(false);
  const [capacity, setCapacity] = useState("5");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<EquipmentEstimate | null>(null);
  const parsedCapacity = parseCapacity(capacity);
  const sliderCapacity = Number.isFinite(parsedCapacity) ? Math.min(100, Math.max(0.5, parsedCapacity)) : 5;

  function updateCapacity(value: string): void {
    setCapacity(value);
    setEstimate(null);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current) return;
    const value = parseCapacity(capacity);
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
  const breakdown = estimate ? estimateBreakdown(estimate) : [];

  return (
    <div className="plant-calc">
      <section className="plant-calc-hero">
        <div className="plant-calc-hero-inner">
          <div className="plant-calc-hero-copy">
            <p className="plant-calc-eyebrow"><Icon name="sun" /> برآورد هوشمند نیروگاه</p>
            <h1 className="plant-calc-title">از ظرفیت تا <span>برآورد هزینه</span></h1>
            <p className="plant-calc-lead">
              ظرفیت نیروگاهت را انتخاب کن و هزینه‌ی تجهیزات را با قیمت‌های به‌روز کاتالوگ برقینو ببین.
            </p>
            <div className="plant-calc-trust"><Icon name="check" /> قیمت‌ها از کاتالوگ فعال تجهیزات محاسبه می‌شوند</div>
          </div>
          <div className="plant-calc-hero-art" role="img" aria-label="پنل‌های خورشیدی زیر نور آفتاب" />
        </div>
      </section>

      <section className="plant-calc-body">
        <div className="plant-calc-workspace">
          <form className="plant-calc-form" onSubmit={(event) => void submit(event)} noValidate>
            <div className="plant-calc-form-heading">
              <span className="plant-calc-step">۰۱</span>
              <div><h2>ظرفیت نیروگاهت چقدره؟</h2><p>برای شروع، یکی از ظرفیت‌های پیشنهادی را انتخاب کن.</p></div>
            </div>
            <div className="plant-calc-presets" aria-label="ظرفیت‌های پیشنهادی">
              {capacityPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={parsedCapacity === preset ? "is-selected" : ""}
                  aria-pressed={parsedCapacity === preset}
                  onClick={() => updateCapacity(String(preset))}
                >
                  <strong>{faNumber(preset)}</strong><span>kWp</span>
                </button>
              ))}
            </div>
            <div className="plant-calc-capacity-input">
              <Input
                label="ظرفیت دلخواه (kWp)"
                dir="ltr"
                inputMode="decimal"
                value={capacity}
                required
                onChange={(event) => updateCapacity(event.target.value)}
              />
              <span className="plant-calc-unit">kWp</span>
            </div>
            <label className="plant-calc-range-label" htmlFor="plant-capacity-range">
              <span>۰٫۵</span><span>۱۰۰ kWp</span>
            </label>
            <input
              id="plant-capacity-range"
              className="plant-calc-range"
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={sliderCapacity}
              aria-label="ظرفیت نیروگاه بر حسب کیلووات‌پیک"
              onChange={(event) => updateCapacity(event.target.value)}
            />
            <Button type="submit" variant="primary" disabled={pending} className="plant-calc-submit">
              <Icon name="bolt" className="size-4" />
              {pending ? "در حال محاسبه…" : "محاسبه هزینه تجهیزات"}
              {!pending ? <Icon name="arrow" className="size-4" /> : null}
            </Button>
            <p className="plant-calc-form-footnote"><Icon name="shield" /> بدون ثبت‌نام · فقط یک برآورد سریع</p>
          </form>

          <aside className="plant-calc-aside">
            <div className="plant-calc-aside-icon"><Icon name="solarPanel" /></div>
            <p className="plant-calc-aside-kicker">در این برآورد می‌بینی</p>
            <h2>تصویر روشن‌تری از هزینه‌ی شروع داشته باش.</h2>
            <ul>
              <li><Icon name="check" /> جمع هزینه‌ی تجهیزات</li>
              <li><Icon name="check" /> جزئیات به تفکیک دسته</li>
              <li><Icon name="check" /> قیمت هر کیلووات‌پیک</li>
            </ul>
            <div className="plant-calc-aside-stamp"><Icon name="sun" /><span>انرژی پاک<br /><b>شروع می‌شود</b></span></div>
          </aside>
        </div>

        {error ? <Alert tone="danger" title={error} /> : null}

        {estimate ? (
          <div className="plant-calc-result" aria-live="polite">
            <div className="plant-calc-result-heading">
              <div><p className="plant-calc-eyebrow">خلاصه‌ی برآورد</p><h2>این ظرفیت، این هزینه</h2></div>
              <span className="plant-calc-result-capacity" dir="ltr">
                <Icon name="solarPanel" /> {faNumber(Number(estimate.capacity_kwp), { maximumFractionDigits: 3 })} kWp
              </span>
            </div>

            <div className="plant-calc-summary">
              <div className="plant-calc-total">
                <span>هزینه‌ی کل تجهیزات</span>
                <strong dir="ltr">{formatEquipmentMoney(estimate.total_toman)} <small>تومان</small></strong>
                <span className="plant-calc-total-caption">بر اساس قیمت ثبت‌شده در کاتالوگ فعال</span>
              </div>
              <div className="plant-calc-per-kwp">
                <span><Icon name="chart" /> میانگین هزینه به‌ازای هر kWp</span>
                <strong dir="ltr">{average == null ? "—" : formatEquipmentMoney(Math.round(average))} <small>تومان</small></strong>
              </div>
            </div>

            {estimate.items.length === 0 ? (
              <Alert
                tone="warning"
                title="کاتالوگ فعال خالی است"
                description="فعلاً تجهیز فعالی برای برآورد ثبت نشده؛ پس از تعریف در پنل ادمین، نتیجه اینجا دیده می‌شود."
              />
            ) : (
              <div className="plant-calc-details">
                <section className="plant-calc-breakdown">
                  <h3>سهم هر بخش از هزینه</h3>
                  <ul>
                    {breakdown.map(({ category, total }, index) => {
                      const share = estimate.total_toman > 0 ? Math.max(0, (total / estimate.total_toman) * 100) : 0;
                      return (
                        <li key={category}>
                          <div className="plant-calc-breakdown-label">
                            <span className={`plant-calc-dot plant-calc-dot-${index % 4}`} />
                            <b>{equipmentCategoryLabel(category)}</b>
                            <span>{faNumber(share, { maximumFractionDigits: 1 })}٪</span>
                          </div>
                          <div className="plant-calc-bar"><span style={{ width: `${Math.min(100, share)}%` }} /></div>
                          <strong dir="ltr">{formatEquipmentMoney(total)} <small>تومان</small></strong>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="plant-calc-equipment">
                  <div className="plant-calc-section-heading"><h3>تجهیزات پیشنهادی</h3><span>{faNumber(estimate.items.length)} قلم</span></div>
                  <ul className="plant-calc-lines" aria-label="جزئیات اقلام">
                    {estimate.items.map((line) => (
                      <li key={line.equipment_uuid}>
                        <span className="plant-calc-item-icon"><Icon name="solarPanel" /></span>
                        <div className="min-w-0">
                          <h4>{line.name}</h4>
                          <p>
                            {equipmentCategoryLabel(line.category)} · {equipmentPriceModeLabel(line.price_mode)} · تعداد{" "}
                            <bdi dir="ltr">{formatEquipmentUnits(line.quantity)}</bdi>
                          </p>
                        </div>
                        <strong dir="ltr">{formatEquipmentMoney(line.total_toman)} <small>تومان</small></strong>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            <p className="plant-calc-note">
              این برآورد فقط هزینه‌ی تجهیزات را بر اساس قیمت‌های ثبت‌شده نشان می‌دهد؛ هزینه‌ی نصب، بازدید، تولید برق و بازگشت سرمایه در آن محاسبه نشده است.
            </p>
          </div>
        ) : !error ? (
          <div className="plant-calc-empty"><span><Icon name="chart" /></span><div><h2>برآوردت اینجا ساخته می‌شود</h2><p>ظرفیت را انتخاب کن تا قیمت تجهیزات و جزئیات هزینه را ببینی.</p></div><Icon name="arrow" className="plant-calc-empty-arrow" /></div>
        ) : null}
      </section>
    </div>
  );
}
