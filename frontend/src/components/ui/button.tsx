import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-[transform,box-shadow,background-color,opacity] duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-grad-sun text-primary-foreground shadow-sun-glow hover:brightness-105",
        secondary:
          "border border-border bg-card text-foreground shadow-soft hover:border-energy-300 hover:bg-mint",
        ghost: "bg-transparent text-foreground hover:bg-surface",
        danger:
          "bg-danger text-danger-foreground shadow-soft hover:brightness-110",
      },
      size: {
        sm: "min-h-11 px-3 text-sm",
        md: "min-h-11 px-5",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11 shrink-0 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isIconOnly = size === "icon";

  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="ui-spinner size-4 rounded-pill border-2 border-current border-e-transparent"
          aria-hidden
        />
      ) : (
        startIcon
      )}
      {isIconOnly ? <span className="sr-only">{children}</span> : children}
      {!loading && endIcon}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  startIcon,
  endIcon,
}: {
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {startIcon}
      {children}
      {endIcon}
    </Link>
  );
}

export { buttonVariants };
