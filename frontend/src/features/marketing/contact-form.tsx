"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";

type Errors = {
  name?: string;
  contact?: string;
  message?: string;
};

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const next: Errors = {};
    if (name.length < 2) next.name = "نام را بنویسید.";
    if (contact.length < 5) next.contact = "موبایل یا ایمیل را بنویسید.";
    if (message.length < 10) next.message = "پیام را کمی روشن‌تر بنویسید.";
    setErrors(next);
    setReady(Object.keys(next).length === 0);
  }

  if (ready) {
    return (
      <div role="status" className="rounded-panel border border-border bg-mint p-6">
        <h2 className="text-xl font-semibold text-primary">پیام از نظر فرم کامل است</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          ارسال به صندوق پشتیبانی هنوز به سرویس وصل نیست. تا آن زمان می‌توانید با تلفن ۰۲۱-۴۴۰۰۰۶۶۴ تماس بگیرید.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-panel border border-border bg-card p-5 sm:p-6">
      <TextField name="name" label="نام" autoComplete="name" error={errors.name} />
      <TextField name="contact" label="موبایل یا ایمیل" autoComplete="tel" error={errors.contact} />
      <label className="grid gap-2 text-sm font-medium">
        پیام
        <textarea
          name="message"
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          className="rounded-2xl border border-border px-3.5 py-3 text-base font-normal"
        />
        {errors.message ? (
          <span role="alert" className="font-normal text-danger">
            {errors.message}
          </span>
        ) : null}
      </label>
      <Button type="submit">بررسی پیام</Button>
    </form>
  );
}
