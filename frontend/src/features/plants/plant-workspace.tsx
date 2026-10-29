"use client";

import { useState, type ReactElement } from "react";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { usePlantInventory } from "./use-plant-inventory";
import "./plants.css";

function Status({ value }: { readonly value: string }): ReactElement {
  const labels: Record<string, string> = { active: "تأییدشده", pending: "در انتظار بررسی", inactive: "تأیید نشده", maintenance: "در حال تعمیر" };
  return <span className="plant-status" data-status={value}>{Object.hasOwn(labels, value) ? labels[value] : "وضعیت نامشخص"}</span>;
}
export function PlantWorkspace(): ReactElement {
  const [page, setPage] = useState(1);
  const { state, reload } = usePlantInventory(1, page);
  return <div className="plants-feature"><WorkspacePage title="نیروگاه من" icon="solarPanel" lede="مشخصات و وضعیت بررسی نیروگاه‌های ثبت‌شدهٔ شما. ثبت و اصلاح اطلاعات در مراحل قرارداد انجام می‌شود.">
    {state.status === "loading" ? <LoadingCards label="دریافت نیروگاه‌ها…" /> : state.status === "error" ? <div className="plant-error" role="alert"><p>{state.message}</p><Button variant="secondary" onClick={reload}>تلاش دوباره</Button></div> : <section className="plant-section" aria-labelledby="plants-heading">
      <header><div><span className="plant-section-icon is-energy"><Icon name="solarPanel" /></span><h2 id="plants-heading">نیروگاه‌های ثبت‌شده <small>{state.data.plants.count.toLocaleString("fa-IR")}</small></h2></div><Button variant="secondary" onClick={reload}>تازه‌سازی وضعیت</Button></header>
      {!state.data.plants.results.length ? <div className="plant-empty"><Icon name="solarPanel" /><h3>هنوز نیروگاهی ثبت نشده است</h3><p>ثبت انشعاب و نیروگاه، مراحل ابتدایی مسیر قرارداد هستند.</p><ButtonLink href="/panel/contracts" variant="secondary" className="mt-4">رفتن به قراردادها</ButtonLink></div> : <div className="plant-inventory">{state.data.plants.results.map((plant) => <article key={plant.uuid}><div className="plant-card-title"><h3>{plant.name}</h3><Status value={plant.status} /></div><p>ظرفیت: <bdi dir="ltr">{plant.capacity_kwp.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit)} kWp</bdi></p><p>{plant.address}</p>{state.data.branches.results.find((branch) => branch.uuid === plant.branch_uuid) ? <p>انشعاب: {state.data.branches.results.find((branch) => branch.uuid === plant.branch_uuid)?.name}</p> : null}{plant.review_note ? <p className="plant-warning">نتیجهٔ بررسی: {plant.review_note}</p> : null}</article>)}</div>}
      {state.data.plants.next || state.data.plants.previous ? <div className="plant-pagination"><Button variant="ghost" disabled={!state.data.plants.previous} onClick={() => setPage((current) => Math.max(1, current - 1))}>نیروگاه‌های قبلی</Button><span>صفحهٔ {page.toLocaleString("fa-IR")}</span><Button variant="ghost" disabled={!state.data.plants.next} onClick={() => setPage((current) => current + 1)}>نیروگاه‌های بعدی</Button></div> : null}
    </section>}
  </WorkspacePage></div>;
}
