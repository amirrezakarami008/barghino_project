"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface FormProps {
  fields: readonly FormField[];
  submitLabel: string;
  onSubmit?: (data: Record<string, string>) => void;
  redirectTo?: string;
  successTitle?: string;
  successMessage?: string;
}

export function Form({
  fields,
  submitLabel,
  onSubmit,
  redirectTo,
  successTitle = "پیام شما ثبت شد",
  successMessage = "به زودی با شما تماس خواهیم گرفت.",
}: FormProps) {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    onSubmit?.(data);
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <h3 className="mb-2 text-lg font-bold text-emerald-900">{successTitle}</h3>
        <p className="text-sm text-emerald-700">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <FormFieldInput key={field.name} field={field} />
      ))}
      <Button type="submit" fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}

function FormFieldInput({ field }: { field: FormField }) {
  const baseInputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <div>
      <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          className={cn(baseInputClass, "resize-none")}
        />
      ) : field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          className={baseInputClass}
        >
          <option value="">انتخاب کنید</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          className={baseInputClass}
        />
      )}
    </div>
  );
}

export function AuthForm({
  title,
  description,
  fields,
  submitLabel,
  alternateLabel,
  alternateHref,
  alternateLinkText,
  redirectTo,
}: {
  title: string;
  description: string;
  fields: readonly FormField[];
  submitLabel: string;
  alternateLabel: string;
  alternateHref: string;
  alternateLinkText: string;
  redirectTo?: string;
}) {
  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 font-display text-3xl font-extrabold text-slate-900">{title}</h1>
      <p className="mb-8 text-slate-600">{description}</p>
      <Form fields={fields} submitLabel={submitLabel} redirectTo={redirectTo} />
      <p className="mt-6 text-center text-sm text-slate-600">
        {alternateLabel}{" "}
        <a href={alternateHref} className="font-medium text-brand-600 hover:text-brand-700">
          {alternateLinkText}
        </a>
      </p>
    </div>
  );
}
