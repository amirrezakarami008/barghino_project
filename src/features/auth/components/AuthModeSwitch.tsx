import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface AuthModeSwitchProps {
  mode: "login" | "register";
}

const MODES = [
  { id: "login" as const, href: "/login", label: "ورود" },
  { id: "register" as const, href: "/register", label: "ثبت‌نام" },
];

export function AuthModeSwitch({ mode }: AuthModeSwitchProps) {
  const activeIndex = MODES.findIndex((item) => item.id === mode);

  return (
    <nav
      aria-label="حالت احراز هویت"
      className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-l from-brand-500 to-brand-400 shadow-[0_0_24px_rgba(6,182,212,0.45)] transition-[inset-inline-start] duration-300 ease-out"
        style={{
          insetInlineStart: activeIndex <= 0 ? "0.25rem" : "calc(50% + 0.125rem)",
        }}
      />
      {MODES.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "relative z-10 px-4 py-2 text-center text-sm font-semibold transition-colors duration-300 sm:px-5",
            mode === item.id ? "text-slate-950" : "text-slate-300 hover:text-white",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
