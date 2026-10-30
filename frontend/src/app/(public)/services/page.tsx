import type { Metadata } from "next";
import { ButtonLink, Card } from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { sampleOffer } from "@/features/marketing/sample";
import { faNumber } from "@/shared/lib/fa";

export const metadata: Metadata = {
  title: "خدمات",
  description:
    "دو خدمت برقینو: فروش برق نیروگاه خانگی و درخواست نصب پنل خورشیدی، با قرارداد رسمی و وضعیت قابل‌پیگیری.",
};

const sellSteps = [
  { title: "ثبت‌نام و انتخاب مسیر فروش", text: "حساب خانگی بسازید و مسیر فروش را مشخص کنید." },
  { title: "ثبت انشعاب و نیروگاه", text: "اطلاعات انشعاب، ظرفیت و مشخصات نیروگاه را وارد کنید." },
  { title: "بررسی شرکت", text: "کارشناس وضعیت را بررسی می‌کند؛ رد شدن با دلیل قابل‌مشاهده است." },
  { title: "انتخاب پلن و پیش‌نویس", text: "پلن را ببینید و پیش‌نویس قرارداد را بازبینی کنید." },
];

const installSteps = [
  { title: "ثبت درخواست نصب", text: "موقعیت و نیاز اولیه را اعلام کنید." },
  { title: "بررسی و پیشنهاد", text: "پس از بررسی، پیشنهاد نصب و شرایط در پنل دیده می‌شود." },
  { title: "قرارداد نصب", text: "جزئیات اجرا در قرارداد نصب مکتوب می‌شود." },
  { title: "بهره‌برداری و فروش", text: "بعد از راه‌اندازی می‌توانید وارد مسیر فروش برق شوید." },
];

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-grad-aurora border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-caption font-semibold text-accent">خدمات</p>
          <h1 className="mt-2 max-w-3xl text-h1 text-balance">فروش برق یا نصب نیروگاه — مسیر شفاف</h1>
          <p className="mt-4 max-w-2xl text-body text-foreground-muted">
            هر دو مسیر در یک پلتفرم‌اند. وضعیت‌ها دیده می‌شوند؛ نرخ و تعهد در قرارداد شما تعریف می‌شود، نه با وعدهٔ عمومی درآمد.
          </p>
        </div>
      </section>

      <section id="sell" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="grid size-12 place-items-center rounded-md bg-grad-sun text-primary-foreground shadow-sun-glow">
              <Icon name="bolt" className="size-6" />
            </span>
            <h2 className="mt-5 text-h2">فروش برق نیروگاه خانگی</h2>
            <p className="mt-3 text-body text-foreground-muted">
              اگر پشت‌بام یا ملک شما همین حالا تولید می‌کند، نیروگاه را معرفی کنید و مسیر فروش را تا پیش‌نویس قرارداد دنبال کنید.
            </p>
            <p className="mt-4 text-caption text-foreground-muted">
              نمونه مقایسه: حدود {faNumber(sampleOffer.barghinoPrice)} تومان/kWh در برابر مسیر دولتی نمونه{" "}
              {faNumber(sampleOffer.statePrice)} — این اعداد نرخ زنده نیستند.
            </p>
            <ButtonLink href="/register?path=sell" className="mt-6">
              شروع فروش برق
            </ButtonLink>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {sellSteps.map((step, index) => (
              <li key={step.title} className="rounded-lg border border-border bg-card p-5 shadow-soft">
                <span className="text-caption font-bold text-sun-700">{faNumber(index + 1)}</span>
                <h3 className="mt-2 text-h4">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-foreground-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="install" className="scroll-mt-24 border-t border-border bg-surface/60">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="grid size-12 place-items-center rounded-md bg-grad-energy text-secondary-foreground shadow-energy-glow">
              <Icon name="plant" className="size-6" />
            </span>
            <h2 className="mt-5 text-h2">نصب نیروگاه خورشیدی</h2>
            <p className="mt-3 text-body text-foreground-muted">
              نیروگاه ندارید؟ درخواست نصب بدهید، پیشنهاد و قرارداد نصب را ببینید و بعد از بهره‌برداری وارد فروش شوید.
            </p>
            <ButtonLink href="/register?path=install" variant="secondary" className="mt-6">
              درخواست نصب
            </ButtonLink>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {installSteps.map((step, index) => (
              <li key={step.title}>
                <Card>
                  <span className="text-caption font-bold text-energy-700">{faNumber(index + 1)}</span>
                  <h3 className="mt-2 text-h4">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-foreground-muted">{step.text}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
