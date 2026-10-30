import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  radius?: "sm" | "md" | "lg" | "pill";
};

const radiusClass = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  pill: "rounded-pill",
} as const;

export function Skeleton({ className, radius = "md", ...props }: SkeletonProps) {
  return (
    <div
      className={cn("ui-skeleton bg-surface", radiusClass[radius], className)}
      aria-hidden
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3 w-full", index === lines - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}
