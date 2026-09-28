"use client";

import { EquipmentEditorForm, useEquipmentItem } from "@/features/equipment";
import { DashboardPage, EmptyState } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";

export function EquipmentEditClient({ id }: { id: string }) {
  const { item } = useEquipmentItem(id);

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="ویرایش تجهیز" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="فقط مدیران می‌توانند تجهیزات را ویرایش کنند."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  if (!item) {
    return (
      <DashboardPage title="ویرایش تجهیز" subtitle="یافت نشد">
        <EmptyState
          title="تجهیز پیدا نشد"
          description="ممکن است حذف شده باشد یا شناسه اشتباه باشد."
          action={<Button href="/dashboard/equipment">بازگشت به لیست</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage title="ویرایش تجهیز" subtitle={item.name}>
      <div className="mb-5">
        <Button href="/dashboard/equipment" variant="ghost" size="sm">
          ← بازگشت به لیست
        </Button>
      </div>
      <EquipmentEditorForm initial={item} />
    </DashboardPage>
  );
}
