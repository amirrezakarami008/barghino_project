import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/shared/lib/cx";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border bg-card text-primary hover:border-primary/30 hover:bg-mint",
  ghost: "bg-transparent text-foreground hover:bg-mint",
  inverse: "bg-card text-primary hover:bg-mint",
} as const;

export type ButtonVariant = keyof typeof variants;

const base =
  "product-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cx(base, `product-button-${variant}`, variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
