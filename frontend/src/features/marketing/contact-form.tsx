"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Input, Textarea } from "@/components/ui";

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
      <Alert tone="success" title="پیام از نظر فرم کامل است">
        ارسال به صندوق پشتیبانی هنوز به سرویس وصل نیست. تا آن زمان می‌توانید با تلفن{" "}
        <bdi dir="ltr">۰۲۱-۴۴۰۰۰۶۶۴</bdi> تماس بگیرید.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-5 rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <Input name="name" label="نام" autoComplete="name" error={errors.name} required />
      <Input
        name="contact"
        label="موبایل یا ایمیل"
        autoComplete="tel"
        error={errors.contact}
        required
      />
      <Textarea name="message" label="پیام" rows={5} error={errors.message} required />
      <Button type="submit">بررسی پیام</Button>
    </form>
  );
}
