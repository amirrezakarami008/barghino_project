"use client";

import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/components/dashboard";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { BILL_ACCOUNTS } from "@/lib/constants";
import type { FormField } from "@/types";
import { useState } from "react";

const addBillFields: FormField[] = [
  { name: "name", label: "نام واحد", type: "text", placeholder: "مثال: کارخانه تولیدی", required: true },
  { name: "billId", label: "شناسه قبض", type: "text", placeholder: "شناسه ۱۳ رقمی", required: true },
  {
    name: "type",
    label: "نوع مصرف",
    type: "select",
    required: true,
    options: [
      { label: "صنعتی", value: "industrial" },
      { label: "تجاری", value: "commercial" },
      { label: "اداری", value: "office" },
      { label: "مسکونی", value: "residential" },
    ],
  },
  { name: "address", label: "آدرس", type: "textarea", placeholder: "آدرس کامل واحد" },
];

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardPage
      title="شناسه‌های قبض"
      subtitle="مدیریت واحدهای مصرفی و شناسه‌های قبض برق"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {BILL_ACCOUNTS.length} شناسه قبض ثبت‌شده — برای خرید برق حداقل یک شناسه فعال لازم است.
        </p>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "بستن فرم" : "+ افزودن شناسه قبض"}
        </Button>
      </div>

      {showForm && (
        <Panel className="mb-6">
          <PanelHeader title="ثبت شناسه قبض جدید" description="اطلاعات را مطابق قبض برق وارد کنید" />
          <div className="max-w-lg">
            <Form fields={addBillFields} submitLabel="ثبت شناسه" />
          </div>
        </Panel>
      )}

      <div className="grid gap-4">
        {BILL_ACCOUNTS.map((bill) => (
          <Panel key={bill.id} className="transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{bill.name}</h3>
                  <StatusBadge status={bill.status} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {bill.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{bill.address}</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">شناسه قبض</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{bill.billId}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">دیماند</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{bill.demand}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">مصرف ماهانه</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{bill.monthlyUsage}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <Button href="/dashboard/consumption" variant="outline" size="sm">
                  مشاهده مصرف
                </Button>
                <Button href="/dashboard/buy" variant="outline" size="sm">
                  خرید برق
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
