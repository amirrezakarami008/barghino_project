"use client";

import { cn } from "@/shared/lib/utils";
import { Eye, EyeOff } from "@/shared/lib/icons";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  containerClassName?: string;
}

export function AuthInput({
  label,
  error,
  hint,
  icon,
  containerClassName,
  id,
  type = "text",
  value,
  onFocus,
  onBlur,
  ...props
}: AuthInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;
  const hasValue = String(value ?? "").length > 0;
  const floating = focused || hasValue;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <div
        className={cn(
          "group relative rounded-2xl border bg-white/[0.04] transition-all duration-300",
          focused
            ? "border-brand-400/50 bg-brand-500/10 shadow-[0_0_0_4px_rgba(6,182,212,0.12)]"
            : error
              ? "border-red-400/40"
              : "border-white/10 hover:border-white/20",
        )}
      >
        {icon && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 start-3.5 flex items-center transition-colors duration-300",
              focused ? "text-brand-300" : "text-slate-500",
            )}
          >
            {icon}
          </span>
        )}

        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute start-0 z-10 origin-right transition-all duration-300",
            icon ? "ps-11" : "ps-4",
            floating
              ? "top-2 text-[11px] font-medium text-brand-300"
              : "top-1/2 -translate-y-1/2 text-sm text-slate-500",
          )}
        >
          {label}
        </label>

        <input
          id={inputId}
          type={resolvedType}
          value={value}
          className={cn(
            "w-full bg-transparent text-sm text-white outline-none placeholder:text-transparent",
            icon ? "ps-11" : "ps-4",
            isPassword ? "pe-11" : "pe-4",
            floating ? "pb-2.5 pt-6" : "py-3.5",
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 end-3.5 flex items-center text-slate-500 transition-colors hover:text-slate-200"
            aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="px-1 text-xs text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="px-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
