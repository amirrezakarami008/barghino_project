"use client";

import { ContactSupportAssist } from "@/features/marketing/components/ContactSupportAssist";
import { CONTACT_PAGE } from "@/features/marketing/constants/pages";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15";

function fillContactDraft(draft: { subject: string; message: string }) {
  const subject = document.getElementById("subject") as HTMLSelectElement | null;
  const message = document.getElementById("message") as HTMLTextAreaElement | null;

  if (subject) {
    subject.value = draft.subject;
    subject.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (message) {
    message.value = draft.message;
    message.dispatchEvent(new Event("input", { bubbles: true }));
    message.focus();
    message.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

export function ContactFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const [messageLen, setMessageLen] = useState(0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-600">
          ✓
        </div>
        <h3 className="mb-2 text-lg font-bold text-emerald-900">پیام شما ثبت شد</h3>
        <p className="text-sm text-emerald-700">به زودی با شما تماس خواهیم گرفت.</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setMessageLen(0);
          }}
          className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          ارسال پیام جدید
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ContactSupportAssist onApply={fillContactDraft} />

      <div>
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <Send className="h-4 w-4" />
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900">{CONTACT_PAGE.formTitle}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" required>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="نام کامل"
                className={inputClass}
              />
            </Field>
            <Field label="شماره موبایل" required>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className={inputClass}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="ایمیل">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              className={inputClass}
              dir="ltr"
            />
          </Field>

          <Field label="موضوع" required>
            <select id="subject" name="subject" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                موضوع پیام را انتخاب کنید
              </option>
              {CONTACT_PAGE.subjects.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="پیام" required>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                maxLength={500}
                placeholder="پیام خود را بنویسید یا از دستیار بالا متن آماده بگیرید..."
                className={cn(inputClass, "resize-none pb-8")}
                onChange={(e) => setMessageLen(e.target.value.length)}
              />
              <span className="pointer-events-none absolute bottom-3 left-3 text-[11px] font-medium text-slate-400">
                {messageLen.toLocaleString("fa-IR")}/۵۰۰
              </span>
            </div>
          </Field>

          <Button type="submit" fullWidth size="lg" className="mt-2 gap-2">
            ارسال پیام
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
