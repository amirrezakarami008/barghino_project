"use client";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ApiError } from "@/features/auth/lib/api";
import { AdminPlantDialog } from "./admin-plant-dialog";
import { adminPlantError, getAdminBranches, saveAdminPlant, uncertainPlantMutation, type AdminBranch, type AdminPlant, type InventoryPage } from "./admin-plants-api";

type BranchState = { readonly status: "loading" } | { readonly status: "error"; readonly message: string } | { readonly status: "ready"; readonly data: InventoryPage<AdminBranch> };
export function AdminPlantForm({ plant, onClose, onSaved }: { readonly plant?: AdminPlant; readonly onClose: (refresh?: boolean) => void; readonly onSaved: () => void }): ReactElement {
  const id = useId(), inFlight = useRef(false);
  const [name, setName] = useState(plant?.name ?? ""), [address, setAddress] = useState(plant?.address ?? "");
  const [capacity, setCapacity] = useState(plant?.capacity_kwp ?? ""), [date, setDate] = useState(plant?.commissionedAt ?? "");
  const [branchId, setBranchId] = useState(plant?.branch_uuid ?? ""), [selected, setSelected] = useState<AdminBranch>();
  const [query, setQuery] = useState(""), [page, setPage] = useState(1), [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{ readonly key: string; readonly state: BranchState }>();
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [uncertain, setUncertain] = useState(false);
  const [fields, setFields] = useState<Readonly<Record<string, string>>>({});
  const key = `${page}:${query}:${attempt}:${plant?.ownerUuid ?? ""}`;
  const state: BranchState = response?.key === key ? response.state : { status: "loading" };
  useEffect(() => {
    const controller = new AbortController();
    void getAdminBranches(page, query, plant?.ownerUuid, controller.signal).then((data) => { if (!controller.signal.aborted) setResponse({ key, state: { status: "ready", data } }); }).catch((failure: unknown) => { if (!controller.signal.aborted) setResponse({ key, state: { status: "error", message: adminPlantError(failure) } }); });
    return () => controller.abort();
  }, [page, query, attempt, key, plant?.ownerUuid]);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); if (inFlight.current || uncertain) return;
    const normalized = capacity.replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".includes(digit) ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit) : "٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace("٫", ".");
    if (!branchId || !/^\d{1,5}(\.\d{1,3})?$/.test(normalized) || !/[1-9]/.test(normalized)) { setError("انشعاب و ظرفیت مثبت با حداکثر پنج رقم صحیح و سه رقم اعشار را مشخص کنید."); return; }
    inFlight.current = true; setPending(true); setError(""); setFields({});
    try { await saveAdminPlant({ branch_uuid: branchId, name: name.trim(), address: address.trim(), capacity_kwp: normalized, commissioned_at: date || null }, plant?.uuid); onSaved(); }
    catch (failure) {
      setError(adminPlantError(failure)); setUncertain(uncertainPlantMutation(failure));
      if (failure instanceof ApiError) { const errors: Record<string, string> = {}; for (const field of Object.keys(failure.fields)) errors[field] = "این مقدار از سمت سرویس پذیرفته نشد؛ آن را بررسی کنید."; setFields(errors); }
    } finally { inFlight.current = false; setPending(false); }
  }
  const selectedBranch = selected ?? (state.status === "ready" ? state.data.results.find((entry) => entry.uuid === branchId) : undefined);
  return <AdminPlantDialog title={plant ? "ویرایش نیروگاه" : "ثبت نیروگاه جدید"} pending={pending} onClose={() => onClose(uncertain)}><form className="admin-plant-form" onSubmit={(event) => { void submit(event); }}>
    <p className="admin-plant-form-note">مالک نیروگاه، مالک انشعاب انتخابی است. ثبت یا تغییر مشخصات، نیروگاه را به بررسی شرکت می‌فرستد.</p>
    <fieldset disabled={pending || uncertain}>
      <label htmlFor={`${id}-name`}>نام نیروگاه<input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={150} aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? `${id}-name-error` : undefined} />{fields.name ? <small id={`${id}-name-error`}>{fields.name}</small> : null}</label>
      <label htmlFor={`${id}-capacity`}>ظرفیت نصب‌شده (kWp)<input id={`${id}-capacity`} inputMode="decimal" dir="ltr" value={capacity} onChange={(event) => setCapacity(event.target.value)} required aria-invalid={Boolean(fields.capacity_kwp)} aria-describedby={`${id}-capacity-help`} /><small id={`${id}-capacity-help`}>{fields.capacity_kwp || "ظرفیت مثبت؛ حداکثر سه رقم اعشار، مثلاً 5.5"}</small></label>
      <label htmlFor={`${id}-date`}>تاریخ بهره‌برداری (اختیاری)<input id={`${id}-date`} type="date" dir="ltr" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label htmlFor={`${id}-address`}>نشانی نیروگاه<textarea id={`${id}-address`} value={address} onChange={(event) => setAddress(event.target.value)} required rows={2} maxLength={500} /></label>
      <section className="admin-branch-picker" aria-label="انتخاب انشعاب نیروگاه"><h3>انشعاب و مالک</h3>{selectedBranch ? <p>انتخاب‌شده: {selectedBranch.name} · <bdi dir="ltr">{selectedBranch.owner_phone}</bdi> · کنتور <bdi dir="ltr">{selectedBranch.meter_number}</bdi></p> : plant ? <p>انشعاب فعلی: <bdi dir="ltr">{plant.branch_uuid}</bdi> · مالک <bdi dir="ltr">{plant.owner_phone}</bdi></p> : <p>از انشعاب‌های ثبت‌شدهٔ کاربران انتخاب کنید.</p>}
        <label htmlFor={`${id}-branch-search`}>جست‌وجوی انشعاب<input id={`${id}-branch-search`} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="نام، شماره کنتور یا موبایل مالک…" /></label>
        {state.status === "loading" ? <p role="status">دریافت انشعاب‌ها…</p> : state.status === "error" ? <div role="alert"><p>{state.message}</p><button type="button" className="admin-button admin-button-secondary" onClick={() => setAttempt((value) => value + 1)}>تلاش دوباره</button></div> : <>{state.data.results.length ? <div className="admin-branch-options">{state.data.results.map((entry) => <label key={entry.uuid}><input type="radio" name={`${id}-branch`} checked={branchId === entry.uuid} onChange={() => { setBranchId(entry.uuid); setSelected(entry); }} /><span><strong>{entry.name}</strong><small><bdi dir="ltr">{entry.owner_phone}</bdi> · کنتور <bdi dir="ltr">{entry.meter_number}</bdi></small></span></label>)}</div> : <p>انشعابی در این صفحه پیدا نشد. ثبت انشعاب کاربر از مسیر قرارداد انجام می‌شود.</p>}<nav aria-label="صفحه‌بندی انتخاب انشعاب"><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.previous} onClick={() => setPage((value) => Math.max(1, value - 1))}>انشعاب‌های قبلی</button><span>{page.toLocaleString("fa-IR")}</span><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>انشعاب‌های بعدی</button></nav></>}
        {plant ? <p>انشعاب جدید فقط از انشعاب‌های همین مالک قابل انتخاب است.</p> : null}
      </section>
    </fieldset>
    {error ? <p role="alert" className="admin-plant-error">{error}</p> : null}
    <footer><button type="submit" className="admin-button admin-button-primary" disabled={pending || uncertain || !branchId}>{pending ? "در حال ثبت…" : "ذخیره نیروگاه"}</button><button type="button" className="admin-button admin-button-secondary" disabled={pending} onClick={() => onClose(uncertain)}>{uncertain ? "بستن و بررسی فهرست" : "انصراف"}</button></footer>
  </form></AdminPlantDialog>;
}
