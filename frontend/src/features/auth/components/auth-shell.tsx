"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthFlipCard } from "@/features/auth/components/auth-flip-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { ThemeToggle } from "@/shared/theme";
import { Icon, type IconName } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import "./auth-shell.css";

const features: { icon: IconName; tone: "leaf" | "shield" | "chart"; title: string; caption: string }[] = [
  { icon: "leaf", tone: "leaf", title: "بررسی شفاف", caption: "وضعیت درخواست در پنل" },
  { icon: "shield", tone: "shield", title: "قرارداد و سوابق", caption: "تاریخچه قابل مشاهده" },
  { icon: "chart", tone: "chart", title: "نصب نیروگاه", caption: "مسیر در حال تکمیل" },
];

function AuthShellInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const isRegister = pathname.startsWith("/register");
  const pathParam = searchParams.get("path") === "install" ? "install" : "sell";
  const query = searchParams.toString();
  const withQuery = (href: "/login" | "/register") => (query ? `${href}?${query}` : href);

  const enter = reduceMotion
    ? undefined
    : { opacity: 0, y: 18, filter: "blur(8px)" };
  const settled = { opacity: 1, y: 0, filter: "blur(0px)" };
  const brandItem = (delay: number) =>
    reduceMotion
      ? undefined
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className={cn("auth-shell", isRegister && "auth-shell--register")}>
      <div className="auth-shell__bg" aria-hidden>
        <div className="auth-shell__bg-zoom">
          <Image
            src="/images/auth-bg-dark.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 0px, 100vw"
            className="auth-shell__bg-img auth-shell__bg-img--dark auth-shell__bg-img--desktop"
          />
          <Image
            src="/images/auth-bg-light.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 0px, 100vw"
            className="auth-shell__bg-img auth-shell__bg-img--light auth-shell__bg-img--desktop"
          />
          <Image
            src="/images/auth-bg-dark-mobile.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 0px, 100vw"
            className="auth-shell__bg-img auth-shell__bg-img--dark auth-shell__bg-img--mobile"
          />
          <Image
            src="/images/auth-bg-light-mobile.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 0px, 100vw"
            className="auth-shell__bg-img auth-shell__bg-img--light auth-shell__bg-img--mobile"
          />
        </div>
        <div className="auth-shell__sun-glow" />
        <div className="auth-shell__overlay auth-shell__overlay--card" />
        <div className="auth-shell__overlay auth-shell__overlay--bottom" />
        <div className="auth-shell__overlay auth-shell__overlay--top" />
      </div>

      <div className="auth-shell__top">
        <Link href="/" className="auth-shell__pill auth-shell__back">
          <Icon name="arrow" className="size-4" />
          بازگشت به سایت
        </Link>
        <ThemeToggle showLabel className="auth-shell__pill auth-shell__theme" />
      </div>

      <div className="auth-shell__body">
        <aside className="auth-shell__brand">
          <div className="auth-shell__brand-scrim" aria-hidden />
          <motion.div className="auth-shell__brand-inner" {...brandItem(0.08)}>
            <span className="auth-shell__badge">
              <Icon name="bolt" className="size-3.5" />
              برقینو
            </span>
            <h1 className="auth-shell__headline">
              پلتفرم فروش برق خانگی و{" "}
              <span className="auth-shell__headline-accent">نیروگاه خورشیدی</span>
            </h1>
            <p className="auth-shell__lede">
              مسیر فروش برق نیروگاه خورشیدی‌تان را شفاف و قابل‌پیگیری کنید.
            </p>
            <ul className="auth-shell__features">
              {features.map((item, index) => (
                <motion.li
                  key={item.title}
                  className="auth-shell__feature"
                  {...brandItem(0.18 + index * 0.08)}
                >
                  <span className={cn("auth-shell__feature-icon", `auth-shell__feature-icon--${item.tone}`)} aria-hidden>
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="auth-shell__feature-title">{item.title}</span>
                    <span className="auth-shell__feature-caption">{item.caption}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </aside>

        <div id="content" tabIndex={-1} className="auth-shell__card-col outline-none focus:outline-none">
          <motion.div
            className="auth-shell__mobile-brand"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="auth-shell__badge">
              <Icon name="bolt" className="size-3.5" />
              برقینو
            </span>
            <p className="auth-shell__mobile-headline">
              پلتفرم فروش برق خانگی و{" "}
              <span className="auth-shell__headline-accent">نیروگاه خورشیدی</span>
            </p>
          </motion.div>

          <motion.div
            className="auth-shell__card-wrap"
            initial={enter}
            animate={settled}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthFlipCard
              isRegister={isRegister}
              loginFace={<LoginForm embedded switchHref={withQuery("/register")} />}
              registerFace={
                <RegisterForm
                  embedded
                  initialPath={pathParam}
                  switchHref={withQuery("/login")}
                />
              }
            />
            <p className="auth-shell__legal">
              {isRegister ? (
                <>
                  با ثبت‌نام، شما با{" "}
                  <Link href="/terms">شرایط</Link> و <Link href="/privacy">قوانین</Link> موافقت
                  می‌کنید.
                </>
              ) : (
                <>
                  با ورود، شما با{" "}
                  <Link href="/terms">شرایط</Link> و <Link href="/privacy">قوانین</Link> موافقت
                  می‌کنید.
                </>
              )}
            </p>
          </motion.div>

          <ul className="auth-shell__chips" aria-label="ویژگی‌ها">
            {features.map((item) => (
              <li key={item.title} className="auth-shell__chip">
                <Icon name={item.icon} className="size-3.5" />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AuthShell() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell auth-shell--fallback">
          <p className="auth-shell__fallback-text">در حال آماده‌سازی…</p>
        </div>
      }
    >
      <AuthShellInner />
    </Suspense>
  );
}
