"use client";

import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import {
  INSTALL_STEPS,
  getInstallStepIndex,
  getInstallStepLabel,
} from "@/features/dashboard/constants/install";
import { useInstallRequests } from "@/features/dashboard/hooks/useInstallRequests";
import {
  advanceInstallSimulation,
  formatToman,
  saveInstallRequest,
} from "@/features/dashboard/lib/installStore";
import type { InstallRequest, InstallRequestStep } from "@/shared/types/dashboard";
import {
  CheckCircle,
  Circle,
  Clock,
  FileSignature,
  Hammer,
  MapPin,
  Rocket,
  Search,
  Sun,
} from "lucide-react";
import { useState } from "react";

type View = "idle" | "form" | "submitted";

const STEP_BADGE: Record<
  InstallRequestStep,
  { status: "pending" | "in_progress" | "active" | "success" | "processing"; label: string }
> = {
  submitted: { status: "pending", label: "ثبت‌شده" },
  review: { status: "in_progress", label: "در حال بررسی" },
  visit: { status: "processing", label: "هماهنگی بازدید" },
  proposal: { status: "processing", label: "طرح آماده" },
  contract: { status: "pending", label: "آماده امضا" },
  installation: { status: "in_progress", label: "در حال نصب" },
  active: { status: "active", label: "راه‌اندازی‌شده" },
};

