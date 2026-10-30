import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import type { StatusTone } from "./types";

export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  time: string;
  tone?: StatusTone | "neutral";
  meta?: ReactNode;
};

const toneDot: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  neutral: "bg-ink-400",
  pending: "bg-status-pending",
  approved: "bg-status-approved",
  rejected: "bg-status-rejected",
  draft: "bg-status-draft",
  active: "bg-status-active",
  closed: "bg-status-closed",
  expired: "bg-status-expired",
};

export type TimelineProps = {
  events: readonly TimelineEvent[];
  className?: string;
};

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className={cn("text-sm text-foreground-muted", className)}>رویدادی ثبت نشده است.</p>
    );
  }

  return (
    <ol className={cn("relative space-y-0 ps-6", className)}>
      <span
        aria-hidden
        className="absolute start-[0.55rem] top-2 bottom-2 w-px bg-border"
      />
      {events.map((event) => {
        const tone = event.tone ?? "neutral";
        return (
          <li key={event.id} className="relative pb-6 last:pb-0">
            <span
              aria-hidden
              className={cn(
                "absolute start-[-1.2rem] top-1.5 size-2.5 rounded-pill ring-4 ring-background",
                toneDot[tone],
              )}
            />
            <div className="space-y-1 rounded-md border border-transparent px-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <time className="text-caption tabular-nums text-foreground-muted">{event.time}</time>
              </div>
              {event.description ? (
                <p className="text-sm text-foreground-muted">{event.description}</p>
              ) : null}
              {event.meta}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
