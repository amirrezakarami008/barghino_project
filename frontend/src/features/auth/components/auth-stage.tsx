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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(18_36_58/0.28)_100%)]" />
      </div>
      <Link
        href="/"
        className="fixed top-5 start-5 z-20 inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/55 px-3 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] backdrop-blur-md"
      >
        <Icon name="arrow" className="size-4" />
        بازگشت به سایت
      </Link>
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-16 sm:px-8 lg:justify-end lg:py-10 lg:pe-16 xl:pe-24">
        <div
          className={`auth-surface relative w-full ${wide ? "max-w-lg" : "max-w-md"} overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/72 shadow-[0_28px_70px_rgb(18_36_58/0.24),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-2xl backdrop-saturate-150`}
        >
          <div className="pointer-events-none absolute -top-20 -start-10 size-48 rounded-full bg-white/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -end-8 size-40 rounded-full bg-mint/70 blur-3xl" />
          <div id="content" className="relative px-6 pt-7 pb-8 sm:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
