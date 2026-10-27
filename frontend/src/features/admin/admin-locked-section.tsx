import type { ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import { AdminPage } from "./admin-page";

export function AdminLockedSection({ title }: { readonly title: string }): ReactElement {
  return <AdminPage title={title} description="این بخش در مرحلهٔ بعدی سامانه فعال می‌شود." action={{ href: "/admin/plans", label: "رفتن به پلن‌های فروش", icon: "plan" }}><section className="admin-surface admin-data-state"><span className="admin-icon-tile admin-tone-gold"><Icon name="lock" /></span><h3>این بخش هنوز فعال نیست</h3><p>فعلاً مدیریت پلن‌های فروش و مشاهدهٔ راهنماها در دسترس است.</p></section></AdminPage>;
}
