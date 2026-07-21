import { cn } from "@/lib/utils";
import { ArrowLeft } from "@/lib/icons";
import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-l from-brand-600 via-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:brightness-110 active:scale-[0.98]",
  accent:
    "bg-gradient-to-l from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:brightness-110 active:scale-[0.98]",
  secondary:
    "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30",
  outline:
    "border-2 border-brand-500/80 text-brand-600 bg-white/80 backdrop-blur-sm hover:bg-brand-50 hover:border-brand-500 hover:shadow-md hover:shadow-brand-500/10",
  ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-1.5 rounded-lg",
  md: "px-6 py-2.5 text-sm gap-2 rounded-xl sm:py-3",
  lg: "px-8 py-3.5 text-base gap-2.5 rounded-xl sm:py-4",
};

function ButtonContent({
  children,
  icon,
  iconPosition = "end",
}: Pick<ButtonProps, "children" | "icon" | "iconPosition">) {
  return (
    <>
      {icon && iconPosition === "start" && icon}
      {children}
      {icon && iconPosition === "end" && icon}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "end",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <ButtonContent icon={icon} iconPosition={iconPosition}>
      {children}
    </ButtonContent>
  );

  const { onClick, ...buttonProps } = props;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...buttonProps}>
      {content}
    </button>
  );
}

export function LinkArrow() {
  return <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />;
}
