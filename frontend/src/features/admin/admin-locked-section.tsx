import type { ReactElement } from "react";
import { ButtonLink, LockedFeature } from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { Icon } from "@/shared/ui/icon";
import "./admin-workspace.css";

export function AdminLockedSection({ title }: { readonly title: string }): ReactElement {
  return (
    <div className="admin-workspace">
      <section className="admin-ws-hero">
        <div className="min-w-0">
          <p className="admin-ws-hero-eyebrow">به‌زودی</p>
          <h2 className="admin-ws-hero-title">{title}</h2>
          <p className="admin-ws-hero-body">
            این بخش در مرحلهٔ بعدی سامانه فعال می‌شود. پلن‌های فروش و صف بررسی همین حالا در دسترس‌اند.
          </p>
          <div className="mt-4">
            <ButtonLink href="/admin/plans" className="admin-ws-hero-cta">
              <Icon name="plan" className="size-4" />
              رفتن به پلن‌های فروش
            </ButtonLink>
          </div>
        </div>
        <div className="admin-ws-hero-art">
          <PanelArt name="locked" width={240} height={240} className="admin-ws-hero-image" />
        </div>
      </section>

      <div className="admin-ws-empty">
        <LockedFeature
          title={`${title} هنوز فعال نیست`}
          description="مدیریت کاتالوگ تجهیزات نصب فعلاً قفل است. از میانبرهای فعال ادمین استفاده کنید."
        />
      </div>
    </div>
  );
}
