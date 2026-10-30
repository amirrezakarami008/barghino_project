import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const cardVariants = cva(
  "rounded-lg text-foreground transition-[transform,box-shadow] duration-fast ease-out",
  {
    variants: {
      variant: {
        solid: "border border-border bg-card p-5 shadow-soft",
        glass: "glass p-5",
        "gradient-border": "grad-border-shell p-px shadow-soft",
        interactive:
          "border border-border bg-card p-5 shadow-soft hover:-translate-y-0.5 hover:shadow-lifted focus-within:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  },
);

export type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, children, ...props }: CardProps) {
  if (variant === "gradient-border") {
    return (
      <div className={cn(cardVariants({ variant }), className)} {...props}>
        <div className="rounded-[calc(var(--radius-lg)-1px)] bg-card p-5">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { cardVariants };
