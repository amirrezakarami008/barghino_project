"use client";

import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { useState } from "react";
import { useInstallRequests } from "@/features/dashboard/hooks/useInstallRequests";
import { saveInstallRequest } from "@/features/dashboard/lib/installStore";
import type { InstallRequestStep } from "@/shared/types/dashboard";

const INSTALL_STEPS = [
  { id: "submitted" as const, label: "ثبت درخواست", description: "اطلاعات ملک و تماس را وارد می‌کنید." },
  { id: "review" as const, label: "بررسی اولیه", description: "کارشناسان برقینو درخواست را بررسی می‌کنند (۲۴ ساعت)." },
  { id: "visit" as const, label: "بازدید کارشناس", description: "یک کارشناس برای ارزیابی پشت‌بام به محل مراجعه می‌کند." },
  { id: "proposal" as const, label: "ارائه طرح و قیمت", description: "طرح فنی و پیشنهاد قیمت نهایی ارسال می‌شود." },
  { id: "contract" as const, label: "امضای قرارداد", description: "قرارداد نصب + قرارداد فروش برق امضا می‌شود." },
  { id: "installation" as const, label: "نصب تجهیزات", description: "تیم فنی نیروگاه را نصب و اتصال به شبکه را انجام می‌دهد." },
  { id: "active" as const, label: "راه‌اندازی و تحویل", description: "نیروگاه فعال می‌شود و درآمد شروع می‌شود." },
];

const STEP_ORDER: InstallRequestStep[] = INSTALL_STEPS.map((s) => s.id);

function getStepIndex(id: InstallRequestStep) {
  return STEP_ORDER.indexOf(id);
}

export default function InstallPage() {
  const { latest } = useInstallRequests();
  const [step, setStep] = useState<"idle" | "form" | "submitted">("idle");
  const [formData, setFormData] = useState({ address: "", area: "", phone: "", note: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveInstallRequest({
      address: formData.address,
      area: formData.area,
      phone: formData.phone,
      note: formData.note,
    });
    setStep("submitted");
  }

  const existingRequest = latest;

  return (
    <DashboardPage
      title="درخواست نصب نیروگاه"
      subtitle="برقینو نیروگاه خورشیدی را روی پشت‌بام خانه‌تان نصب می‌کند"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "مسیر تا فروش",
            desc: "پس از نصب، وارد قرارداد فروش با نرخ بورس سبز می‌شوید",
          },
          {
            title: "پیگیری مرحله‌ای",
            desc: "وضعیت درخواست را از بررسی تا راه‌اندازی در همین صفحه ببینید",
          },
          {
            title: "تمرکز خانگی",
            desc: "طراحی‌شده برای ملک مسکونی و پشت‌بام خانگی",
          },
        ].map((item) => (
          <Panel key={item.title}>
            <h3 className="font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </Panel>
        ))}
      </div>

      {existingRequest && step === "idle" && (
        <Panel className="mb-8">
          <PanelHeader title="درخواست در جریان" action={<StatusBadge status="in_progress" />} />
          <p className="mb-1 text-sm font-medium text-slate-800">{existingRequest.address}</p>
          {existingRequest.note && (
            <p className="mb-6 text-xs text-slate-500">{existingRequest.note}</p>
          )}
          <div className="relative">
            <div className="absolute right-4 top-0 h-full w-0.5 bg-slate-100" />
            <div className="space-y-6">
              {INSTALL_STEPS.map((s, i) => {
                const current = getStepIndex(existingRequest.currentStep);
                const isDone = i < current;
                const isActive = i === current;
                return (
                  <div key={s.id} className="relative flex gap-4 pr-10">
                    <div
                      className={`absolute right-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isActive
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isActive ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                    <div className={isActive ? "" : isDone ? "opacity-70" : "opacity-40"}>
                      <p className={`font-medium ${isActive ? "text-brand-700" : "text-slate-900"}`}>
                        {s.label}
                      </p>
                      <p className="text-sm text-slate-500">{s.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" size="sm" onClick={() => setStep("form")}>
              ثبت درخواست جدید
            </Button>
          </div>
        </Panel>
      )}

      {!existingRequest && step === "idle" && (
        <Panel className="max-w-2xl">
          <PanelHeader
            title="مراحل نصب"
            description="از درخواست تا راه‌اندازی — معمولاً ۳ تا ۶ هفته"
          />
          <div className="mb-8 space-y-4">
            {INSTALL_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{s.label}</p>
                  <p className="text-sm text-slate-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Button size="lg" onClick={() => setStep("form")}>
            شروع درخواست نصب
          </Button>
        </Panel>
      )}

      {step === "form" && (
        <Panel className="max-w-2xl">
          <PanelHeader title="فرم درخواست نصب نیروگاه" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                آدرس ملک <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="آدرس کامل محلی که قرار است نیروگاه نصب شود"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={formData.address}
                onChange={(e) => setFormData((d) => ({ ...d, address: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                مساحت تقریبی پشت‌بام (متر مربع)
              </label>
              <input
                type="number"
                min={10}
                placeholder="مثال: ۵۰"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={formData.area}
                onChange={(e) => setFormData((d) => ({ ...d, area: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                شماره تماس برای هماهنگی بازدید <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={formData.phone}
                onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                توضیحات اضافی
              </label>
              <textarea
                rows={2}
                placeholder="هر توضیح یا محدودیتی که باید بدانیم..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={formData.note}
                onChange={(e) => setFormData((d) => ({ ...d, note: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg">
                ثبت درخواست نصب
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(existingRequest ? "idle" : "idle")}
              >
                بازگشت
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {step === "submitted" && (
        <Panel className="max-w-lg">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">درخواست ثبت شد</h3>
            <p className="max-w-sm text-sm text-slate-500">
              کارشناسان برقینو ظرف ۲۴ ساعت آینده با شما تماس می‌گیرند تا زمان بازدید را هماهنگ کنند.
            </p>
            <div className="mt-2 flex gap-3">
              <Button
                onClick={() => {
                  setStep("idle");
                  setFormData({ address: "", area: "", phone: "", note: "" });
                }}
              >
                مشاهده وضعیت
              </Button>
              <Button href="/dashboard/support" variant="outline">
                پشتیبانی
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </DashboardPage>
  );
}
