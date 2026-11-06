import Image from "next/image";
import { Badge, ButtonLink, StatusPill } from "@/components/ui";
import { formatFa } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import "./home-hero.css";

const HERO_IMAGE_SRC = "/images/hero-solar.webp";

const trustChips = ["بررسی شفاف", "دلیل رد قابل مشاهده", "سوابق قرارداد"] as const;

const timelineSteps = [
  { label: "ثبت انشعاب", state: "done" as const, meta: "انجام شد" },
  { label: "ثبت نیروگاه", state: "done" as const, meta: "انجام شد" },
  { label: "بررسی شرکت", state: "current" as const, meta: "در انتظار" },
  { label: "پیش‌نویس", state: "todo" as const, meta: "آماده نشده" },
];

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__grid" aria-hidden />
      <div className="home-hero__sun-glow" aria-hidden />
      <div className="home-hero__fade" aria-hidden />

      <div className="home-hero__inner">
        <div className="min-w-0">
          <span className="home-hero__badge">
            <span className="home-hero__badge-dot" aria-hidden />
            پلتفرم خدمات انرژی خورشیدی
          </span>

          <h1 id="home-hero-title" className="home-hero__title">
            نیروگاه خورشیدی‌ات را به{" "}
            <span className="home-hero__title-accent">مسیر فروش شفاف</span> و قابل‌پیگیری وصل کن
          </h1>

          <p className="home-hero__subtitle">
            از ثبت انشعاب تا پیش‌نویس قرارداد، وضعیت‌ها دیده می‌شوند.
          </p>

          <div className="home-hero__actions">
            <ButtonLink
              href="/register?path=sell"
              size="lg"
              className="home-hero__cta-primary justify-center sm:justify-start"
            >
              نیروگاه دارم، می‌خواهم برق بفروشم
              <Icon name="arrow" className="size-4 -scale-x-100" />
            </ButtonLink>
            <ButtonLink
              href="/register?path=install"
              variant="ghost"
              size="lg"
              className="home-hero__cta-secondary justify-center sm:justify-start"
            >
              نیروگاه ندارم، می‌خواهم نصب کنم
            </ButtonLink>
          </div>

          <p className="home-hero__note">بدون وعدهٔ درآمد تضمینی</p>

          <ul className="home-hero__chips">
            {trustChips.map((chip) => (
              <li key={chip} className="home-hero__chip">
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-hero__visual" aria-label="پیش‌نمایش نمونه وضعیت قرارداد">
          <div className="home-hero__media">
            <span className="home-hero__media-frame" aria-hidden />
            <Image
              src={HERO_IMAGE_SRC}
              alt="خانه با پنل‌های خورشیدی روی بام در غروب"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-left"
            />
            <div className="home-hero__media-overlay" aria-hidden />
          </div>

          <div className="home-hero__cards">
            <article className="home-hero__card home-hero__card--status">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-nav font-semibold text-foreground">وضعیت قرارداد</h2>
                <Badge tone="soft">نمونه</Badge>
              </div>
              <div className="mt-2.5">
                <StatusPill status="pending" label="در انتظار بررسی" />
              </div>
              <ol className="home-hero__timeline">
                {timelineSteps.map((step, index) => (
                  <li key={step.label} className="home-hero__timeline-row">
                    <span className="home-hero__timeline-dot" data-state={step.state} aria-hidden />
                    <span className="min-w-0 text-foreground">
                      <span className="text-foreground-muted tabular-nums">
                        {formatFa(index + 1)}.{" "}
                      </span>
                      {step.label}
                    </span>
                    <span
                      className={
                        step.state === "done"
                          ? "font-semibold text-status-approved"
                          : step.state === "current"
                            ? "font-semibold text-status-pending"
                            : "font-semibold text-status-draft"
                      }
                    >
                      {step.meta}
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="home-hero__card home-hero__card--step">
              <div className="flex items-start justify-between gap-2">
                <p className="text-nav font-bold text-foreground">گام فعلی: انتخاب پلن</p>
                <Badge tone="soft">نمونه</Badge>
              </div>
              <p className="mt-1.5 text-foreground-muted">نرخ و تعهد در قرارداد نهایی می‌شود.</p>
              <div
                className="home-hero__progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={62}
                aria-label="پیشرفت نمونه مسیر"
              >
                <div className="home-hero__progress-bar" />
              </div>
              <p className="mt-2 tabular-nums text-foreground-muted">
                {formatFa(62)}٪ مسیر نمونه
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