function StepActionCard({
  request,
  busy,
  onAdvance,
}: {
  request: InstallRequest;
  busy: boolean;
  onAdvance: () => void;
}) {
  const step = request.currentStep;

  if (step === "active") {
    return (
      <Panel className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-slate-900">نیروگاه راه‌اندازی شد</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              شبیه‌سازی نصب کامل شد. نیروگاه به فهرست نیروگاه‌های شما اضافه شده و می‌توانید مسیر فروش
              برق را شروع کنید.
            </p>
            {request.proposal && (
              <p className="mt-3 text-sm text-slate-700">
                ظرفیت:{" "}
                <span className="font-bold">{request.proposal.capacityKwp.toLocaleString("fa-IR")}</span>{" "}
                کیلووات · برآورد درآمد ماهانه:{" "}
                <span className="font-bold text-emerald-700">
                  {formatToman(request.proposal.estimatedMonthlyIncomeToman)}
                </span>
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/dashboard/plant">مشاهده نیروگاه</Button>
              <Button href="/dashboard/buy" variant="outline">
                شروع فروش برق
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  const configs: Record<
    Exclude<InstallRequestStep, "active">,
    { icon: typeof Search; title: string; body: string; cta: string }
  > = {
    submitted: {
      icon: Search,
      title: "آماده بررسی اولیه",
      body: "درخواست ثبت شده است. در حالت شبیه‌سازی می‌توانید بررسی کارشناسان را جلو ببرید.",
      cta: "شروع بررسی اولیه",
    },
    review: {
      icon: MapPin,
      title: "بررسی تأیید شد",
      body: "اطلاعات ملک تأیید شد. مرحله بعد هماهنگی بازدید کارشناس از پشت‌بام است.",
      cta: "زمان‌بندی بازدید",
    },
    visit: {
      icon: Sun,
      title: "بازدید برنامه‌ریزی شد",
      body: request.scheduledVisitAt
        ? `بازدید برای ${request.scheduledVisitAt} ثبت شده است. پس از بازدید، طرح و قیمت آماده می‌شود.`
        : "بازدید کارشناس هماهنگ شده است. نتیجه بازدید را ثبت کنید تا طرح پیشنهاد شود.",
      cta: "ثبت نتیجه بازدید و صدور طرح",
    },
    proposal: {
      icon: FileSignature,
      title: "طرح پیشنهادی آماده است",
      body: "جزئیات ظرفیت، هزینه و درآمد تقریبی را ببینید و در صورت موافقت به امضای قرارداد بروید.",
      cta: "پذیرش طرح و رفتن به قرارداد",
    },
    contract: {
      icon: FileSignature,
      title: "قرارداد آماده امضا",
      body: "قرارداد نصب و آماده‌سازی مسیر فروش برق آماده است. با امضا، نصب در صف اجرا قرار می‌گیرد.",
      cta: "امضای قرارداد",
    },
    installation: {
      icon: Hammer,
      title: "نصب در حال اجرا",
      body: "تجهیزات در حال نصب و اتصال به شبکه هستند. با تکمیل این مرحله، نیروگاه تحویل و فعال می‌شود.",
      cta: "تکمیل نصب و راه‌اندازی",
    },
  };

  const cfg = configs[step];
  const Icon = cfg.icon;

  return (
    <Panel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-slate-900">{cfg.title}</h3>
            <StatusBadge
              status={STEP_BADGE[step].status}
              label={STEP_BADGE[step].label}
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{cfg.body}</p>

          {step === "proposal" && request.proposal && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "ظرفیت پیشنهادی",
                  value: `${request.proposal.capacityKwp.toLocaleString("fa-IR")} کیلووات`,
                },
                {
                  label: "تعداد پنل تقریبی",
                  value: `${request.proposal.panelCount.toLocaleString("fa-IR")} عدد`,
                },
                {
                  label: "برآورد هزینه نصب",
                  value: formatToman(request.proposal.estimatedCostToman),
                },
                {
                  label: "برآورد درآمد ماهانه",
                  value: formatToman(request.proposal.estimatedMonthlyIncomeToman),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
                >
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2.5">
                <p className="text-[11px] text-brand-700">خلاصه بازدید</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {request.proposal.visitSummary}
                </p>
              </div>
            </div>
          )}

          {step === "contract" && request.proposal && (
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• نصب نیروگاه {request.proposal.capacityKwp.toLocaleString("fa-IR")} کیلوواتی</li>
              <li>• آماده‌سازی مسیر فروش برق به برقینو پس از بهره‌برداری</li>
              <li>• پرداخت تضمینی حداکثر ۲ ماه پس از شروع فروش</li>
            </ul>
          )}

          <div className="mt-5">
            <Button size="lg" disabled={busy} onClick={onAdvance}>
              {busy ? "در حال شبیه‌سازی…" : cfg.cta}
            </Button>
            <p className="mt-2 text-xs text-slate-400">
              مرحله بعد: {getInstallStepLabel(
                INSTALL_STEPS[getInstallStepIndex(step) + 1]?.id ?? "active",
              )}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function InstallPage() {
  const { latest } = useInstallRequests();
  const [view, setView] = useState<View>("idle");
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({ address: "", area: "", phone: "", note: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveInstallRequest({
      address: formData.address,
      area: formData.area,
      phone: formData.phone,
      note: formData.note,
    });
    setView("submitted");
  }

  async function handleAdvance() {
    if (!latest || busy) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    advanceInstallSimulation(latest.id);
    setBusy(false);
  }

  async function handleFastForward() {
    if (!latest || busy || latest.currentStep === "active") return;
    setBusy(true);
    let guard = 0;
    let current = latest;
    while (current.currentStep !== "active" && guard < 10) {
      await new Promise((r) => setTimeout(r, 280));
      const next = advanceInstallSimulation(current.id);
      if (!next || next.currentStep === current.currentStep) break;
      current = next;
      guard += 1;
    }
    setBusy(false);
  }

  const badge = latest ? STEP_BADGE[latest.currentStep] : null;

  return (
    <DashboardPage
      title="درخواست نصب نیروگاه"
      subtitle="شبیه‌سازی کامل مسیر از ثبت درخواست تا راه‌اندازی و فروش"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "۷ مرحله واقعی",
            desc: "از بررسی و بازدید تا قرارداد، نصب و تحویل را مرحله‌به‌مرحله جلو ببرید",
          },
          {
            title: "طرح و قرارداد شبیه‌سازی‌شده",
            desc: "بعد از بازدید، ظرفیت و درآمد تقریبی می‌بینید و قرارداد را امضا می‌کنید",
          },
          {
            title: "ورود به فروش",
            desc: "با راه‌اندازی، نیروگاه ساخته می‌شود و مسیر فروش برق باز می‌شود",
          },
        ].map((item) => (
          <Panel key={item.title}>
            <h3 className="font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </Panel>
        ))}
      </div>

      {latest && view === "idle" && (
        <div className="space-y-6">
          <StepActionCard request={latest} busy={busy} onAdvance={handleAdvance} />

          <Panel>
            <PanelHeader
              title="وضعیت درخواست"
              description={latest.address}
              action={badge ? <StatusBadge status={badge.status} label={badge.label} /> : undefined}
            />

            {(latest.phone || latest.areaM2 || latest.note) && (
              <p className="mb-6 text-xs text-slate-500">
                {[
                  latest.phone && `تماس: ${latest.phone}`,
                  latest.areaM2 && `مساحت: ${latest.areaM2.toLocaleString("fa-IR")} م²`,
                  latest.note,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            <div className="relative">
              <div className="absolute right-4 top-0 h-full w-0.5 bg-slate-100" />
              <div className="space-y-6">
                {INSTALL_STEPS.map((s, i) => {
                  const current = getInstallStepIndex(latest.currentStep);
                  const isComplete = latest.currentStep === "active";
                  const isDone = isComplete || i < current;
                  const isActive = !isComplete && i === current;
                  const event = [...latest.history].reverse().find((h) => h.step === s.id);

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
                      <div className={isActive ? "" : isDone ? "opacity-80" : "opacity-40"}>
                        <p
                          className={`font-medium ${isActive ? "text-brand-700" : "text-slate-900"}`}
                        >
                          {s.label}
                        </p>
                        <p className="text-sm text-slate-500">{s.description}</p>
                        {event?.note && (
                          <p className="mt-1 text-xs text-slate-400">
                            {event.at} — {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {latest.currentStep !== "active" && (
                <>
                  <Button disabled={busy} onClick={handleAdvance}>
                    {busy ? "…" : "مرحله بعد"}
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={handleFastForward}>
                    شبیه‌سازی سریع تا انتها
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setView("form")}>
                ثبت درخواست جدید
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {!latest && view === "idle" && (
        <Panel className="max-w-2xl">
          <PanelHeader
            title="مراحل نصب"
            description="از درخواست تا راه‌اندازی — شبیه‌سازی کامل در همین صفحه"
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
          <Button size="lg" onClick={() => setView("form")}>
            شروع درخواست نصب
          </Button>
        </Panel>
      )}

      {view === "form" && (
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
              <p className="mt-1.5 text-xs text-slate-400">
                برای برآورد ظرفیت طرح پیشنهادی استفاده می‌شود (حدود ۸ تا ۱۰ متر مربع برای هر کیلووات)
              </p>
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
              <Button type="button" variant="outline" onClick={() => setView("idle")}>
                بازگشت
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {view === "submitted" && (
        <Panel className="max-w-lg">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">درخواست ثبت شد</h3>
            <p className="max-w-sm text-sm text-slate-500">
              حالا می‌توانید کل مسیر را از بررسی تا راه‌اندازی در همین صفحه شبیه‌سازی کنید.
            </p>
            <div className="mt-2 flex gap-3">
              <Button
                onClick={() => {
                  setView("idle");
                  setFormData({ address: "", area: "", phone: "", note: "" });
                }}
              >
                شروع شبیه‌سازی مراحل
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
