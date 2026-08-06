"use client";

import { cn } from "@/shared/lib/utils";
import type { ProductionPoint } from "@/shared/types/dashboard";
import { Maximize2, Minimize2, X } from "lucide-react";
import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ProductionChartProps {
  data: ProductionPoint[];
  showEarnings?: boolean;
  /** نمایش سه سری: نیروگاه من / اطراف / میانگین کشور */
  compare?: boolean;
  /**
   * comfortable: ماهانه/هفتگی
   * compact: روزانه (~۳۰ ستون)
   */
  density?: "comfortable" | "compact";
  /** ایندکس انتخاب‌شده برای هایلایت */
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  /** دکمه و حالت تمام‌صفحه */
  enableFullscreen?: boolean;
  fullscreenTitle?: string;
  fullscreenDescription?: string;
  /** کنترل‌های اضافی در هدر تمام‌صفحه (مثلاً سوییچ بازه) */
  fullscreenToolbar?: ReactNode;
  className?: string;
}

type HoverTip = {
  index: number;
  x: number;
  y: number;
  place: "above" | "below";
  align: "start" | "center" | "end";
};

export function ProductionChart({
  data,
  showEarnings = false,
  compare = false,
  density = "comfortable",
  activeIndex,
  onSelectIndex,
  enableFullscreen = true,
  fullscreenTitle = "نمودار تولید",
  fullscreenDescription,
  fullscreenToolbar,
  className,
}: ProductionChartProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!fullscreen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const chartProps = {
    data,
    showEarnings,
    compare,
    density,
    activeIndex,
    onSelectIndex,
  } as const;

  return (
    <>
      <div className={cn("relative w-full", className)}>
        {enableFullscreen && (
          <div className="mb-3 flex justify-end">
            <FullscreenToggle
              active={false}
              onClick={() => setFullscreen(true)}
              label="نمایش تمام‌صفحه"
            />
          </div>
        )}
        <ChartBody {...chartProps} expanded={false} />
      </div>

      {enableFullscreen &&
        fullscreen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[90] flex h-[100dvh] w-screen flex-col bg-white"
          >
            <div className="shrink-0 border-b border-slate-100 bg-gradient-to-l from-brand-50/80 via-white to-sky-50/60 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p
                    id={titleId}
                    className="font-display text-lg font-bold text-slate-900 sm:text-xl"
                  >
                    {fullscreenTitle}
                  </p>
                  {fullscreenDescription && (
                    <p className="mt-0.5 text-sm text-slate-500">{fullscreenDescription}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {fullscreenToolbar}
                  <FullscreenToggle
                    active
                    onClick={() => setFullscreen(false)}
                    label="خروج از تمام‌صفحه"
                  />
                  <button
                    type="button"
                    onClick={() => setFullscreen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    aria-label="بستن"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex min-h-0 flex-1 flex-col justify-center">
                <ChartBody {...chartProps} expanded />
              </div>
              <p className="mt-3 shrink-0 text-center text-[11px] text-slate-400">
                Esc برای بستن
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function FullscreenToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = active ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition",
        active
          ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{active ? "خروج" : "تمام‌صفحه"}</span>
    </button>
  );
}

function ChartBody({
  data,
  showEarnings = false,
  compare = false,
  density = "comfortable",
  activeIndex,
  onSelectIndex,
  expanded = false,
}: {
  data: ProductionPoint[];
  showEarnings?: boolean;
  compare?: boolean;
  density?: "comfortable" | "compact";
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  expanded?: boolean;
}) {
  const enableCompare = compare;
  const compact = density === "compact";
  const [hover, setHover] = useState<HoverTip | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (hover == null) return;
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, [hover]);

  const maxProduction = Math.max(
    ...data.map((d) =>
      Math.max(
        d.production,
        enableCompare ? (d.neighborProduction ?? 0) : 0,
        enableCompare ? (d.nationalProduction ?? 0) : 0,
      ),
    ),
    1,
  );

  const labelStep = compact ? (data.length > 20 ? 5 : 2) : 1;
  const hoveredPoint = hover ? data[hover.index] : null;

  function showTip(index: number, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const tipHeight = enableCompare ? 168 : showEarnings ? 110 : 86;
    const tipWidth = 200;
    const gap = 10;

    const spaceAbove = rect.top;
    const place: HoverTip["place"] =
      spaceAbove < tipHeight + gap + 8 ? "below" : "above";

    let align: HoverTip["align"] = "center";
    const centerX = rect.left + rect.width / 2;
    if (centerX < tipWidth / 2 + 12) align = "start";
    else if (centerX > window.innerWidth - tipWidth / 2 - 12) align = "end";

    setHover({
      index,
      x: centerX,
      y: place === "above" ? rect.top - gap : rect.bottom + gap,
      place,
      align,
    });
  }

  return (
    <div className={cn("w-full", expanded && "flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "mb-4",
          expanded && "min-h-0 flex-1",
          compact &&
            "-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin] sm:mx-0 sm:overflow-visible sm:pb-0",
        )}
      >
        <div
          className={cn(
            "flex items-end justify-between",
            expanded && "h-full",
            compact
              ? cn(
                  "gap-px sm:gap-0.5",
                  expanded ? "min-w-[52rem] sm:min-w-0" : "min-w-[42rem] sm:min-w-0",
                )
              : "gap-1.5 sm:gap-3",
          )}
        >
          {data.map((point, index) => {
            const ownH = (point.production / maxProduction) * 100;
            const neighborH = ((point.neighborProduction ?? 0) / maxProduction) * 100;
            const nationalH = ((point.nationalProduction ?? 0) / maxProduction) * 100;
            const showLabel = !compact || index % labelStep === 0 || index === data.length - 1;
            const isActive = activeIndex === index;
            const axisLabel = point.shortLabel ?? point.label;

            return (
              <button
                key={`${point.label}-${index}`}
                type="button"
                onClick={() => onSelectIndex?.(index)}
                onMouseEnter={(e) => showTip(index, e.currentTarget)}
                onMouseMove={(e) => showTip(index, e.currentTarget)}
                onMouseLeave={() => setHover(null)}
                onFocus={(e) => showTip(index, e.currentTarget)}
                onBlur={() => setHover(null)}
                className={cn(
                  "group relative flex flex-1 flex-col items-center gap-1.5 sm:gap-2",
                  expanded && "h-full justify-end",
                  compact && (expanded ? "min-w-[0.85rem]" : "min-w-[0.7rem]"),
                )}
              >
                <div
                  className={cn(
                    "relative flex w-full items-end justify-center rounded-lg transition-colors",
                    expanded
                      ? compact
                        ? "h-[min(62dvh,34rem)] gap-px sm:h-full sm:min-h-[22rem] sm:gap-0.5"
                        : "h-[min(62dvh,34rem)] gap-0.5 sm:h-full sm:min-h-[22rem] sm:gap-1"
                      : compact
                        ? "h-40 gap-px sm:h-48 sm:gap-0.5"
                        : "h-44 gap-0.5 sm:h-52 sm:gap-1",
                    isActive
                      ? "bg-brand-50/90 ring-1 ring-brand-200/80"
                      : "group-hover:bg-slate-50/80",
                  )}
                >
                  {enableCompare ? (
                    <>
                      <Bar height={ownH} tone="own" compact={compact} expanded={expanded} />
                      <Bar
                        height={neighborH}
                        tone="neighbor"
                        compact={compact}
                        expanded={expanded}
                      />
                      <Bar
                        height={nationalH}
                        tone="national"
                        compact={compact}
                        expanded={expanded}
                      />
                    </>
                  ) : (
                    <Bar height={ownH} tone="own" single compact={compact} expanded={expanded} />
                  )}
                </div>

                <span
                  className={cn(
                    "font-medium transition-colors",
                    compact
                      ? expanded
                        ? "text-[9px] sm:text-[10px]"
                        : "text-[8px] sm:text-[9px]"
                      : "text-[10px] sm:text-xs",
                    showLabel ? "text-slate-500 group-hover:text-slate-800" : "text-transparent",
                    isActive && showLabel && "text-brand-700",
                  )}
                >
                  {axisLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <LegendDot className="bg-gradient-to-t from-brand-600 to-brand-400" label="نیروگاه من" />
        {enableCompare && (
          <>
            <LegendDot className="bg-gradient-to-t from-sky-500 to-sky-300" label="بام‌های اطراف" />
            <LegendDot
              className="bg-gradient-to-t from-slate-400 to-slate-300"
              label="میانگین کشور"
            />
          </>
        )}
        {showEarnings && !enableCompare && (
          <LegendDot className="bg-emerald-500" label="درآمد (میلیون تومان)" />
        )}
        {compact && (
          <span className="text-[10px] text-slate-400">اسکرول افقی در موبایل · هاور برای جزئیات</span>
        )}
      </div>

      {mounted &&
        hover &&
        hoveredPoint &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-max max-w-[13rem]"
            style={{
              left: hover.x,
              top: hover.y,
              transform:
                hover.place === "above"
                  ? hover.align === "center"
                    ? "translate(-50%, -100%)"
                    : hover.align === "start"
                      ? "translate(0, -100%)"
                      : "translate(-100%, -100%)"
                  : hover.align === "center"
                    ? "translate(-50%, 0)"
                    : hover.align === "start"
                      ? "translate(0, 0)"
                      : "translate(-100%, 0)",
            }}
          >
            <div
              className={cn(
                "rounded-xl border border-slate-200/90 bg-white p-3 text-right shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5",
                hover.place === "below" && "mb-0",
              )}
            >
              <p className="mb-2 text-[11px] font-bold text-slate-900">{hoveredPoint.label}</p>
              {enableCompare ? (
                <ul className="space-y-1.5 text-[11px]">
                  <HelperRow
                    tone="own"
                    label="نیروگاه من"
                    value={`${hoveredPoint.production.toLocaleString("fa-IR")} kWh`}
                  />
                  <HelperRow
                    tone="neighbor"
                    label="بام‌های اطراف"
                    value={`${(hoveredPoint.neighborProduction ?? 0).toLocaleString("fa-IR")} kWh`}
                  />
                  <HelperRow
                    tone="national"
                    label="میانگین کشور"
                    value={`${(hoveredPoint.nationalProduction ?? 0).toLocaleString("fa-IR")} kWh`}
                  />
                  <HelperRow
                    tone="earn"
                    label="درآمد"
                    value={`${(hoveredPoint.earnings / 1_000_000).toLocaleString("fa-IR", {
                      maximumFractionDigits: 2,
                    })} M`}
                  />
                </ul>
              ) : (
                <ul className="space-y-1.5 text-[11px]">
                  <HelperRow
                    tone="own"
                    label="تولید"
                    value={`${hoveredPoint.production.toLocaleString("fa-IR")} kWh`}
                  />
                  {showEarnings && (
                    <HelperRow
                      tone="earn"
                      label="درآمد"
                      value={`${(hoveredPoint.earnings / 1_000_000).toLocaleString("fa-IR", {
                        maximumFractionDigits: 1,
                      })} میلیون`}
                    />
                  )}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function HelperRow({
  tone,
  label,
  value,
}: {
  tone: "own" | "neighbor" | "national" | "earn";
  label: string;
  value: string;
}) {
  const dots = {
    own: "bg-brand-500",
    neighbor: "bg-sky-400",
    national: "bg-slate-400",
    earn: "bg-emerald-500",
  };

  return (
    <li className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-slate-500">
        <span className={cn("h-2 w-2 rounded-sm", dots[tone])} />
        {label}
      </span>
      <span className="font-bold text-slate-800">{value}</span>
    </li>
  );
}

function Bar({
  height,
  tone,
  single,
  compact,
  expanded,
}: {
  height: number;
  tone: "own" | "neighbor" | "national";
  single?: boolean;
  compact?: boolean;
  expanded?: boolean;
}) {
  const tones = {
    own: "from-brand-600 to-brand-400 group-hover:from-brand-700 group-hover:to-brand-500",
    neighbor: "from-sky-500 to-sky-300 group-hover:from-sky-600 group-hover:to-sky-400",
    national: "from-slate-400 to-slate-300 group-hover:from-slate-500 group-hover:to-slate-400",
  };

  return (
    <div
      className={cn(
        "rounded-t-[3px] bg-gradient-to-t transition-all sm:rounded-t-md",
        tones[tone],
        single
          ? compact
            ? expanded
              ? "w-full max-w-[0.85rem] sm:max-w-[1.1rem]"
              : "w-full max-w-[0.55rem] sm:max-w-[0.7rem]"
            : expanded
              ? "w-full max-w-[3.5rem] sm:max-w-[4.25rem]"
              : "w-full max-w-[2.5rem] sm:max-w-[3rem]"
          : compact
            ? expanded
              ? "w-[30%] max-w-[0.55rem] sm:max-w-[0.7rem]"
              : "w-[30%] max-w-[0.35rem] sm:max-w-[0.45rem]"
            : expanded
              ? "w-[28%] max-w-[1.85rem] sm:max-w-[2.25rem]"
              : "w-[28%] max-w-[1.35rem] sm:max-w-[1.6rem]",
      )}
      style={{ height: `${Math.max(height, compact ? 3 : 4)}%` }}
    />
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-sm", className)} />
      {label}
    </span>
  );
}
