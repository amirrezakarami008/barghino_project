import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "bordered";
}

const paddingStyles = {
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
};

const variantStyles = {
  default: "border border-slate-200/60 bg-white shadow-sm",
  elevated: "border border-slate-100 bg-white shadow-lg shadow-slate-200/50",
  bordered: "border-2 border-slate-200/80 bg-white",
};

export function Card({
  children,
  className,
  hover = true,
  padding = "md",
  variant = "default",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        hover &&
          "card-shine transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-200/80 hover:shadow-xl hover:shadow-brand-500/8",
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-2xl shadow-2xl shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
