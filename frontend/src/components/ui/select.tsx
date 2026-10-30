import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldFrame } from "./field-frame";

const controlClass =
  "peer w-full min-h-11 appearance-none rounded-md border border-border bg-card pe-10 ps-3 text-sm text-foreground shadow-soft transition-[border-color,box-shadow] duration-fast ease-out focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  labelPlacement?: "top" | "floating";
  helperText?: string;
  error?: string;
  options: readonly SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  labelPlacement = "top",
  helperText,
  error,
  options,
  placeholder = "انتخاب کنید",
  className,
  required,
  ...props
}: SelectProps) {
  const isFloating = labelPlacement === "floating";

  return (
    <FieldFrame
      label={label}
      labelPlacement={labelPlacement}
      helperText={helperText}
      error={error}
      required={required}
      className={className}
    >
      {({ id, describedBy }) => (
        <>
          <select
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(controlClass, isFloating && "pt-5 pb-2")}
            {...props}
          >
            <option value="" disabled>
              {isFloating ? " " : placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}
    </FieldFrame>
  );
}
