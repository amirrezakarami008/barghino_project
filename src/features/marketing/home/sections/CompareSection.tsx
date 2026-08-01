import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { Check } from "@/shared/lib/icons";

const ROWS = [
  {
    label: "قیمت هر کیلووات‌ساعت",
    government: `${SITE_CONFIG.valueProps.governmentPrice} ${SITE_CONFIG.valueProps.priceUnit}`,
    barghino: `${SITE_CONFIG.valueProps.barghinoPrice} ${SITE_CONFIG.valueProps.priceUnit}`,
    barghinoBadge: "قیمت بالاتر",
  },
  {
    label: "زمان پرداخت",
    government: `تا ${SITE_CONFIG.valueProps.governmentPayoutMonths} ماه`,
    barghino: `حداکثر ${SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه`,
    barghinoBadge: "تسویه سریع‌تر",
  },
  {
    label: "تضمین پرداخت",
    government: "پرداخت می‌شود، ولی دیر",
    barghino: "تضمین پرداخت + تسویه سریع‌تر",
    barghinoBadge: "تضمینی",
  },
  {
    label: "شفافیت مسیر",
    government: "فرآیند طولانی و مبهم",
    barghino: "مراحل مشخص از ثبت‌نام تا درآمد",
    barghinoBadge: "شفاف",
  },
  {
    label: "مسیر نصب نیروگاه",
    government: "خودت باید جلو ببری",
    barghino: "برقینو مسیر نصب را جلو می‌برد",
    barghinoBadge: "همراهی کامل",
  },
];

export function CompareSection() {
  return (
    <section id="compare" className="bg-white pb-12 pt-10 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-14">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            فروش به دولت یا فروش به {SITE_CONFIG.name}؟
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            همان برقی که تولید می‌کنی — با قیمت بالاتر و پرداخت سریع‌تر.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <div className="grid grid-cols-[1.15fr_1fr_1.15fr] border-b border-slate-100 bg-slate-50 px-3 py-3.5 text-center text-xs font-bold sm:px-6 sm:py-4 sm:text-sm">
            <div className="text-right text-slate-500">معیار</div>
            <div className="text-slate-500">دولت</div>
            <div className="text-brand-700">{SITE_CONFIG.name}</div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.15fr_1fr_1.15fr] items-center gap-2 px-3 py-3.5 text-xs sm:gap-3 sm:px-6 sm:py-4 sm:text-sm ${
                i % 2 === 0 ? "bg-white" : "bg-slate-50/70"
              } ${i < ROWS.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <p className="text-right font-medium text-slate-700">{row.label}</p>
              <p className="text-center text-slate-500">{row.government}</p>
              <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-center sm:gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                  <Check className="hidden h-3.5 w-3.5 shrink-0 text-brand-500 sm:block" />
                  {row.barghino}
                </span>
                <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-100 sm:text-xs">
                  {row.barghinoBadge}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-slate-400 sm:text-sm">
          اعداد نمونه برای مقایسه هستند و بر اساس نرخ بورس سبز و شرایط پرداخت اعلام‌شده محاسبه می‌شوند.
        </p>
      </Container>
    </section>
  );
}
