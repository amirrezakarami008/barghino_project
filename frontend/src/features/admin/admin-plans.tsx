"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { faDigits } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { AdminPage } from "./admin-page";
import { getPlans, formatPlanNumber, type SellPlan } from "./plans-api";
import "./admin-plans.css";

type PlanFormValues = {
  readonly name: string;
  readonly description: string;
  readonly commitment_kwh: string;
  readonly rate_toman_per_kwh: string;
  readonly savings_text: string;
  readonly benefits: string;
  readonly is_recommended: boolean;
  readonly is_active: boolean;
  readonly sort_order: string;
};

type FormErrors = Partial<Record<keyof PlanFormValues, string>>;

const emptyForm: PlanFormValues = {
  name: "",
  description: "",
  commitment_kwh: "",
  rate_toman_per_kwh: "",
  savings_text: "",
  benefits: "",
  is_recommended: false,
  is_active: true,
  sort_order: "0",
};

const pageSize = 20;

export function AdminPlans(): ReactElement {
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState<readonly SellPlan[]>([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<SellPlan | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<SellPlan | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const normalizedQuery = query.replace(/ي/g, "ی").replace(/ك/g, "ک").trim().toLocaleLowerCase("fa");
  const visiblePlans = plans.filter((plan) => {
    const matchesStatus = status === "all" || plan.is_active === (status === "active");
    const text = `${plan.name} ${plan.description}`.replace(/ي/g, "ی").replace(/ك/g, "ک").toLocaleLowerCase("fa");
    return matchesStatus && text.includes(normalizedQuery);
  });

  async function loadPlans(requestedPage: number): Promise<void> {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getPlans(`page=${requestedPage}&page_size=${pageSize}`);
      setPlans(response.results);
      setCount(response.count);
      setHasNext(Boolean(response.next));
      setHasPrevious(Boolean(response.previous));
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "دریافت پلن‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let current = true;
    async function load(): Promise<void> {
      setLoading(true);
      setLoadError("");
      try {
        const response = await getPlans(`page=${page}&page_size=${pageSize}`);
        if (!current) return;
        setPlans(response.results);
        setCount(response.count);
        setHasNext(Boolean(response.next));
        setHasPrevious(Boolean(response.previous));
      } catch (error) {
        if (current) setLoadError(error instanceof ApiError ? error.message : "دریافت پلن‌ها انجام نشد.");
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => { current = false; };
  }, [page]);

  async function deletePlan(): Promise<void> {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError("");
    try {
      await apiRequest<void>(`/catalog/plans/${deleting.uuid}/`, { method: "DELETE", auth: true });
      setNotice(`پلن «${deleting.name}» حذف شد.`);
      setDeleting(null);
      await loadPlans(page);
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : "حذف پلن انجام نشد.");
    } finally {
      setDeletePending(false);
    }
  }

  function openCreate(): void {
    setEditing(null);
  }

  function closeForm(): void {
    setEditing(undefined);
  }

  async function handleSaved(): Promise<void> {
    setNotice(editing ? "تغییرات پلن ذخیره شد." : "پلن جدید ساخته شد.");
    setEditing(undefined);
    if (page !== 1) setPage(1);
    else await loadPlans(1);
  }

  return (
    <AdminPage className="admin-plans-page" title="پلن‌های فروش" eyebrow={<><Icon name="plan" />مدیریت فروش برق</>} description="نرخ‌های روشن، شرایط مشخص؛ پایهٔ یک قرارداد مطمئن." headerAction={<button id="new-plan" type="button" className="admin-button admin-button-primary" onClick={openCreate}><Icon name="plus" />پلن جدید</button>}>
      <div className="admin-plans-summary" aria-label="خلاصهٔ پلن‌ها">
        <span><Icon name="plan" /><strong>{faDigits(count)}</strong>پلن تعریف‌شده</span>
        <span className="admin-tone-emerald"><span className="admin-status-light" /><strong>{faDigits(plans.filter((plan) => plan.is_active).length)}</strong>پلن فعال{count > pageSize ? " در این صفحه" : ""}</span>
        <span className="admin-tone-gold"><Icon name="star" /><strong>{faDigits(plans.filter((plan) => plan.is_recommended).length)}</strong>پلن پیشنهادی{count > pageSize ? " در این صفحه" : ""}</span>
      </div>
      <div className="admin-collection-toolbar">
        <div className="admin-segmented" role="group" aria-label="وضعیت پلن‌ها">
          <button type="button" className={status === "all" ? "is-selected" : undefined} aria-pressed={status === "all"} onClick={() => setStatus("all")}>همهٔ پلن‌ها <span>{faDigits(plans.length)}</span></button>
          <button type="button" className={status === "active" ? "is-selected" : undefined} aria-pressed={status === "active"} onClick={() => setStatus("active")}>فعال</button>
          <button type="button" className={status === "inactive" ? "is-selected" : undefined} aria-pressed={status === "inactive"} onClick={() => setStatus("inactive")}>غیرفعال</button>
        </div>
        <div className="admin-collection-actions">
          <label className="admin-search"><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={count > pageSize ? "جست‌وجو در این صفحه…" : "جست‌وجوی نام پلن…"} aria-label="جست‌وجوی پلن در صفحهٔ فعلی" /></label>
          <div className="admin-view-switch" role="group" aria-label="نوع نمایش پلن‌ها"><button type="button" className={`admin-icon-button${view === "cards" ? " is-selected" : ""}`} aria-label="نمایش کارت‌ها" aria-pressed={view === "cards"} onClick={() => setView("cards")}><Icon name="grid" /></button><button type="button" className={`admin-icon-button${view === "table" ? " is-selected" : ""}`} aria-label="نمایش جدول" aria-pressed={view === "table"} onClick={() => setView("table")}><Icon name="table" /></button></div>
        </div>
      </div>
      {notice ? <p className="admin-plan-notice" role="status"><Icon name="check" />{notice}<button type="button" className="admin-icon-button" onClick={() => setNotice("")} aria-label="بستن پیام"><Icon name="close" /></button></p> : null}
      <section className="admin-plans-list" aria-label="پلن‌های تعریف‌شده" aria-busy={loading}>
        {loading ? <LoadingCards label="در حال دریافت پلن‌ها…" /> : loadError ? <div className="admin-data-state" role="alert"><p>{loadError}</p><button type="button" className="admin-button admin-button-secondary" onClick={() => { void loadPlans(page); }}>تلاش دوباره</button></div> : plans.length === 0 ? <div className="admin-empty-state"><span className="admin-icon-tile admin-tone-gold"><Icon name="plan" /></span><h3>هنوز پلنی تعریف نشده</h3><p>اولین پلن را بسازید و نرخ، حجم تعهد و مزایای آن را مشخص کنید.</p><button type="button" className="admin-button admin-button-primary" onClick={openCreate}><Icon name="plus" />تعریف اولین پلن</button></div> : visiblePlans.length === 0 ? <div className="admin-empty-state"><Icon name="search" /><h3>پلنی پیدا نشد</h3><p>عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.</p><button type="button" className="admin-button admin-button-secondary" onClick={() => { setQuery(""); setStatus("all"); }}>پاک‌کردن فیلترها</button></div> : view === "cards" ? <div className="admin-plan-grid">{visiblePlans.map((plan) => <PlanCard key={plan.uuid} plan={plan} onEdit={() => setEditing(plan)} onDelete={() => { setDeleteError(""); setDeleting(plan); }} />)}</div> : <div className="admin-collection-table" role="region" aria-label="جدول پلن‌های فروش" tabIndex={0}><table><caption className="sr-only">پلن‌های فروش</caption><thead><tr><th scope="col">نام پلن</th><th scope="col">نرخ خرید / تومان</th><th scope="col">تعهد / kWh</th><th scope="col">وضعیت</th><th scope="col">عملیات</th></tr></thead><tbody>{visiblePlans.map((plan) => <tr key={plan.uuid}><td><strong>{plan.name}</strong>{plan.is_recommended ? <span className="admin-plan-star" title="پلن پیشنهادی"><Icon name="star" /></span> : null}</td><td>{formatPlanNumber(plan.rate_toman_per_kwh)}</td><td>{formatPlanNumber(plan.commitment_kwh)}</td><td><PlanStatus active={plan.is_active} /></td><td><div className="admin-plan-actions"><button type="button" className="admin-plan-action-button" onClick={() => setEditing(plan)} aria-label={`ویرایش پلن ${plan.name}`}><Icon name="edit" />ویرایش</button><button type="button" className="admin-icon-button admin-delete" onClick={() => { setDeleteError(""); setDeleting(plan); }} aria-label={`حذف پلن ${plan.name}`}><Icon name="trash" /></button></div></td></tr>)}</tbody></table></div>}
        {count > pageSize ? <nav className="admin-plans-pagination" aria-label="صفحه‌بندی پلن‌ها"><button type="button" className="admin-button admin-button-secondary" disabled={!hasPrevious || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>قبلی</button><span>صفحهٔ {faDigits(page)} از {faDigits(Math.max(1, Math.ceil(count / pageSize)))}</span><button type="button" className="admin-button admin-button-secondary" disabled={!hasNext || loading} onClick={() => setPage((current) => current + 1)}>بعدی</button></nav> : null}
      </section>
      {!loading && !loadError ? <div className="admin-collection-caption"><span>مبالغ به تومان / تعهد انرژی به کیلووات‌ساعت</span><span role="status">نمایش {faDigits(visiblePlans.length)} از {faDigits(count)} پلن</span></div> : null}
      <section className="admin-publish-guide"><span className="admin-icon-tile admin-tone-emerald"><Icon name="shield" /></span><div><h2>شرایط روشن، قراردادهای مطمئن</h2><p>فقط پلن‌های فعال در قراردادهای جدید قابل انتخاب‌اند. ویرایش پلن، شرایط قراردادهای قبلی را تغییر نمی‌دهد.</p></div><span className="admin-guide-line" aria-hidden="true" /><Icon name="sun" className="admin-guide-leaf" /></section>
      {editing !== undefined ? <PlanFormDialog key={editing?.uuid ?? "new"} plan={editing} onClose={closeForm} onSaved={handleSaved} /> : null}
      {deleting ? <DeletePlanDialog plan={deleting} pending={deletePending} error={deleteError} onClose={() => { if (!deletePending) setDeleting(null); }} onConfirm={() => { void deletePlan(); }} /> : null}
    </AdminPage>
  );
}

function PlanStatus({ active }: { readonly active: boolean }): ReactElement {
  return <span className={`admin-plan-status${active ? " is-active" : ""}`}>{active ? "فعال" : "غیرفعال"}</span>;
}

function PlanCard({ plan, onEdit, onDelete }: { readonly plan: SellPlan; readonly onEdit: () => void; readonly onDelete: () => void }): ReactElement {
  const showDetails = Boolean(plan.savings_text || plan.benefits.length > 2 || plan.description.length > 100);
  return (
    <article className="admin-plan-card" data-recommended={plan.is_recommended} data-active={plan.is_active} data-tone={(plan.is_recommended || /استاندارد/.test(plan.name)) ? "amber" : /ویژه/.test(plan.name) ? "emerald" : "blue"}>
      <div className="admin-plan-landscape" aria-hidden="true">{plan.is_recommended ? <span>پلن پیشنهادی ★</span> : null}</div>
      <header className="admin-plan-card-header"><span className={`admin-icon-tile admin-tone-${plan.is_recommended ? "gold" : "emerald"}`}><Icon name="bolt" /></span><h3>{plan.name}</h3>{plan.is_recommended ? <span className="admin-plan-star" title="پلن پیشنهادی"><Icon name="star" /><span className="sr-only">پلن پیشنهادی</span></span> : null}</header>
      <p className="admin-plan-description" title={plan.description}>{plan.description || "شرایط فروش برق در این پلن"}</p>
      <div className="admin-plan-price-block"><span>نرخ خرید هر کیلووات‌ساعت</span><div><strong>{formatPlanNumber(plan.rate_toman_per_kwh)}</strong><small>تومان</small></div></div>
      <div className="admin-plan-commitment"><span><Icon name="solarPanel" />تعهد انرژی</span><strong>{formatPlanNumber(plan.commitment_kwh)} <small>kWh</small></strong></div>
      <ul className="admin-plan-benefits">{plan.benefits.slice(0, 2).map((benefit, index) => <li key={`${index}-${benefit}`}><Icon name="check" />{benefit}</li>)}</ul>
      {showDetails ? <details className="admin-plan-details"><summary>شرایط و مزایا<Icon name="chevron" /></summary><div>{plan.description ? <p>{plan.description}</p> : null}{plan.savings_text ? <p>{plan.savings_text}</p> : null}{plan.benefits.slice(2).map((benefit, index) => <p key={`${index}-${benefit}`}><Icon name="check" />{benefit}</p>)}</div></details> : null}
      <footer className="admin-plan-card-footer"><PlanStatus active={plan.is_active} /><div className="admin-plan-actions"><button type="button" className="admin-plan-action-button" onClick={onEdit} aria-label={`ویرایش پلن ${plan.name}`}><Icon name="edit" />ویرایش</button><button type="button" className="admin-icon-button admin-delete" onClick={onDelete} aria-label={`حذف پلن ${plan.name}`}><Icon name="trash" /></button></div></footer>
    </article>
  );
}

function PlanFormDialog({ plan, onClose, onSaved }: { readonly plan: SellPlan | null; readonly onClose: () => void; readonly onSaved: () => Promise<void> }): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<PlanFormValues>(() => plan ? {
    name: plan.name,
    description: plan.description,
    commitment_kwh: String(plan.commitment_kwh),
    rate_toman_per_kwh: String(plan.rate_toman_per_kwh),
    savings_text: plan.savings_text,
    benefits: plan.benefits.join("\n"),
    is_recommended: plan.is_recommended,
    is_active: plan.is_active,
    sort_order: String(plan.sort_order),
  } : emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    nameInputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function update<K extends keyof PlanFormValues>(field: K, value: PlanFormValues[K]): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const commitment = Number(values.commitment_kwh);
    const rate = Number(values.rate_toman_per_kwh);
    const sortOrder = Number(values.sort_order);
    if (!values.name.trim()) nextErrors.name = "نام پلن را وارد کنید.";
    if (!Number.isFinite(commitment) || commitment <= 0) nextErrors.commitment_kwh = "حجم تعهد باید بیشتر از صفر باشد.";
    if (!Number.isFinite(rate) || rate <= 0) nextErrors.rate_toman_per_kwh = "نرخ باید بیشتر از صفر باشد.";
    if (!Number.isInteger(sortOrder)) nextErrors.sort_order = "ترتیب نمایش باید عدد صحیح باشد.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const benefits = values.benefits.split("\n").map((benefit) => benefit.trim()).filter(Boolean);
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      commitment_kwh: values.commitment_kwh,
      rate_toman_per_kwh: values.rate_toman_per_kwh,
      savings_text: values.savings_text.trim(),
      benefits,
      is_recommended: values.is_recommended,
      is_active: values.is_active,
      sort_order: sortOrder,
    };
    setPending(true);
    setFormError("");
    try {
      await apiRequest<SellPlan>(plan ? `/catalog/plans/${plan.uuid}/` : "/catalog/plans/", {
        method: plan ? "PATCH" : "POST",
        body: payload,
        auth: true,
      });
      await onSaved();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "ذخیرهٔ پلن انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="admin-plan-dialog" aria-labelledby="admin-plan-form-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <form className="admin-plan-form" onSubmit={(event) => { void submit(event); }} noValidate>
        <div className="admin-plan-dialog-heading"><span className="admin-icon-tile admin-tone-gold"><Icon name="plan" /></span><div><h2 id="admin-plan-form-title">{plan ? "ویرایش پلن فروش" : "تعریف پلن جدید"}</h2><p>شرایط پلن را برای انتخاب در قرارداد مشخص کنید.</p></div><button type="button" className="admin-icon-button" aria-label="بستن فرم" disabled={pending} onClick={onClose}><Icon name="close" /></button></div>
        {formError ? <p className="admin-plan-error" role="alert">{formError}</p> : null}
        <fieldset className="admin-plan-form-grid" disabled={pending}>
          <legend className="sr-only">اطلاعات پلن فروش</legend>
          <label className="admin-plan-field-wide" htmlFor={firstInputId}>نام پلن<input ref={nameInputRef} id={firstInputId} value={values.name} maxLength={150} required onChange={(event) => update("name", event.target.value)} placeholder="نامی کوتاه و مشخص برای پلن" aria-invalid={Boolean(errors.name)} />{errors.name ? <small className="admin-field-error">{errors.name}</small> : null}</label>
          <label>تعهد انرژی <small>کیلووات‌ساعت</small><input type="number" dir="ltr" inputMode="decimal" min="0.001" step="0.001" required value={values.commitment_kwh} onChange={(event) => update("commitment_kwh", event.target.value)} aria-invalid={Boolean(errors.commitment_kwh)} />{errors.commitment_kwh ? <small className="admin-field-error">{errors.commitment_kwh}</small> : null}</label>
          <label>نرخ خرید <small>تومان / کیلووات‌ساعت</small><input type="number" dir="ltr" inputMode="decimal" min="0.001" step="0.001" required value={values.rate_toman_per_kwh} onChange={(event) => update("rate_toman_per_kwh", event.target.value)} aria-invalid={Boolean(errors.rate_toman_per_kwh)} />{errors.rate_toman_per_kwh ? <small className="admin-field-error">{errors.rate_toman_per_kwh}</small> : null}</label>
          <label className="admin-plan-field-wide">توضیحات<textarea value={values.description} maxLength={500} rows={2} onChange={(event) => update("description", event.target.value)} placeholder="معرفی کوتاه شرایط پلن" /></label>
          <label className="admin-plan-field-wide">متن صرفه‌جویی<input value={values.savings_text} onChange={(event) => update("savings_text", event.target.value)} placeholder="مثلاً درآمد پایدار در طول قرارداد" /></label>
          <label className="admin-plan-field-wide">مزایا <small>هر مزیت در یک خط</small><textarea value={values.benefits} rows={3} onChange={(event) => update("benefits", event.target.value)} /></label>
          <label className="admin-plan-field-wide">ترتیب نمایش<input type="number" dir="ltr" step="1" min="-2147483648" max="2147483647" value={values.sort_order} onChange={(event) => update("sort_order", event.target.value)} aria-invalid={Boolean(errors.sort_order)} />{errors.sort_order ? <small className="admin-field-error">{errors.sort_order}</small> : null}</label>
          <div className="admin-plan-form-flags admin-plan-field-wide">
            <label><input type="checkbox" checked={values.is_active} onChange={(event) => update("is_active", event.target.checked)} /><span><strong>پلن فعال</strong><small>قابل انتخاب در قراردادهای جدید</small></span></label>
            <label><input type="checkbox" checked={values.is_recommended} onChange={(event) => update("is_recommended", event.target.checked)} /><span><strong>پلن پیشنهادی</strong><small>معرفی ویژه هنگام انتخاب</small></span></label>
          </div>
        </fieldset>
        <div className="admin-plan-form-actions"><span><Icon name="shield" />اطلاعات در کاتالوگ ذخیره می‌شود.</span><button type="button" className="admin-button admin-button-secondary" disabled={pending} onClick={onClose}>انصراف</button><button type="submit" className="admin-button admin-button-primary" disabled={pending}><Icon name="check" />{pending ? "در حال ذخیره…" : plan ? "ذخیرهٔ تغییرات" : "ذخیرهٔ پلن"}</button></div>
      </form>
    </dialog>
  );
}

function DeletePlanDialog({ plan, pending, error, onClose, onConfirm }: { readonly plan: SellPlan; readonly pending: boolean; readonly error: string; readonly onClose: () => void; readonly onConfirm: () => void }): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="admin-plan-dialog admin-plan-confirm" aria-labelledby="admin-plan-delete-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <div className="admin-plan-confirm-content"><span className="admin-icon-tile admin-tone-gold"><Icon name="lock" /></span><h2 id="admin-plan-delete-title">حذف این پلن؟</h2><p>پلن «{plan.name}» از فهرست قابل انتخاب حذف می‌شود. قراردادهای قبلی تغییری نمی‌کنند.</p>{error ? <p className="admin-plan-error" role="alert">{error}</p> : null}<div className="admin-plan-form-actions"><button type="button" className="admin-button admin-button-secondary" disabled={pending} onClick={onClose}>انصراف</button><button type="button" className="admin-button admin-button-danger" disabled={pending} onClick={onConfirm}>{pending ? "در حال حذف…" : "حذف پلن"}</button></div></div>
    </dialog>
  );
}

