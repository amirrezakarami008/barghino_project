"use client";

import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/Form";
import { SUPPORT_TICKETS } from "@/features/dashboard/constants";
import type { FormField } from "@/shared/types";
import { useState } from "react";

const ticketFields: FormField[] = [
  {
    name: "category",
    label: "دسته‌بندی",
    type: "select",
    required: true,
    options: [
      { label: "مشاوره خرید برق", value: "consulting" },
      { label: "پشتیبانی فنی", value: "technical" },
      { label: "مالی و فاکتور", value: "billing" },
      { label: "قرارداد", value: "contract" },
    ],
  },
  { name: "subject", label: "موضوع", type: "text", required: true },
  { name: "message", label: "شرح درخواست", type: "textarea", required: true },
];

export default function DashboardSupportPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardPage title="پشتیبانی" subtitle="ثبت تیکت و پیگیری درخواست‌ها">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "تماس فوری", value: "۰۲۱-۴۴۰۰۰۶۶۴", desc: "شنبه تا چهارشنبه ۸–۱۷" },
          { title: "زمان پاسخ", value: "۲۴ ساعت", desc: "درخواست‌های عادی" },
          { title: "پاسخ فوری", value: "۲ ساعت", desc: "موارد اورژانس" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-1 text-xl font-bold text-brand-600">{item.value}</p>
            <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "بستن فرم" : "+ تیکت جدید"}
        </Button>
      </div>

      {showForm && (
        <Panel className="mb-6">
          <PanelHeader title="ثبت تیکت پشتیبانی" />
          <div className="max-w-lg">
            <Form fields={ticketFields} submitLabel="ارسال تیکت" />
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader title="تیکت‌های من" />
        <div className="space-y-3">
          {SUPPORT_TICKETS.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {ticket.category} — {ticket.messages} پیام — آخرین بروزرسانی: {ticket.lastUpdate}
                </p>
              </div>
              <Button variant="outline" size="sm">مشاهده</Button>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
