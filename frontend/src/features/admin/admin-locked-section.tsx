import type { ReactElement } from "react";
import { LockedFeature } from "@/components/ui";
import { AdminPage } from "./admin-page";

export function AdminLockedSection({ title }: { readonly title: string }): ReactElement {
  return (
    <AdminPage
      title={title}
      description="این بخش در مرحلهٔ بعدی سامانه فعال می‌شود."
      action={{ href: "/admin/plans", label: "رفتن به پلن‌های فروش", icon: "plan" }}
    >
      <LockedFeature
        title={`${title} هنوز فعال نیست`}
        description="مدیریت کاتالوگ تجهیزات نصب فعلاً قفل است. پلن‌های فروش و صف بررسی در دسترس‌اند."
      />
    </AdminPage>
  );
}
