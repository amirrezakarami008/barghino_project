import Image from "next/image";
import { sampleOffer } from "@/features/marketing/sample";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "plant", title: "مسیر نصب نیروگاه", text: "از درخواست تا بهره‌برداری" },
  { icon: "coins", title: "قیمت بالاتر", text: "بر اساس نرخ بورس سبز" },
  { icon: "clock", title: "تسویه سریع‌تر", text: "حداکثر ۲ ماه" },
  { icon: "shield", title: "قرارداد رسمی", text: "شفافیت قیمت و زمان پرداخت" },
];

const rows = [
  ["قیمت خرید", `${sampleOffer.statePrice} تومان/kWh`, `${sampleOffer.barghinoPrice} تومان/kWh`],
  ["زمان پرداخت", sampleOffer.stateWait, sampleOffer.barghinoWait],
  ["اطمینان مالی", "پرداخت با تأخیر", "قرارداد رسمی"],
];

export function HomeView() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div>
          <p className="text-sm font-semibold text-emerald">پلتفرم فروش برق خانگی و نیروگاه خورشیدی</p>
          <h1 className="mt-3 text-4xl leading-[1.45] font-bold tracking-tight text-balance text-primary sm:text-5xl">
            برق خانگی‌ات را بفروش؛
            <span className="mt-1 block">نداری؟ برات نصب می‌کنیم</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            برق تولید خانگی‌ات را به قیمت بورس سبز بفروش. وجود قرارداد رسمی، تسویه حداکثر دو ماه. نیروگاه نداری؟ مسیر نصب را از برقینو شروع کن.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/sell">
              فروش برق نیروگاهم
              <Icon name="bolt" className="size-4" />
            </ButtonLink>
            <ButtonLink href="/install" variant="secondary">
              درخواست نصب نیروگاه
              <Icon name="plant" className="size-4" />
            </ButtonLink>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-soft)]">
            <Image
              src="/hero-solar.jpg"
              alt="خانه مدرن با پنل خورشیدی روی بام، در نور روز"
              width={1280}
              height={720}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="absolute top-4 right-4 rounded-2xl bg-card/95 px-4 py-3 shadow-[var(--shadow-soft)]">
            <span className="block text-xs text-muted-foreground">تولید امروز · نمونه</span>
            <span className="mt-1 flex items-center gap-2 text-lg font-bold text-primary">
              <Icon name="chart" className="size-4 text-solar" />
              {sampleOffer.todayProduction} kWh
            </span>
          </p>
        </div>
      </section>

      <section aria-label="مزیت‌ها" className="border-y border-border bg-card">
        <ul className="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <li key={item.title} className="flex items-center gap-4 px-6 py-6 lg:border-s lg:border-border lg:first:border-s-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint text-primary">
                <Icon name={item.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">دو مسیر ساده، یک مقصد</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            چه نیروگاه داشته باشید چه نه، مسیر مشخص است. در پایان، برق تولیدی با قرارداد رسمی فروخته می‌شود.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-panel border border-border bg-card p-5">
              <span className="grid size-11 place-items-center rounded-2xl bg-info text-info-foreground">
                <Icon name="home" className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">نیروگاه دارم</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">نیروگاه موجود را معرفی کنید، قرارداد فروش ببندید و درآمد را پیگیری کنید.</p>
              <ButtonLink href="/sell" variant="secondary" className="mt-5 w-full">
                فروش برق نیروگاهم
                <Icon name="arrow" className="size-4" />
              </ButtonLink>
            </article>
            <article className="rounded-panel border border-emerald/15 bg-mint p-5">
              <span className="grid size-11 place-items-center rounded-2xl bg-card text-primary">
                <Icon name="plant" className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">نیروگاه ندارم</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">درخواست نصب بدهید و بعد از بهره‌برداری وارد مسیر فروش برق شوید.</p>
              <ButtonLink href="/install" className="mt-5 w-full">
                درخواست نصب نیروگاه
                <Icon name="arrow" className="size-4" />
              </ButtonLink>
            </article>
          </div>
        </div>

        <div className="rounded-panel border border-border bg-card p-5 sm:p-7">
          <h2 className="text-center text-xl font-bold sm:text-2xl">مقایسه فروش برق به دولت و برقینو</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <div className="hidden grid-cols-3 bg-surface text-sm font-semibold sm:grid">
              <div className="px-4 py-3 text-muted-foreground">معیار</div>
              <div className="px-4 py-3">فروش به دولت</div>
              <div className="bg-mint px-4 py-3 text-primary">فروش به برقینو</div>
            </div>
            {rows.map(([label, state, ours]) => (
              <div key={label} className="grid border-t border-border text-sm first:border-t-0 sm:grid-cols-3 sm:first:border-t">
                <div className="bg-surface px-4 py-3 font-semibold sm:bg-transparent">{label}</div>
                <div className="px-4 py-3 text-muted-foreground">{state}</div>
                <div className="bg-mint px-4 py-3 font-semibold text-primary">{ours}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">{sampleOffer.disclaimer}</p>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:py-16">
          <div>
            <p className="text-sm font-semibold text-emerald">پنل کاربری</p>
            <h2 className="mt-2 text-3xl font-bold text-primary">همه چیز در یک نگاه</h2>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">
              در داشبورد برقینو تولید، درآمد، قراردادها و وضعیت نیروگاه در یک صفحه دیده می‌شود. تصویر روبه‌رو نمونه بصری است، نه داده حساب شما.
            </p>
            <ButtonLink href="/panel" variant="secondary" className="mt-6">
              ورود به پنل
              <Icon name="arrow" className="size-4" />
            </ButtonLink>
          </div>
          <DashboardPreview />
        </div>
      </section>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-soft)]" aria-label="پیش‌نمایش نمونه داشبورد">
      <div className="grid lg:grid-cols-[11rem_1fr]">
        <div className="hidden bg-sidebar p-4 text-sidebar-foreground lg:block">
          <p className="text-sm font-bold">برقینو</p>
          <ul className="mt-4 grid gap-2 text-xs text-sidebar-muted">
            {["داشبورد", "نیروگاه من", "تولید و درآمد", "قراردادها", "پرداخت‌ها", "درخواست نصب"].map((item, index) => (
              <li key={item} className={index === 0 ? "rounded-xl bg-white/12 px-2 py-2 text-white" : "px-2 py-1.5"}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">نمونه داشبورد · {sampleOffer.disclaimer}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Stat label="تولید امروز" value={`${sampleOffer.todayProduction} kWh`} />
            <Stat label="درآمد ماه" value={`${sampleOffer.monthIncome} تومان`} />
            <Stat label="قرارداد" value="رسمی" />
          </div>
          <div className="mt-3 rounded-2xl border border-border p-4">
            <p className="text-sm font-semibold">روند نمونه تولید</p>
            <svg viewBox="0 0 320 110" className="mt-3 h-28 w-full" role="img" aria-label="نمودار نمونه صعودی، بدون داده واقعی">
              <path d="M8 88 C 50 84, 70 70, 100 72 S 150 40, 190 48 250 22 312 18 V 100 H 8 Z" fill="#e8f5ee" />
              <path d="M8 88 C 50 84, 70 70, 100 72 S 150 40, 190 48 250 22 312 18" fill="none" stroke="#15966b" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
