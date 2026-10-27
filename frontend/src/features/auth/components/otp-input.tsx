"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ApiError } from "@/features/auth/lib/api";
import { digitsOnly } from "@/features/auth/lib/phone";
import { faDigits } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import "./otp-input.css";

type Phase = "idle" | "pending" | "success" | "error" | "returning";

type OtpInputProps<T> = {
  length?: 4 | 6;
  disabled?: boolean;
  onVerify: (code: string) => Promise<T>;
  onVerified: (result: T) => void;
  onBusyChange: (busy: boolean) => void;
};

const position = (x: number, y = 0) => `translate(${x}px, ${y}px)`;
const circlePosition = (angle: number, radius: number) => position(Math.cos(angle) * radius, Math.sin(angle) * radius);

export function OtpInput<T>({ length = 6, disabled = false, onVerify, onVerified, onBusyChange }: OtpInputProps<T>) {
  const [digits, setDigits] = useState<string[]>(() => Array<string>(length).fill(""));
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const locked = useRef(false);
  const lifecycle = useRef<AbortController | null>(null);
  const animations = useRef<Animation[]>([]);
  const busy = phase !== "idle";

  useEffect(() => {
    const controller = new AbortController();
    lifecycle.current = controller;
    inputs.current[0]?.focus({ preventScroll: true });
    return () => {
      controller.abort();
      animations.current.forEach((animation) => animation.cancel());
    };
  }, []);

  function focus(index: number) {
    const input = inputs.current[Math.max(0, Math.min(length - 1, index))];
    input?.focus({ preventScroll: true });
    input?.select();
  }

  function restPosition(index: number) {
    const width = stage.current?.clientWidth ?? 300;
    const slotWidth = slots.current[index]?.offsetWidth ?? 44;
    return (index - (length - 1) / 2) * (slotWidth + Math.min(10, width * 0.025));
  }

  async function submit(nextDigits: string[]) {
    if (locked.current || disabled || nextDigits.some((digit) => !digit)) return;
    locked.current = true;
    setError("");
    setPhase("pending");
    onBusyChange(true);
    inputs.current.forEach((input) => input?.blur());

    const signal = lifecycle.current!.signal;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const radius = length === 6 ? 78 : 66;
    const angle = (index: number) => -Math.PI / 2 + (index * Math.PI * 2) / length;
    // Start the real request immediately; animation never determines the result.
    const response = onVerify(nextDigits.join("")).then(
      (result) => ({ ok: true as const, result }),
      (cause: unknown) => ({ ok: false as const, cause }),
    );

    if (!reducedMotion) {
      animations.current = slots.current.flatMap((slot, index) => slot ? [slot.animate(
        [
          { transform: position(restPosition(index)) },
          { transform: circlePosition(angle(index), radius) },
        ],
        { duration: 460, delay: index * 24, easing: "cubic-bezier(.22,.8,.25,1)", fill: "forwards" },
      )] : []);
      await Promise.all(animations.current.map((animation) => animation.finished.catch(() => {})));
      if (signal.aborted) return;

      const entryAnimations = animations.current;
      animations.current = slots.current.flatMap((slot, index) => slot ? [slot.animate(
        Array.from({ length: 73 }, (_, frame) => ({
          transform: circlePosition(angle(index) + (frame / 72) * Math.PI * 2, radius),
          offset: frame / 72,
        })),
        { duration: 2400, iterations: Infinity, easing: "linear", fill: "forwards" },
      )] : []);
      entryAnimations.forEach((animation) => animation.cancel());
    }

    const outcome = await response;
    if (signal.aborted) return;

    // Capture the current orbit, so even a response mid-turn returns smoothly.
    const positions = slots.current.map((slot) => slot ? getComputedStyle(slot).transform : "none");
    slots.current.forEach((slot, index) => {
      if (slot) slot.style.transform = positions[index];
    });
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];

    if (outcome.ok) {
      setPhase("success");
      await pause(reducedMotion ? 180 : 650, signal);
      if (!signal.aborted) onVerified(outcome.result);
      return;
    }

    setError(outcome.cause instanceof ApiError
      ? outcome.cause.fields.code ?? outcome.cause.message
      : "تأیید کد انجام نشد. دوباره تلاش کنید.");
    setPhase("error");
    await pause(reducedMotion ? 100 : 420, signal);
    if (signal.aborted) return;
    setPhase("returning");

    if (!reducedMotion) {
      animations.current = slots.current.flatMap((slot, index) => slot ? [slot.animate(
        [
          { transform: positions[index] },
          { transform: position(restPosition(index)), offset: 0.8 },
          { transform: position(restPosition(index), -4), offset: 0.9 },
          { transform: position(restPosition(index)) },
        ],
        { duration: 580, delay: index * 28, easing: "cubic-bezier(.22,.75,.3,1)", fill: "forwards" },
      )] : []);
      await Promise.all(animations.current.map((animation) => animation.finished.catch(() => {})));
    }
    if (signal.aborted) return;
    slots.current.forEach((slot) => slot?.style.removeProperty("transform"));
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    setDigits(Array<string>(length).fill(""));
    setPhase("idle");
    locked.current = false;
    onBusyChange(false);
    focus(0);
  }

  function update(index: number, value: string) {
    if (locked.current || disabled) return;
    const normalized = digitsOnly(value).slice(0, length);
    if (value && !normalized) return;
    const nextDigits = [...digits];
    // A full pasted or autofilled code always starts at the first box.
    const start = normalized.length === length ? 0 : index;
    if (!normalized) nextDigits[index] = "";
    else for (let offset = 0; offset < normalized.length && start + offset < length; offset++) {
      nextDigits[start + offset] = normalized[offset];
    }
    setError("");
    setDigits(nextDigits);
    if (nextDigits.every(Boolean)) void submit(nextDigits);
    else if (normalized) focus(Math.min(start + normalized.length, length - 1));
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (locked.current || disabled) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      const target = digits[index] ? index : Math.max(0, index - 1);
      const nextDigits = [...digits];
      nextDigits[target] = "";
      setDigits(nextDigits);
      setError("");
      focus(target);
    } else if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      focus(event.key === "Home" ? 0 : event.key === "End" ? length - 1 : index + (event.key === "ArrowLeft" ? -1 : 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      void submit(digits);
    }
  }

  const status = phase === "pending" ? "در حال بررسی کد…"
    : phase === "success" ? "کد تأیید شد؛ در حال ادامه…"
      : error || `کد ${faDigits(length)} رقمی را وارد کنید؛ تأیید خودکار است.`;

  return (
    <div
      className="otp-input"
      data-phase={phase}
      data-invalid={Boolean(error)}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-status`}
      aria-busy={busy}
    >
      <span id={`${id}-label`} className="sr-only">کد تأیید {faDigits(length)} رقمی</span>
      <div ref={stage} className="otp-input__stage" dir="ltr">
        <div className="otp-input__orbit" aria-hidden="true" />
        <div className="otp-input__center" aria-hidden="true">
          <Icon name={phase === "success" ? "check" : phase === "error" || phase === "returning" ? "close" : "shield"} className="size-6" />
        </div>
        {digits.map((digit, index) => (
          <div
            key={index}
            ref={(element) => { slots.current[index] = element; }}
            className="otp-input__slot"
            data-filled={Boolean(digit)}
            style={{ "--slot-index": index, "--slot-count": length } as CSSProperties}
          >
            <input
              ref={(element) => { inputs.current[index] = element; }}
              type="text"
              name={`code-${index + 1}`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={length}
              spellCheck={false}
              autoCapitalize="off"
              aria-label={`رقم ${faDigits(index + 1)} از ${faDigits(length)}`}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-status`}
              value={faDigits(digit)}
              placeholder="ـ"
              disabled={disabled && !busy}
              readOnly={busy}
              tabIndex={busy ? -1 : 0}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => update(index, event.target.value)}
              onPaste={(event) => {
                event.preventDefault();
                update(index, event.clipboardData.getData("text"));
              }}
              onKeyDown={(event) => handleKey(event, index)}
            />
          </div>
        ))}
      </div>
      <p id={`${id}-status`} className="otp-input__status" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}

function pause(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const finish = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = window.setTimeout(finish, milliseconds);
    signal.addEventListener("abort", finish, { once: true });
  });
}
