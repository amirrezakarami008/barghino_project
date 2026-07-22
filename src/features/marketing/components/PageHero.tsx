import { Container } from "@/shared/ui/Container";
import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

interface PageHeroProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: ReactNode;
  variant?: "default" | "dark" | "gradient";
}

const variantStyles = {
  default: "bg-mesh-light bg-grid border-b border-slate-200/60",
  dark: "bg-mesh-dark bg-grid-dark text-white",
  gradient: "bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 text-white",
};

export function PageHero({
  badge,
  title,
  highlight,
  description,
  children,
  variant = "default",
}: PageHeroProps) {
  const isDark = variant === "dark" || variant === "gradient";

  return (
    <section className={cn("relative py-10 sm:py-12 lg:py-16", variantStyles[variant])}>
      <Container>
        {badge && (
          <span
            className={cn(
              "mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
              isDark
                ? "border border-brand-400/30 bg-brand-500/10 text-brand-200"
                : "border border-brand-200 bg-brand-50 text-brand-700",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isDark ? "bg-brand-400" : "bg-brand-500")} />
            {badge}
          </span>
        )}
        <h1
          className={cn(
            "max-w-4xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl",
            isDark ? "text-white" : "text-slate-900",
          )}
        >
          {title}
          {highlight && (
            <>
              {" "}
              <span className={isDark ? "text-gradient" : "text-brand-600"}>{highlight}</span>
            </>
          )}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-lg leading-relaxed lg:text-xl",
              isDark ? "text-slate-300" : "text-slate-600",
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
