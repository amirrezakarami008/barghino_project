import { cn } from "@/shared/lib/utils";
import { getIcon } from "@/shared/lib/icons";
import { createElement, type ReactNode } from "react";

interface IconBoxProps {
  icon: string;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "soft" | "gradient";
  gradient?: string;
}

const sizeStyles = {
  sm: "h-10 w-10 rounded-xl",
  md: "h-12 w-12 rounded-xl",
  lg: "h-14 w-14 rounded-2xl",
};

const iconSizeStyles = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

export function IconBox({
  icon,
  className,
  iconClassName,
  size = "md",
  variant = "soft",
  gradient,
}: IconBoxProps) {
  const variantStyles = {
    solid: "bg-brand-600 text-white shadow-lg shadow-brand-500/25",
    soft: "bg-brand-50 text-brand-600 ring-1 ring-brand-100",
    gradient: cn(
      "text-white shadow-lg bg-linear-to-br",
      gradient ?? "from-brand-500 via-brand-400 to-brand-600 shadow-brand-500/30",
    ),
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    >
      {createElement(getIcon(icon), {
        className: cn(iconSizeStyles[size], iconClassName),
      })}
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/8 sm:p-5",
        className,
      )}
    >
      <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-linear-to-br from-brand-400/10 to-transparent transition-transform duration-700 group-hover:scale-150" />
      <IconBox icon={icon} size="sm" className="relative mb-3" variant="gradient" />
      <h3 className="relative mb-1.5 font-display text-base font-bold text-slate-900">{title}</h3>
      <p className="relative text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

interface StatCardProps {
  value: string;
  suffix?: string;
  label: string;
}

export function StatCard({ value, suffix, label }: StatCardProps) {
  return (
    <div className="group relative text-center">
      <div className="absolute inset-0 -z-10 rounded-2xl bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="mb-1.5 font-display text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
        {value}
        {suffix && (
          <span className="text-2xl font-bold text-brand-300 lg:text-3xl">{suffix}</span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-400 lg:text-base">{label}</p>
    </div>
  );
}

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export function StepCard({ step, title, description, isLast }: StepCardProps) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      {!isLast && (
        <div className="absolute right-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-linear-to-l from-brand-300 via-brand-200 to-transparent md:block" />
      )}
      <div className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 via-brand-400 to-brand-600 font-display text-lg font-extrabold text-white shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14 sm:text-xl">
        {step}
        <div className="absolute inset-0 rounded-xl bg-linear-to-t from-white/20 to-transparent" />
      </div>
      <h3 className="mb-1 font-display text-base font-bold text-slate-900">{title}</h3>
      <p className="max-w-xs text-xs leading-relaxed text-slate-600 sm:text-sm">{description}</p>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100",
        className,
      )}
    >
      {children}
    </span>
  );
}
