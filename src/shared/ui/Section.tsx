import { cn } from "@/shared/lib/utils";
import type { SectionHeaderProps } from "@/shared/types";
import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: "default" | "muted" | "dark" | "gradient" | "mesh";
  /** فشرده‌تر — برای صفحاتی با بخش‌های زیاد */
  compact?: boolean;
}

const backgroundStyles = {
  default: "bg-white",
  muted: "bg-mesh-light bg-grid",
  dark: "bg-mesh-dark bg-grid-dark text-white",
  gradient: "bg-gradient-to-b from-slate-50 via-white to-brand-50/30",
  mesh: "bg-mesh-light",
};

export function Section({
  id,
  children,
  className,
  background = "default",
  compact = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        compact ? "py-8 sm:py-10 lg:py-12" : "py-10 sm:py-12 lg:py-16",
        backgroundStyles[background],
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  compact = false,
}: SectionHeaderProps) {
  const alignStyles = align === "center" ? "text-center mx-auto" : "text-start";

  return (
    <div className={cn("max-w-3xl", compact ? "mb-5 sm:mb-6" : "mb-6 sm:mb-8", alignStyles)}>
      {badge && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/80 px-3.5 py-1 text-sm font-semibold text-brand-700 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {badge}
        </span>
      )}
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl lg:leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-slate-600 lg:text-lg">{description}</p>
      )}
    </div>
  );
}

export function SectionHeaderDark(props: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        props.compact ? "mb-6 sm:mb-8" : "mb-8 sm:mb-10",
        props.align === "start" ? "text-start" : "text-center mx-auto",
      )}
    >
      {props.badge && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-sm font-semibold text-brand-300 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          {props.badge}
        </span>
      )}
      <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl lg:leading-tight">
        {props.title}
      </h2>
      {props.description && (
        <p className="mt-3 text-base leading-relaxed text-slate-400 lg:text-lg">{props.description}</p>
      )}
    </div>
  );
}

/** نوار جداکننده بین بخش‌ها — فضای خالی را پر می‌کند */
export function SectionDivider() {
  return (
    <div className="relative h-px bg-gradient-to-l from-transparent via-brand-200/60 to-transparent" aria-hidden />
  );
}
