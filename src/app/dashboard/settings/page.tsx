"use client";

import { DashboardPage, Panel, PanelHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import type { FormField } from "@/types";
import { useState } from "react";

const passwordFields: FormField[] = [
  { name: "current", label: "رمز عبور فعلی", type: "password", required: true },
  { name: "new", label: "رمز عبور جدید", type: "password", required: true },
  { name: "confirm", label: "تکرار رمز جدید", type: "password", required: true },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    billing: true,
    consumption: true,
    contract: true,
    marketing: false,
  });

  return (
    <DashboardPage title="تنظیمات" subtitle="امنیت، اعلان‌ها و ترجیحات">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="تغییر رمز عبور" />
          <Form fields={passwordFields} submitLabel="بروزرسانی رمز" />
        </Panel>

        <Panel>
          <PanelHeader title="ترجیحات اعلان" description="نحوه دریافت اطلاع‌رسانی‌ها" />
          <div className="space-y-4">
            {[
              { key: "billing" as const, label: "فاکتور و پرداخت", desc: "سررسید و تأیید پرداخت" },
              { key: "consumption" as const, label: "مصرف و هشدار", desc: "اوج بار و آنomalies" },
              { key: "contract" as const, label: "قرارداد", desc: "تمدید و تغییرات قرارداد" },
              { key: "marketing" as const, label: "پیشنهادات", desc: "تخفیف‌ها و خدمات جدید" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
          <Button className="mt-4">ذخیره ترجیحات</Button>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader title="امنیت حساب" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">ورود دو مرحله‌ای</p>
              <p className="mt-1 text-sm text-slate-500">فعال‌سازی OTP برای ورود امن‌تر</p>
              <Button variant="outline" size="sm" className="mt-3">فعال‌سازی</Button>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">دستگاه‌های متصل</p>
              <p className="mt-1 text-sm text-slate-500">۱ دستگاه فعال — Windows / Chrome</p>
              <Button variant="outline" size="sm" className="mt-3">مدیریت</Button>
            </div>
          </div>
        </Panel>

        <Panel className="lg:col-span-2 border-red-100">
          <PanelHeader title="منطقه خطر" description="عملیات غیرقابل بازگشت" />
          <Button variant="outline" className="!border-red-200 !text-red-600 hover:!bg-red-50">
            درخواست حذف حساب
          </Button>
        </Panel>
      </div>
    </DashboardPage>
  );
}
