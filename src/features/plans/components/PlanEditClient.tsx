"use client";

import { PlanEditorForm } from "@/features/plans/components/PlanEditorForm";
import { usePlan } from "@/features/plans/hooks/usePlans";
import { DashboardPage, EmptyState } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";

export function PlanEditClient({ id }: { id: string }) {
  const { plan } = usePlan(id);

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="ویرایش پلن" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="فقط مدیران می‌توانند پلن‌ها را ویرایش کنند."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  if (!plan) {
    return (
      <DashboardPage title="ویرایش پلن" subtitle="یافت نشد">
        <EmptyState
          title="پلن پیدا نشد"
          description="ممکن است حذف شده باشد یا شناسه اشتباه باشد."
          action={<Button href="/dashboard/plans">بازگشت به لیست</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage title="ویرایش پلن" subtitle={plan.name}>
      <div className="mb-5">
        <Button href="/dashboard/plans" variant="ghost" size="sm">
          ← بازگشت به لیست
        </Button>
      </div>
      <PlanEditorForm initial={plan} />
    </DashboardPage>
  );
}
