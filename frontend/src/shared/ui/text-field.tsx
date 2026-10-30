import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  labelMode?: "above" | "placeholder";
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className, labelMode = "above", placeholder, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  const hintId = hint && labelMode === "above" ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const fieldPlaceholder = placeholder ?? (labelMode === "placeholder" ? (hint ? `${label} (${hint})` : label) : undefined);

  return (
    <div className="grid gap-2">
      <label htmlFor={fieldId} className={labelMode === "placeholder" ? "sr-only" : "text-sm font-medium"}>
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        placeholder={fieldPlaceholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "min-h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base text-foreground shadow-soft transition-colors duration-fast ease-out placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          error && "border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20",
          className,
        )}
        {...props}
      />
      {hint && labelMode === "above" ? (
        <p id={hintId} className="text-sm leading-6 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm leading-6 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
