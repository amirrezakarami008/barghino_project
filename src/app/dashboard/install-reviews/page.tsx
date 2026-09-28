"use client";

import {
  DashboardPage,
  EmptyState,
  InstallMediaReviewCard,
  Panel,
} from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { useInstallRequests } from "@/features/dashboard/hooks/useInstallRequests";
import { Button } from "@/shared/ui/Button";
import { useMemo } from "react";

export default function InstallReviewsPage() {
  const { requests } = useInstallRequests();

  const pending = useMemo(
    () =>
      requests.filter(
        (req) => req.currentStep === "review" && req.mediaReviewStatus === "pending",
      ),
    [requests],
  );

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="بررسی درخواست‌های نصب" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="این بخش فقط برای مدیران سامانه در دسترس است."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="بررسی درخواست‌های نصب"
      subtitle="تأیید یا رد بررسی اولیه بر اساس عکس و ویدیو — جایگزین آینده: AI"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel>
          <p className="text-sm text-slate-500">در صف بررسی</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-amber-600">
            {pending.length.toLocaleString("fa-IR")}
          </p>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500">کل درخواست‌ها</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-slate-900">
            {requests.length.toLocaleString("fa-IR")}
          </p>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500">نحوه بررسی</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            فعلاً تأیید دستی ادمین؛ زیرساخت برای بررسی خودکار با AI آماده است.
          </p>
        </Panel>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          title="درخواستی در صف نیست"
          description="وقتی کاربر عکس یا ویدیو بفرستد، اینجا برای تأیید ظاهر می‌شود."
          action={<Button href="/dashboard/install">رفتن به درخواست نصب</Button>}
        />
      ) : (
        <div className="space-y-5">
          {pending.map((req) => (
            <div key={req.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{req.address}</p>
                  <p className="text-xs text-slate-400">
                    ثبت: {req.submittedAt}
                    {req.phone ? ` · ${req.phone}` : ""}
                    {req.areaM2
                      ? ` · ${req.areaM2.toLocaleString("fa-IR")} م²`
                      : ""}
                  </p>
                </div>
                <Button href="/dashboard/install" variant="outline" size="sm">
                  مشاهده در پنل کاربر
                </Button>
              </div>
              <InstallMediaReviewCard request={req} adminMode />
            </div>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
