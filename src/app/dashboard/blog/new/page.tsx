"use client";

import { BlogEditorForm } from "@/features/blog";
import { DashboardPage, EmptyState } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";

export default function DashboardBlogNewPage() {
  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="مقاله جدید" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="فقط مدیران می‌توانند مقاله جدید منتشر کنند."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="مقاله جدید"
      subtitle="با پیش‌نمایش زنده بنویسید و مستقیم در مجله منتشر کنید"
    >
      <div className="mb-5">
        <Button href="/dashboard/blog" variant="ghost" size="sm">
          ← بازگشت به لیست
        </Button>
      </div>
      <BlogEditorForm />
    </DashboardPage>
  );
}
