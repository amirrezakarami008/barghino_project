import Link from "next/link";
import type { ReactElement } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";
import { AdminPage } from "./admin-page";

type AdminCollectionProps = {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly tableTitle: string;
  readonly columns: readonly string[];
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly guidanceTitle: string;
  readonly guidance: readonly { readonly title: string; readonly description: string }[];
  readonly related: { readonly href: string; readonly label: string };
};

export function AdminCollection({ title, description, icon, tableTitle, columns, emptyTitle, emptyDescription, guidanceTitle, guidance, related }: AdminCollectionProps): ReactElement {
  const headings = columns.map((column) => <th key={column} scope="col">{column}</th>);
  const checklist = guidance.map((item) => <li key={item.title}><Icon name="check" /><div><h3>{item.title}</h3><p>{item.description}</p></div></li>);

  return (
    <AdminPage title={title} description={description}>
      <div className="admin-collection-layout">
        <section className="admin-surface admin-collection">
          <div className="admin-section-heading"><h2>{tableTitle}</h2><span className="admin-subtle-badge"><span className="admin-status-dot" />اطلاعات در دسترس نیست</span></div>
          <div className="admin-table-scroll" role="region" aria-label={tableTitle} tabIndex={0}>
            <table className="admin-table"><caption className="sr-only">{tableTitle}</caption><thead><tr>{headings}</tr></thead><tbody><tr><td colSpan={columns.length}>
              <div className="admin-empty-state"><div className="admin-empty-illustration"><span /><span /><span className="admin-empty-icon"><Icon name={icon} /></span></div><h3>{emptyTitle}</h3><p>{emptyDescription}</p><span className="admin-empty-note"><Icon name="shield" />تعداد و وضعیت، پس از دریافت اطلاعات نمایش داده می‌شود.</span></div>
            </td></tr></tbody></table>
          </div>
        </section>
        <aside className="admin-collection-aside">
          <section className="admin-surface admin-guidance"><span className="admin-icon-tile"><Icon name={icon} /></span><h2>{guidanceTitle}</h2><ul>{checklist}</ul></section>
          <Link className="admin-related-link" href={related.href}><span><small>بخش مرتبط</small><strong>{related.label}</strong></span><Icon name="arrow" /></Link>
        </aside>
      </div>
    </AdminPage>
  );
}
