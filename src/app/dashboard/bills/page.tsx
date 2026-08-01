"use client";

import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/Form";
import { HOME_SUBSCRIPTIONS } from "@/features/dashboard/constants";
import type { FormField } from "@/shared/types";
import { useState } from "react";

const addSubscriptionFields: FormField[] = [
  { name: "name", label: "نام انشعاب", type: "text", placeholder: "مثال: خانه اصلی — تهران", required: true },
  { name: "meterNumber", label: "شماره انشعاب (کنتور)", type: "text", placeholder: "شماره ۸ رقمی روی قبض برق", required: true },
  { name: "address", label: "آدرس ملک", type: "textarea", placeholder: "آدرس کامل محل نصب نیروگاه" },
];

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardPage
      title="انشعاب‌های خانگی"
      subtitle="انشعاب‌هایی که نیروگاه خورشیدی دارند یا قرار است داشته باشند"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {HOME_SUBSCRIPTIONS.length} انشعاب ثبت‌شده
        </p>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "بستن فرم" : "+ افزودن انشعاب جدید"}
        </Button>
      </div>

      {showForm && (
        <Panel className="mb-6">
          <PanelHeader title="ثبت انشعاب جدید" description="اطلاعات را مطابق قبض برق وارد کنید" />
          <div className="max-w-lg">
            <Form fields={addSubscriptionFields} submitLabel="ثبت انشعاب" />
          </div>
        </Panel>
      )}

      <div className="grid gap-4">
        {HOME_SUBSCRIPTIONS.map((sub) => (
          <Panel key={sub.id} className="transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{sub.name}</h3>
                  <StatusBadge status={sub.status} />
                </div>
                <p className="text-sm text-slate-500">{sub.address}</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">شماره انشعاب</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{sub.meterNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <Button href="/dashboard/plant" variant="outline" size="sm">
                  نیروگاه این انشعاب
                </Button>
                <Button href="/dashboard/install" variant="outline" size="sm">
                  درخواست نصب
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
