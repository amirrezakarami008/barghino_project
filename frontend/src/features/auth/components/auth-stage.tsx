import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/shared/ui/icon";

export function AuthStage({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="auth-stage relative min-h-dvh">
      <div className="fixed inset-0 z-0">
        <Image
          src="/auth-sunset.jpg"
          alt="خانه با نیروگاه خورشیدی در غروب"
          fill
          priority
          className="object-cover object-[center_42%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-ink-950/35"
          aria-hidden
        />
      </div>
      <Link
        href="/"
        className="glass-strong fixed top-5 start-5 z-20 inline-flex min-h-11 items-center gap-1 rounded-pill px-3 py-2 text-sm font-semibold shadow-soft"
      >
        <Icon name="arrow" className="size-4" />
        بازگشت به سایت
      </Link>
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-16 sm:px-8 lg:justify-end lg:py-10 lg:pe-16 xl:pe-24">
        <div
          className={`auth-surface glass-strong relative w-full ${wide ? "max-w-lg" : "max-w-md"} overflow-hidden rounded-xl shadow-lifted`}
        >
          <div className="pointer-events-none absolute -top-20 -start-10 size-48 rounded-pill bg-card/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -end-8 size-40 rounded-pill bg-mint/70 blur-3xl" />
          <div id="content" className="relative px-4 pt-7 pb-8 sm:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
