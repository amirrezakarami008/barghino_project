"use client";

import { DashboardPage, Panel, PanelHeader } from "@/components/dashboard";
import { Avatar } from "@/components/ui/MediaImage";
import { Form } from "@/components/ui/Form";
import { DASHBOARD_USER } from "@/lib/constants";
import type { FormField } from "@/types";

const profileFields: FormField[] = [
  { name: "name", label: "نام و نام خانوادگی", type: "text", required: true },
  { name: "phone", label: "شماره موبایل", type: "tel", required: true },
  { name: "email", label: "ایمیل", type: "email" },
  { name: "nationalId", label: "کد ملی", type: "text" },
  { name: "company", label: "نام شرکت", type: "text" },
];

export default function ProfilePage() {
  return (
    <DashboardPage title="پروفایل" subtitle="اطلاعات حساب کاربری و هویتی">
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {DASHBOARD_USER.avatar && (
              <Avatar src={DASHBOARD_USER.avatar} alt={DASHBOARD_USER.name} size="lg" />
            )}
            <h2 className="mt-4 text-xl font-bold text-slate-900">{DASHBOARD_USER.name}</h2>
            <p className="text-sm text-slate-500">{DASHBOARD_USER.company}</p>
            {DASHBOARD_USER.verified && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                ✓ حساب تأیید‌شده
              </span>
            )}
            <p className="mt-4 text-xs text-slate-400">عضو از {DASHBOARD_USER.memberSince}</p>
          </div>
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
            {[
              { label: "نوع حساب", value: DASHBOARD_USER.role === "business" ? "حقوقی / سازمانی" : "حقیقی" },
              { label: "موبایل", value: DASHBOARD_USER.phone },
              { label: "ایمیل", value: DASHBOARD_USER.email },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader title="ویرایش اطلاعات" />
          <div className="max-w-lg">
            <Form fields={profileFields} submitLabel="ذخیره تغییرات" />
          </div>
        </Panel>
      </div>
    </DashboardPage>
  );
}
