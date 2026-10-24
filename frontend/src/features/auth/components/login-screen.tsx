import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "قرارداد رسمی", text: "و معتبر" },
  { icon: "clock", title: "تسویه حداکثر", text: "۲ ماه" },
  { icon: "chart", title: "فروش برق با", text: "نرخ بورس سبز" },
];

export function LoginScreen() {
  return (
    <div className="grid min-h-dvh overflow-x-clip lg:grid-cols-2">
      <section className="relative hidden min-h-dvh overflow-hidden lg:block">
        <Image
          src="/hero-solar.jpg"
          alt="خانه مدرن با نیروگاه خورشیدی روی بام"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/70 via-white/10 to-primary/30" />
        <div className="absolute inset-0 flex flex-col p-8 xl:p-12">
          <Logo href="/" caption={false} className="self-start" />
          <div className="mt-10 max-w-lg min-w-0">
            <p className="text-3xl leading-[1.45] font-bold text-balance text-foreground xl:text-4xl">
              برق خانگی‌ات را بفروش؛
              <span className="mt-1 block">نداری؟ برات نصب می‌کنیم</span>
            </p>
            <p className="mt-5 max-w-md text-base leading-8 text-foreground/80">
              برق تولیدی نیروگاه خانگی‌ات را با قیمت بورس سبز می‌فروشیم؛ وجود قرارداد رسمی حداکثر ۲ ماه. نیروگاه نداری؟ برات نصب می‌کنیم.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-control border border-primary/15 bg-card/90 px-4 py-2 text-sm font-semibold text-primary shadow-[var(--shadow-soft)]">
              قیمت بالاتر از خرید دولتی
              <span className="font-normal text-muted-foreground">(بورس سبز)</span>
              <Icon name="leaf" className="size-4" />
            </p>
          </div>
          <div className="mt-auto max-w-xs self-start rounded-panel bg-primary p-4 text-primary-foreground shadow-[var(--shadow-soft)]">
            <p className="flex items-center justify-between gap-3 font-bold">
              انرژی پاک، آینده روشن
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/15">
                <Icon name="bolt" className="size-4" />
              </span>
            </p>
            <p className="mt-2 text-sm leading-7 text-primary-foreground/80">با برقینو هم به سود خودت فکر کن و هم به آینده سبز ایران.</p>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh flex-col overflow-hidden bg-surface px-4 py-6 sm:px-8">
        <div className="pointer-events-none absolute -top-16 -start-16 size-56 rounded-full bg-mint" />
        <div className="pointer-events-none absolute bottom-10 -end-20 size-48 rounded-full bg-mint/80" />
        <Link href="/" className="relative z-10 inline-flex items-center gap-1 self-end text-sm font-semibold text-primary">
          <Icon name="arrow" className="size-4" />
          بازگشت به سایت
        </Link>
        <div id="content" className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="rounded-[1.75rem] border border-border bg-card px-6 py-7 shadow-[var(--shadow-soft)] sm:px-8">
            <LoginForm />
          </div>
        </div>
        <ul className="relative z-10 mx-auto grid w-full max-w-lg grid-cols-3 gap-3 pt-2 pb-2">
          {benefits.map((item) => (
            <li key={item.title} className="text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-card text-primary shadow-[var(--shadow-soft)]">
                <Icon name={item.icon} className="size-5" />
              </span>
              <p className="mt-2 text-xs leading-5 font-semibold text-foreground">{item.title}</p>
              <p className="text-xs leading-5 text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
