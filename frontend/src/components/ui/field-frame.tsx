import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/cn";

export type FieldFrameProps = {
  label: string;
  labelPlacement?: "top" | "floating";
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
};

export function FieldFrame({
  label,
  labelPlacement = "top",
  helperText,
  error,
  required,
  className,
  children,
}: FieldFrameProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;
  const invalid = Boolean(error);

  if (labelPlacement === "floating") {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="relative">
          {children({ id, describedBy })}
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute start-3 top-1/2 origin-start -translate-y-1/2 text-sm text-foreground-muted transition-[top,font-size,transform,color] duration-fast ease-out",
              "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-caption peer-focus:text-accent",
              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-caption",
              invalid && "text-danger peer-focus:text-danger",
            )}
          >
            {label}
            {required ? <span className="text-danger"> *</span> : null}
          </label>
        </div>
        <FieldMessages error={error} helperText={helperText} errorId={errorId} helperId={helperId} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children({ id, describedBy })}
      <FieldMessages error={error} helperText={helperText} errorId={errorId} helperId={helperId} />
    </div>
  );
}

function FieldMessages({
  error,
  helperText,
  errorId,
  helperId,
}: {
  error?: string;
  helperText?: string;
  errorId: string;
  helperId: string;
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="text-caption text-danger">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={helperId} className="text-caption text-foreground-muted">
        {helperText}
      </p>
    );
  }
  return null;
}
