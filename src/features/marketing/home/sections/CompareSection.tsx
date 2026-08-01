import { Container } from "@/shared/ui/Container";
import { Section, SectionHeader } from "@/shared/ui/Section";
import { SITE_CONFIG } from "@/config";
import { Check, X } from "@/shared/lib/icons";

const ROWS = [
  {
    label: "قیمت هر کیلووات‌ساعت",
    government: `${SITE_CONFIG.valueProps.governmentPrice} ${SITE_CONFIG.valueProps.priceUnit}`,
    barghino: `${SITE_CONFIG.valueProps.barghinoPrice} ${SITE_CONFIG.valueProps.priceUnit}`,
    win: "barghino" as const,
  },
  {
    label: "زمان پرداخت",
    government: `تا ${SITE_CONFIG.valueProps.governmentPayoutMonths} ماه`,
    barghino: `حداکثر ${SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه`,
    win: "barghino" as const,
  },
  {
    label: "تضمین پرداخت",
    government: "پرداخت می‌شود، ولی دیر",
    barghino: "تضمین پرداخت + تسویه سریع‌تر",
    win: "barghino" as const,
  },
  {
    label: "مسیر نصب نیروگاه",
    government: "خودت باید جلو ببری",
    barghino: "برقینو مسیر نصب را جلو می‌برد",
    win: "barghino" as const,
  },
];

export function CompareSection() {
  return (
    <Section id="compare" background="default" compact>
      <Container>
        <SectionHeader
          badge="مقایسه شفاف"
          title="فروش به دولت یا فروش به برقینو؟"
          description="همان برقی که تولید می‌کنی — با قیمت بالاتر و پرداخت سریع‌تر."
          compact
        />

        <div className="mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-slate-100 bg-slate-50/80 px-4 py-4 text-center text-sm font-semibold sm:px-6 sm:text-base">
            <div className="text-right text-slate-500">معیار</div>
            <div className="text-slate-500">دولت</div>
            <div className="text-brand-700">{SITE_CONFIG.name}</div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.1fr_1fr_1fr] items-center px-4 py-4 text-sm sm:px-6 sm:text-base ${
                i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
              }`}
            >
              <p className="text-right font-medium text-slate-700">{row.label}</p>
              <div className="flex flex-col items-center gap-1 text-center text-slate-500">
                <X className="hidden h-4 w-4 text-slate-300 sm:block" />
                <span>{row.government}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center font-semibold text-brand-700">
                <Check className="hidden h-4 w-4 text-brand-500 sm:block" />
                <span>{row.barghino}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-slate-500">
          اعداد نمونه برای مقایسه هستند و بر اساس نرخ بورس سبز و شرایط پرداخت اعلام‌شده محاسبه می‌شوند.
        </p>
      </Container>
    </Section>
  );
}
