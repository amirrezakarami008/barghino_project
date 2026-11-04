"use client";

import { useMemo, type ReactElement } from "react";
import DatePicker, { DateObject, type Value } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FieldFrame } from "@/components/ui/field-frame";
import { cn } from "@/shared/lib/cn";
import "react-multi-date-picker/styles/colors/teal.css";
import "./jalali-date-field.css";

const controlClass =
  "rmdp-input peer w-full min-h-11 rounded-md border border-border bg-card px-3 text-base text-foreground shadow-soft transition-[border-color,box-shadow] duration-fast ease-out focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20";

export type JalaliDateFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly mode?: "date" | "datetime";
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly helperText?: string;
  readonly error?: string;
  readonly className?: string;
  readonly placeholder?: string;
};

function parseValue(value: string, mode: "date" | "datetime"): DateObject | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date =
    mode === "date" && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
      ? new Date(`${trimmed}T12:00:00`)
      : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return new DateObject({ date, calendar: persian, locale: persian_fa });
}

function toApiValue(next: DateObject | null, mode: "date" | "datetime"): string {
  if (!next) return "";
  if (mode === "date") {
    return new DateObject(next).convert(gregorian).format("YYYY-MM-DD");
  }
  return next.toDate().toISOString();
}

/** Format an API Gregorian ISO / datetime string as Jalali for display. */
export function formatJalaliDisplay(
  value: string,
  options: { readonly withTime?: boolean } = {},
): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? new Date(`${trimmed}T12:00:00`) : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  const object = new DateObject({ date, calendar: persian, locale: persian_fa });
  return options.withTime ? object.format("YYYY/MM/DD HH:mm") : object.format("YYYY/MM/DD");
}

export function JalaliDateField({
  label,
  value,
  onChange,
  mode = "date",
  required,
  disabled,
  helperText,
  error,
  className,
  placeholder,
}: JalaliDateFieldProps): ReactElement {
  const selected = useMemo(() => parseValue(value, mode), [value, mode]);
  const format = mode === "datetime" ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD";

  return (
    <FieldFrame
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      className={cn("jalali-date-field", className)}
    >
      {({ id, describedBy }) => (
        <DatePicker
          id={id}
          value={selected as Value}
          onChange={(next: DateObject | DateObject[] | null) => {
            if (!next) {
              onChange("");
              return;
            }
            const picked = Array.isArray(next) ? next[0] : next;
            onChange(picked ? toApiValue(picked, mode) : "");
          }}
          calendar={persian}
          locale={persian_fa}
          format={format}
          calendarPosition="bottom-right"
          containerClassName="w-full"
          inputClass={cn(controlClass, error ? "border-danger" : undefined)}
          placeholder={placeholder ?? (mode === "datetime" ? "انتخاب تاریخ و ساعت" : "انتخاب تاریخ شمسی")}
          disabled={disabled}
          editable={false}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          plugins={
            mode === "datetime"
              ? [<TimePicker key="time" position="bottom" hideSeconds />]
              : undefined
          }
        />
      )}
    </FieldFrame>
  );
}
