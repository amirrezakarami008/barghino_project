"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { formatDecimal } from "@/features/contracts";
import { AdminPage } from "./admin-page";
import { ReviewDialog } from "./admin-reviews";
import { AdminPlantForm } from "./admin-plant-form";
import { AdminPlantDialog } from "./admin-plant-dialog";
import { adminPlantError, deleteAdminPlant, getAdminPlants, plantStatusLabel, uncertainPlantMutation, type AdminPlant, type InventoryPage } from "./admin-plants-api";
import "./admin-plants.css";
import "./admin-reviews.css";

type State = { readonly status: "loading" } | { readonly status: "error"; readonly message: string } | { readonly status: "ready"; readonly data: InventoryPage<AdminPlant> };
type Modal = { readonly kind: "new" } | { readonly kind: "edit" | "delete" | "review"; readonly plant: AdminPlant };
export function AdminPlants(): ReactElement {
  const [page, setPage] = useState(1), [status, setStatus] = useState("all"), [query, setQuery] = useState(""), [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState<Modal>(), [notice, setNotice] = useState("");
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const key = `${page}:${status}:${query}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };
  useEffect(() => {
    const controller = new AbortController();
    void getAdminPlants(page, status, query, controller.signal).then((data) => { if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } }); }).catch((failure: unknown) => { if (!controller.signal.aborted) setResult({ key, state: { status: "error", message: adminPlantError(failure) } }); });
    return () => controller.abort();
  }, [key, page, status, query, attempt]);
  function reload(): void { setAttempt((value) => value + 1); }
  function close(refresh = false): void { setModal(undefined); if (refresh) reload(); }
  function saved(message: string): void { setNotice(message); setModal(undefined); setPage(1); reload(); }
  return <AdminPage title="مدیریت نیروگاه‌ها" description="نیروگاه‌های کاربران را مدیریت و درخواست‌های در انتظار بررسی را تأیید یا با دلیل رد کنید." eyebrow={<><Icon name="solarPanel" />دارایی‌های انرژی</>} headerAction={<button type="button" className="admin-button admin-button-primary" onClick={() => setModal({ kind: "new" })}><Icon name="plus" />ثبت نیروگاه</button>} className="admin-plants-page">
    <section className="admin-plant-intro"><span className="admin-icon-tile admin-tone-emerald"><Icon name="plant" /></span><div><h2>از ثبت تا تأیید، یک نمای روشن</h2><p>مالک از انشعاب مشخص می‌شود؛ تأیید نیروگاه نیازمند انشعاب تأییدشده است. ویرایش اطلاعات، آن را برای بررسی دوباره آماده می‌کند.</p></div></section>
    <div className="admin-plant-toolbar"><label className="admin-search"><Icon name="search" /><input type="search" aria-label="جست‌وجوی نیروگاه‌ها" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="نام نیروگاه، موبایل مالک یا کنتور…" /></label><label>وضعیت<select aria-label="وضعیت نیروگاه‌ها" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">همهٔ وضعیت‌ها</option><option value="pending">در انتظار بررسی</option><option value="active">تأییدشده</option><option value="inactive">ردشده / غیرفعال</option><option value="maintenance">در حال تعمیر</option></select></label><button type="button" className="admin-button admin-button-secondary" onClick={reload}>تازه‌سازی</button></div>
    {notice ? <p className="admin-review-notice" role="status">{notice}</p> : null}
    {state.status === "loading" ? <LoadingCards label="دریافت نیروگاه‌های کاربران…" /> : state.status === "error" ? <div role="alert" className="admin-review-error"><p>{state.message}</p><button className="admin-button admin-button-secondary" type="button" onClick={reload}>تلاش دوباره</button></div> : <>
      <p className="admin-plant-result-count">{state.data.count.toLocaleString("fa-IR")} نیروگاه مطابق فیلترها · جست‌وجو در کل فهرست انجام می‌شود</p>
      {!state.data.results.length ? <div className="admin-empty-state"><Icon name="solarPanel" /><h2>نیروگاهی با این مشخصات پیدا نشد</h2><p>فیلترها را تغییر دهید یا نیروگاه جدیدی روی انشعاب ثبت‌شده اضافه کنید.</p></div> : <div className="admin-plant-grid">{state.data.results.map((plant) => <article className="admin-plant-card" key={plant.uuid} data-status={plant.status}><header><span className="admin-icon-tile admin-tone-emerald"><Icon name="solarPanel" /></span><h2>{plant.name}</h2><span className="admin-plant-status" data-status={plant.status}>{plantStatusLabel(plant.status)}</span></header><div className="admin-plant-capacity"><strong><bdi dir="ltr">{formatDecimal(plant.capacity_kwp)}</bdi></strong><span><bdi dir="ltr">kWp</bdi> ظرفیت نصب‌شده</span></div><dl><div><dt>شماره مالک</dt><dd><bdi dir="ltr">{plant.owner_phone || "ثبت نشده"}</bdi></dd></div><div><dt>انشعاب متصل</dt><dd className="admin-plant-uuid"><bdi dir="ltr">{plant.branch_uuid}</bdi></dd></div><div><dt>نشانی</dt><dd>{plant.address || "ثبت نشده"}</dd></div></dl>{plant.review_note ? <p className="admin-plant-review-note">نتیجهٔ بررسی: {plant.review_note}</p> : null}<footer>{plant.status === "pending" ? <button type="button" className="admin-button admin-button-primary" onClick={() => setModal({ kind: "review", plant })}>بررسی {plant.name}</button> : null}<button type="button" className="admin-button admin-button-secondary" onClick={() => setModal({ kind: "edit", plant })} aria-label={`ویرایش نیروگاه ${plant.name}`}><Icon name="edit" />ویرایش</button><button type="button" className="admin-icon-button admin-delete" onClick={() => setModal({ kind: "delete", plant })} aria-label={`حذف نیروگاه ${plant.name}`}><Icon name="trash" /></button></footer></article>)}</div>}
      <nav className="admin-review-pagination" aria-label="صفحه‌بندی نیروگاه‌ها"><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.previous} onClick={() => setPage((value) => Math.max(1, value - 1))}>قبلی</button><span>صفحهٔ {page.toLocaleString("fa-IR")}</span><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>بعدی</button></nav>
    </>}
    {modal?.kind === "new" || modal?.kind === "edit" ? <AdminPlantForm key={modal.kind === "edit" ? modal.plant.uuid : "new"} plant={modal.kind === "edit" ? modal.plant : undefined} onClose={close} onSaved={() => saved("نیروگاه ذخیره شد و در انتظار بررسی است.")} /> : modal?.kind === "delete" ? <DeletePlant plant={modal.plant} onClose={close} onSaved={() => saved("نیروگاه از فهرست حذف شد.")} /> : modal?.kind === "review" ? <ReviewDialog kind="plants" item={{ uuid: modal.plant.uuid, title: modal.plant.name, fields: [] }} onClose={close} onSaved={(decision) => saved(decision === "approved" ? "نیروگاه تأیید شد." : "درخواست نیروگاه با ثبت دلیل رد شد.")} /> : null}
  </AdminPage>;
}
function DeletePlant({ plant, onClose, onSaved }: { readonly plant: AdminPlant; readonly onClose: (refresh?: boolean) => void; readonly onSaved: () => void }): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [uncertain, setUncertain] = useState(false);
  async function remove(): Promise<void> {
    if (inFlight.current || uncertain) return;
    inFlight.current = true; setPending(true); setError("");
    try { await deleteAdminPlant(plant.uuid); onSaved(); }
    catch (failure) { setError(adminPlantError(failure)); setUncertain(uncertainPlantMutation(failure)); }
    finally { inFlight.current = false; setPending(false); }
  }
  return <AdminPlantDialog title="حذف نیروگاه" pending={pending} onClose={() => onClose(uncertain)}><div className="admin-plant-delete"><p>نیروگاه «{plant.name}» از فهرست جاری حذف می‌شود. آیا از حذف این نیروگاه اطمینان دارید؟</p><p>مالک: <bdi dir="ltr">{plant.owner_phone}</bdi></p>{error ? <p role="alert" className="admin-plant-error">{error}</p> : null}<footer><button type="button" className="admin-button admin-plant-danger" disabled={pending || uncertain} onClick={() => { void remove(); }}>{pending ? "در حال حذف…" : "تأیید حذف نیروگاه"}</button><button type="button" className="admin-button admin-button-secondary" disabled={pending} onClick={() => onClose(uncertain)}>{uncertain ? "بستن و بررسی فهرست" : "انصراف"}</button></footer></div></AdminPlantDialog>;
}
