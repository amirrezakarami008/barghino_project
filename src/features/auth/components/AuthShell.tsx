import Link from "next/link";
import { SITE_CONFIG } from "@/config";
import { Zap } from "@/shared/lib/icons";
import type { ReactNode } from "react";
import { AUTH_COPY } from "../constants";
import { AuthAtmosphere } from "./AuthAtmosphere";
import { AuthModeSwitch } from "./AuthModeSwitch";

interface AuthShellProps {
  children: ReactNode;
  mode: "login" | "register";
}

export function AuthShell({ children, mode }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <AuthAtmosphere />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 shadow-[0_0_40px_-8px_rgba(6,182,212,0.8)] transition-transform duration-500 group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold tracking-tight">
                {SITE_CONFIG.name}
              </span>
              <span className="hidden text-xs text-slate-400 sm:block">{SITE_CONFIG.tagline}</span>
            </span>
          </Link>

          <AuthModeSwitch mode={mode} />
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-6">
          <section className="auth-rise relative max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-brand-300">
              <span className="h-px w-8 bg-gradient-to-l from-brand-400 to-transparent" />
              {mode === "login" ? AUTH_COPY.login.eyebrow : AUTH_COPY.register.eyebrow}
            </p>

            <h1 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-black leading-[0.92] tracking-tight">
              <span className="block text-white">{SITE_CONFIG.name}</span>
              <span className="mt-2 block bg-gradient-to-l from-brand-200 via-brand-400 to-accent-400 bg-clip-text text-transparent">
                {mode === "login" ? "ورود امن" : "شروع تازه"}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
              {AUTH_COPY.brandHint}
            </p>

            <div className="mt-10 hidden items-center gap-6 text-sm text-slate-400 lg:flex">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                ثبت‌نام ۳ دقیقه‌ای
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span>کاهش هزینه تا ۶۰٪</span>
            </div>
          </section>

          <section className="auth-rise-delay relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-brand-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand-300/60 to-transparent" />
              <div className="pointer-events-none absolute -top-24 start-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-brand-400/20 blur-3xl" />
              <div className="relative">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
