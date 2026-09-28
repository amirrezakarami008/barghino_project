"use client";

import { PlanEditorForm } from "@/features/plans";
import { DashboardPage, EmptyState } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";

export default function DashboardPlansNewPage() {
  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="پلن جدید" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="فقط مدیران می‌توانند پلن جدید تعریف کنند."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="پلن جدید"
      subtitle="پلنی که اینجا تعریف کنید در انتخاب پلن هنگام قرارداد دیده می‌شود"
    >
      <div className="mb-5">
        <Button href="/dashboard/plans" variant="ghost" size="sm">
          ← بازگشت به لیست
        </Button>
      </div>
      <PlanEditorForm />
    </DashboardPage>
  );
}
