import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldFrame } from "./field-frame";

const controlClass =
  "peer w-full min-h-28 rounded-md border border-border bg-card px-3 py-3 text-sm text-foreground shadow-soft transition-[border-color,box-shadow] duration-fast ease-out placeholder:text-transparent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  labelPlacement?: "top" | "floating";
  helperText?: string;
  error?: string;
};

export function Textarea({
  label,
  labelPlacement = "top",
  helperText,
  error,
  className,
  required,
  placeholder,
  ...props
}: TextareaProps) {
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
        <textarea
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          placeholder={isFloating ? placeholder || " " : placeholder}
          className={cn(controlClass, isFloating && "pt-6")}
          {...props}
        />
      )}
    </FieldFrame>
  );
}
