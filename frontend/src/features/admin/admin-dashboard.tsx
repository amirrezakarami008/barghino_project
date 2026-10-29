"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { faDigits } from "@/shared/lib/fa";
import { Icon, type IconName } from "@/shared/ui/icon";
import { AdminPage } from "./admin-page";
import { formatPlanNumber } from "./plans-api";
import { SolarIllustration } from "./solar-illustration";
import { usePlanOverview } from "./use-plan-overview";

type Guide = { readonly slug: string; readonly title: string; readonly minutes: number };
const tools = [
  { href: "/admin/plants", title: "مدیریت نیروگاه‌ها", description: "ثبت، ویرایش و بررسی نیروگاه", icon: "solarPanel", locked: false },
  { href: "/admin/plans", title: "تعریف پلن فروش", description: "نرخ، تعهد و شرایط قرارداد", icon: "plan", locked: false },
  { href: "/admin/journal", title: "مجله و راهنماها", description: "محتوای منتشرشدهٔ برقینو", icon: "book", locked: false },
  { href: "/admin/reviews", title: "بررسی درخواست‌ها", description: "انشعاب، نیروگاه و قرارداد", icon: "shield", locked: false },
  { href: "/admin/equipment", title: "کاتالوگ تجهیزات", description: "در مرحلهٔ بعد", icon: "solarPanel", locked: true },
] as const;

export function AdminDashboard({ guides }: { readonly guides: readonly Guide[] }): ReactElement {
  const { overview, retry } = usePlanOverview();
  const ready = overview.status === "ready";
  const stats: readonly { title: string; value: number | undefined; caption: string; icon: IconName; tone: string }[] = [
    { title: "پلن‌های تعریف‌شده", value: ready ? overview.total : undefined, caption: "آمادهٔ مدیریت و ویرایش", icon: "plan", tone: "gold" },
    { title: "پلن‌های فعال", value: ready ? overview.active : undefined, caption: "قابل انتخاب در قرارداد", icon: "check", tone: "emerald" },
    { title: "پلن پیشنهادی", value: ready ? overview.recommended : undefined, caption: "معرفی ویژه به مشتری", icon: "star", tone: "violet" },
    { title: "راهنماهای منتشرشده", value: guides.length, caption: "قابل مشاهده در مجله", icon: "book", tone: "blue" },
  ];
  return (
    <AdminPage title="نمای کلی مدیریت" eyebrow={<><span className="admin-status-light" />فضای کار شما</>} description="از تعریف پلن تا آماده‌سازی قرارداد، یک مسیر روشن." action={{ href: "/admin/plans", label: "مدیریت پلن‌ها", icon: "plan" }}>
      <section className="admin-welcome-panel">
        <div className="admin-welcome-copy"><span className="admin-small-label">برقینو / مدیریت فروش برق</span><h2>هر تصمیم خوب،<br />آغاز یک همکاری پایدار.</h2><p>پلن‌های شفاف تعریف کنید؛ مسیر انتخاب و قرارداد را برای مشتریان ساده‌تر کنید.</p><Link className="admin-text-link" href="/admin/plans">رفتن به پلن‌های فروش<Icon name="chevron" /></Link></div>
        <div className="admin-solar-art"><SolarIllustration /></div>
      </section>
      <section className="admin-overview-stats" aria-label="خلاصهٔ مدیریت">
        {stats.map((stat) => <article key={stat.title} className="admin-stat"><div className="admin-stat-top"><span>{stat.title}</span><span className={`admin-icon-tile admin-tone-${stat.tone}`}><Icon name={stat.icon} /></span></div><div className="admin-stat-number">{stat.value === undefined ? <span className="admin-stat-unavailable">—</span> : faDigits(stat.value)}</div><div className="admin-stat-caption">{stat.value === undefined ? overview.status === "error" ? "دریافت اطلاعات انجام نشد" : "در حال دریافت…" : stat.caption}</div></article>)}
      </section>
      <div className="admin-overview-bottom">
        <section className="admin-surface"><div className="admin-section-heading"><div><span className="admin-icon-tile admin-tone-gold"><Icon name="plan" /></span><h2>پلن‌های فروش</h2></div><Link href="/admin/plans" className="admin-text-link">مشاهده همه<Icon name="chevron" /></Link></div>
          {overview.status === "loading" ? <div className="admin-data-state" role="status">در حال دریافت پلن‌ها…</div> : overview.status === "error" ? <div className="admin-data-state" role="alert"><p>دریافت پلن‌ها انجام نشد.</p><button type="button" className="admin-button admin-button-secondary" onClick={retry}>تلاش دوباره</button></div> : overview.plans.length === 0 ? <div className="admin-data-state"><h3>اولین پلن فروش را تعریف کنید</h3><p>نرخ، حجم تعهد و مزایای همکاری را مشخص کنید.</p><Link href="/admin/plans" className="admin-button admin-button-primary"><Icon name="plus" />تعریف پلن</Link></div> : <div className="admin-table-wrap" role="region" aria-label="آخرین پلن‌ها" tabIndex={0}><table><caption className="sr-only">پلن‌های فروش</caption><thead><tr><th scope="col">نام پلن</th><th scope="col">نرخ هر کیلووات‌ساعت</th><th scope="col">وضعیت</th><th scope="col"><span className="sr-only">مدیریت</span></th></tr></thead><tbody>{overview.plans.map((plan) => <tr key={plan.uuid}><td><strong className="admin-mini-name">{plan.is_recommended ? <span className="admin-status-light" aria-label="پلن پیشنهادی" /> : null}{plan.name}</strong></td><td>{formatPlanNumber(plan.rate_toman_per_kwh)}<small>تومان</small></td><td><span className={`admin-plan-status${plan.is_active ? " is-active" : ""}`}>{plan.is_active ? "فعال" : "غیرفعال"}</span></td><td><Link href="/admin/plans" className="admin-icon-button" aria-label={`مدیریت پلن ${plan.name}`}><Icon name="chevron" /></Link></td></tr>)}</tbody></table></div>}
        </section>
        <section className="admin-surface"><div className="admin-section-heading"><div><span className="admin-icon-tile admin-tone-emerald"><Icon name="grid" /></span><h2>ابزارهای مدیریت</h2></div></div>{tools.map((tool) => {
          const content = <><span className={`admin-icon-tile${tool.locked ? "" : " admin-tone-gold"}`}><Icon name={tool.icon} /></span><span><strong>{tool.title}</strong><small>{tool.description}</small></span>{tool.locked ? null : <span className="admin-ready-label">آماده</span>}<Icon name={tool.locked ? "lock" : "chevron"} /></>;
          return tool.locked ? <div className="admin-tool-row admin-muted" key={tool.href} aria-disabled="true">{content}</div> : <Link className="admin-tool-row" key={tool.href} href={tool.href}>{content}</Link>;
        })}</section>
      </div>
    </AdminPage>
  );
}
