"use client";

import type { MouseEvent } from "react";
import { Alert, Badge } from "@/components/ui";
import { Reveal } from "@/features/marketing/reveal";
import { Icon } from "@/shared/ui/icon";
import "./home-trust.css";

const historyEvents = [
  "پیش‌نویس قرارداد ایجاد شد",
  "مدارک برای بررسی دریافت شد",
  "وضعیت به «در انتظار بررسی» تغییر کرد",
] as const;

function setSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

export function HomeTrust() {
  return (
    <section className="home-trust" aria-labelledby="home-trust-title">
      <div className="home-trust__inner">
        <Reveal>
          <header className="mx-auto max-w-2xl text-center">
            <h2 id="home-trust-title" className="text-h2">
              اعتماد روی شفافیت
            </h2>
            <p className="mt-3 text-body text-foreground-muted">
              مسیر فروش وقتی قابل اتکاست که وضعیت، دلیل رد، تاریخچه و مدارک روشن باشند.
            </p>
          </header>

          <ul className="home-trust__bento">
            <li
              className="home-trust__card home-trust__card--transparency"
              onMouseMove={setSpotlight}
            >
              <span className="home-trust__spot" aria-hidden />
              <span className="home-trust__icon home-trust__icon--sun" aria-hidden>
                <Icon name="eye" className="size-5" />
              </span>
              <h3 className="home-trust__title">بررسی شفاف</h3>
              <p className="home-trust__body">
                وضعیت درخواست را مرحله‌به‌مرحله در پنل می‌بینید؛ بدون حدس زدن پشت صحنه.
              </p>
            </li>

            <li
              className="home-trust__card home-trust__card--rejection"
              onMouseMove={setSpotlight}
            >
              <span className="home-trust__spot" aria-hidden />
              <span className="home-trust__icon home-trust__icon--rose" aria-hidden>
                <Icon name="file" className="size-5" />
              </span>
              <h3 className="home-trust__title">دلیل رد قابل‌مشاهده</h3>
              <p className="home-trust__body">
                اگر چیزی رد شود، دلیلش ثبت می‌شود تا بتوانید اصلاح کنید.
              </p>
              <div className="home-trust__snippet">
                <span className="home-trust__snippet-label">
                  <Badge tone="soft">نمونه</Badge>
                </span>
                <Alert tone="danger" title="درخواست رد شد">
                  تصویر کارت ملی ناخواناست؛ لطفاً فایل واضح‌تری بارگذاری کنید.
                </Alert>
              </div>
            </li>

            <li
              className="home-trust__card home-trust__card--history"
              onMouseMove={setSpotlight}
            >
              <span className="home-trust__spot" aria-hidden />
              <span className="home-trust__icon home-trust__icon--energy" aria-hidden>
                <Icon name="clock" className="size-5" />
              </span>
              <h3 className="home-trust__title">تاریخچه قرارداد</h3>
              <p className="home-trust__body">
                رویدادهای قرارداد از پیش‌نویس تا تأیید در یک خط زمانی می‌ماند.
              </p>
              <div className="home-trust__snippet">
                <span className="home-trust__snippet-label">
                  <Badge tone="soft">نمونه</Badge>
                </span>
                <ol className="home-trust__timeline">
                  {historyEvents.map((event) => (
                    <li key={event} className="home-trust__timeline-item">
                      <span className="home-trust__timeline-dot" aria-hidden />
                      <span>{event}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </li>

            <li
              className="home-trust__card home-trust__card--privacy"
              onMouseMove={setSpotlight}
            >
              <span className="home-trust__spot" aria-hidden />
              <span className="home-trust__icon home-trust__icon--volt" aria-hidden>
                <Icon name="lock" className="size-5" />
              </span>
              <h3 className="home-trust__title">ذخیره خصوصی مدارک</h3>
              <p className="home-trust__body">
                مدارک هویتی و فایل قرارداد فقط برای شما و کارشناس مجاز در دسترس است.
              </p>
              <div className="home-trust__lock" aria-hidden>
                <div className="home-trust__lock-ring">
                  <Icon name="lock" />
                </div>
              </div>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
