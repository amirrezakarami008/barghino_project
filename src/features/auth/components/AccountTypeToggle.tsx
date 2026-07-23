"use client";

import { cn } from "@/shared/lib/utils";
import { ACCOUNT_TYPES } from "../constants";
import type { AccountType } from "../types";
import { Building2, Check, UserRound } from "@/shared/lib/icons";

interface AccountTypeToggleProps {
  value: AccountType;
  onChange: (value: AccountType) => void;
  className?: string;
  variant?: "compact" | "featured";
}

const ICONS = {
  individual: UserRound,
  legal: Building2,
} as const;

export function AccountTypeToggle({
  value,
  onChange,
  className,
  variant = "compact",
}: AccountTypeToggleProps) {
  if (variant === "featured") {
    return (
      <div role="radiogroup" aria-label="نوع حساب" className={cn("grid gap-3", className)}>
        {ACCOUNT_TYPES.map((type) => {
          const Icon = ICONS[type.value];
          const active = value === type.value;
          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(type.value)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-start transition-all duration-300",
                active
                  ? "border-brand-400/50 bg-brand-500/15 shadow-[0_0_40px_-12px_rgba(6,182,212,0.55)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                    active
                      ? "bg-brand-400 text-slate-950"
                      : "bg-white/5 text-slate-300 group-hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-white">{type.title}</span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300",
                        active
                          ? "border-brand-300 bg-brand-400 text-slate-950"
                          : "border-white/20 text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                    {type.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="نوع حساب"
      className={cn("grid grid-cols-2 gap-2", className)}
    >
      {ACCOUNT_TYPES.map((type) => {
        const Icon = ICONS[type.value];
        const active = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(type.value)}
            className={cn(
              "relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-300",
              active
                ? "border-brand-400/40 bg-brand-500/20 text-brand-100 shadow-[0_0_28px_-10px_rgba(6,182,212,0.7)]"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
