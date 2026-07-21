import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

const sizeStyles = {
  default: "max-w-[82rem]",
  narrow: "max-w-3xl",
  wide: "max-w-[90rem]",
};

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeStyles[size], className)}>
      {children}
    </div>
  );
}
