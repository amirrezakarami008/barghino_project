"use client";

import { cn } from "@/shared/lib/cn";
import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
};

/** Animated sun ↔ moon morph toggle for header placement. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex size-11 items-center justify-center overflow-hidden rounded-pill border border-border bg-card text-foreground shadow-soft transition-[background-color,box-shadow,transform] duration-standard ease-out hover:bg-surface hover:shadow-volt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={isDark ? "فعال‌سازی حالت روشن" : "فعال‌سازی حالت تاریک"}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
      aria-pressed={isDark}
    >
      <span className="sr-only">{isDark ? "تاریک" : "روشن"}</span>
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Sun core → Moon body */}
        <circle
          cx="12"
          cy="12"
          r="4.25"
          className={cn(
            "origin-center fill-current transition-[transform,opacity] duration-500 ease-out",
            isDark ? "scale-75 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <path
          d="M14.5 3.5a7.5 7.5 0 1 0 6 11.7A6.2 6.2 0 0 1 14.5 3.5Z"
          className={cn(
            "origin-center fill-current transition-[transform,opacity] duration-500 ease-out",
            isDark ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        />
        {/* Sun rays */}
        <g
          className={cn(
            "origin-center transition-[transform,opacity] duration-500 ease-out",
            isDark ? "scale-50 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0",
          )}
        >
          <path d="M12 2v2.2" />
          <path d="M12 19.8V22" />
          <path d="M4.93 4.93l1.56 1.56" />
          <path d="M17.51 17.51l1.56 1.56" />
          <path d="M2 12h2.2" />
          <path d="M19.8 12H22" />
          <path d="M4.93 19.07l1.56-1.56" />
          <path d="M17.51 6.49l1.56-1.56" />
        </g>
      </svg>
    </button>
  );
}
