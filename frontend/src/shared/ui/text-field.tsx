import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "@/shared/lib/cx";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          "min-h-12 w-full rounded-2xl border border-border bg-card px-3.5 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {hint ? (
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
