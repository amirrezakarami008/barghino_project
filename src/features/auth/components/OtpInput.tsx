"use client";

import { cn } from "@/shared/lib/utils";
import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  error,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  useEffect(() => {
    if (!disabled) inputsRef.current[0]?.focus();
  }, [disabled]);

  const updateDigit = (index: number, next: string) => {
    const char = next.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    onChange(nextDigits.join("").slice(0, length));
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length) - 1]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={cn(
              "h-12 w-full rounded-xl border bg-white/[0.04] text-center text-lg font-bold text-white outline-none transition-all duration-300",
              "focus:border-brand-400/60 focus:bg-brand-500/10 focus:shadow-[0_0_0_4px_rgba(6,182,212,0.12)]",
              error ? "border-red-400/40" : "border-white/10",
            )}
            aria-label={`رقم ${index + 1} کد تأیید`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
