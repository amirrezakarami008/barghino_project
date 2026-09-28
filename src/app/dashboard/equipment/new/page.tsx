"use client";

import { EquipmentEditorForm } from "@/features/equipment";
import { DashboardPage, EmptyState } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";

export default function DashboardEquipmentNewPage() {
  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="تجهیز جدید" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="فقط مدیران می‌توانند تجهیزات را تعریف کنند."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="تجهیز جدید"
      subtitle="تجهیز خورشیدی را تعریف کنید تا در برآورد هزینه نصب استفاده شود"
    >
      <div className="mb-5">
        <Button href="/dashboard/equipment" variant="ghost" size="sm">
          ← بازگشت به لیست
        </Button>
      </div>
      <EquipmentEditorForm />
    </DashboardPage>
  );
}
