"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Select,
  Skeleton,
  StatusPill,
  useToast,
} from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import {
  deleteEquipment,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_PRICE_MODES,
  equipmentCategoryLabel,
  equipmentPriceModeLabel,
  formatEquipmentMoney,
  formatEquipmentUnits,
  getEquipment,
  patchEquipment,
  saveEquipment,
  type EquipmentCategory,
  type EquipmentItem,
  type EquipmentPriceMode,
  type EquipmentWrite,
} from "@/features/catalog/equipment-api";
import "./admin-workspace.css";
import "./admin-equipment-workspace.css";

type Draft = {
  name: string;
  category: EquipmentCategory | "";
  brand: string;
  power_watts: string;
  price_toman: string;
  price_mode: EquipmentPriceMode | "";
  units_per_kwp: string;
  is_active: boolean;
  show_in_price_list: boolean;
};

type Filters = {
  search: string;
  category: string;
  price_mode: string;
  is_active: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  category: "panel",
  brand: "",
  power_watts: "",
  price_toman: "",
  price_mode: "per_kwp",
  units_per_kwp: "",
  is_active: true,
  show_in_price_list: true,
});

const emptyFilters = (): Filters => ({
  search: "",
  category: "",
  price_mode: "",
  is_active: "",
});

function fromItem(item: EquipmentItem): Draft {
  return {
    name: item.name,
    category: item.category,
    brand: item.brand,
    power_watts: item.power_watts == null ? "" : String(item.power_watts),
    price_toman: String(item.price_toman),
    price_mode: item.price_mode,
    units_per_kwp: item.units_per_kwp == null ? "" : String(item.units_per_kwp),
    is_active: item.is_active,
    show_in_price_list: item.show_in_price_list,
  };
}

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams({
    page_size: "100",
    ordering: "created_at",
  });
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.price_mode) params.set("price_mode", filters.price_mode);
  if (filters.is_active) params.set("is_active", filters.is_active);
  return params.toString();
}

function draftToWrite(draft: Draft): EquipmentWrite | string {
  if (!draft.name.trim()) return "نام تجهیز را وارد کنید.";
  if (!draft.category) return "دسته را انتخاب کنید.";
  if (!draft.price_mode) return "حالت قیمت‌گذاری را انتخاب کنید.";

  const price = Number(draft.price_toman.replace(/[,\s]/g, ""));
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
    return "قیمت باید عدد صحیح غیرمنفی (تومان) باشد.";
  }

  let powerWatts: number | null = null;
  if (draft.power_watts.trim()) {
    const watts = Number(draft.power_watts.replace(/[,\s]/g, ""));
    if (!Number.isFinite(watts) || watts <= 0 || !Number.isInteger(watts)) {
      return "توان باید عدد صحیح مثبت باشد یا خالی بماند.";
    }
    powerWatts = watts;
  }

  let unitsPerKwp: number | null = null;
  if (draft.price_mode === "per_unit") {
    const units = Number(draft.units_per_kwp.replace(/[,\s]/g, ""));
    if (!Number.isFinite(units) || units <= 0) {
      return "برای قیمت‌گذاری واحدی، تعداد واحد به ازای هر kWp باید بیشتر از صفر باشد.";
    }
    unitsPerKwp = units;
  } else if (draft.units_per_kwp.trim()) {
    return "فقط حالت «به ازای هر واحد» می‌تواند تعداد واحد داشته باشد.";
  }

  return {
    name: draft.name.trim(),
    category: draft.category,
    brand: draft.brand.trim(),
    power_watts: powerWatts,
    price_toman: price,
    price_mode: draft.price_mode,
    units_per_kwp: unitsPerKwp,
    is_active: draft.is_active,
    show_in_price_list: draft.show_in_price_list,
  };
}

export function AdminEquipment(): ReactElement {
  const { push: toast } = useToast();
  const [items, setItems] = useState<readonly EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updating, setUpdating] = useState<readonly string[]>([]);
  const flagRequests = useRef(new Set<string>());
  const [editing, setEditing] = useState<EquipmentItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<EquipmentItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getEquipment(buildQuery(applied), signal);
      if (signal?.aborted) return;
      setItems(response.results);
    } catch (error) {
      if (signal?.aborted) return;
      setLoadError(error instanceof ApiError ? error.message : "دریافت تجهیزات انجام نشد.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void load(controller.signal);
    });
    return () => controller.abort();
  }, [attempt, load]);

  async function toggleFlag(
    item: EquipmentItem,
    field: "is_active" | "show_in_price_list",
    value: boolean,
  ): Promise<void> {
    if (flagRequests.current.has(item.uuid)) return;
    flagRequests.current.add(item.uuid);
    setUpdating((current) => [...current, item.uuid]);
    try {
      const updated = await patchEquipment(item.uuid, { [field]: value });
      setItems((current) => current.map((entry) => (entry.uuid === item.uuid ? { ...entry, ...updated } : entry)));
      toast({ tone: "success", title: "وضعیت تجهیز ذخیره شد." });
    } catch (error) {
      toast({ tone: "danger", title: error instanceof ApiError ? error.message : "ذخیره وضعیت انجام نشد." });
    } finally {
      flagRequests.current.delete(item.uuid);
      setUpdating((current) => current.filter((uuid) => uuid !== item.uuid));
    }
  }

  const hasFilters = Boolean(applied.search || applied.category || applied.price_mode || applied.is_active);
  const hasFilterDraft = Boolean(filters.search || filters.category || filters.price_mode || filters.is_active);

  function clearFilters(): void {
    setFilters(emptyFilters());
    setApplied(emptyFilters());
  }

  return (
    <>
      <div className="admin-equipment-page">
        <header className="admin-equipment-header">
          <div>
            <h2>تجهیزات نیروگاه</h2>
            <p>مدیریت تجهیزات و قیمت‌های مورد استفاده در برآورد نصب</p>
          </div>
          <div className="admin-equipment-header-actions">
            <Button variant="primary" onClick={() => setEditing(null)}>
              <Icon name="plus" className="size-4" />
              تجهیز جدید
            </Button>
            <Button variant="secondary" disabled={loading} onClick={() => setAttempt((value) => value + 1)}>
              {loading ? "در حال دریافت…" : "تازه‌سازی"}
            </Button>
          </div>
        </header>

        <section className="admin-equipment-filter-panel" aria-label="جست‌وجو و فیلتر تجهیزات">
          <form
            className="admin-equipment-filters"
            onSubmit={(event) => {
              event.preventDefault();
              setApplied({ ...filters });
            }}
          >
            <Input
              label="جست‌وجو"
              type="search"
              className="admin-equipment-search"
              value={filters.search}
              placeholder="جست‌وجوی نام یا برند تجهیز"
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
            <Select
              label="دسته"
              value={filters.category}
              options={[{ value: "", label: "همه دسته‌ها" }, ...EQUIPMENT_CATEGORIES]}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            />
            <Select
              label="وضعیت"
              value={filters.is_active}
              options={[
                { value: "", label: "همه وضعیت‌ها" },
                { value: "true", label: "فعال" },
                { value: "false", label: "غیرفعال" },
              ]}
              onChange={(event) => setFilters((current) => ({ ...current, is_active: event.target.value }))}
            />
            <Select
              label="حالت قیمت"
              className="admin-equipment-filter-price"
              value={filters.price_mode}
              options={[{ value: "", label: "همه حالت‌ها" }, ...EQUIPMENT_PRICE_MODES]}
              onChange={(event) => setFilters((current) => ({ ...current, price_mode: event.target.value }))}
            />
            <div className="admin-equipment-filters-actions">
              <Button type="submit" variant="secondary" disabled={loading}>
                <Icon name="search" className="size-4" />
                اعمال فیلتر
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={!hasFilters && !hasFilterDraft}
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </Button>
            </div>
          </form>
        </section>

        <div className="admin-equipment-list-heading">
          <h3>{hasFilters ? "نتایج جست‌وجو" : "فهرست تجهیزات"}</h3>
          {!loading && !loadError ? <span>{faNumber(items.length)} تجهیز</span> : null}
        </div>

        {loading ? (
          <div className="admin-equipment-list" role="status" aria-label="در حال دریافت تجهیزات">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : loadError ? (
          <Alert tone="danger" title={loadError}>
            <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : items.length === 0 ? (
          <div className="admin-equipment-empty">
            <PanelArt name="installs/empty" width={140} height={140} className="admin-ws-empty-art" />
            <EmptyState
              hideIcon
              className="border-0 bg-transparent p-0 shadow-none"
              title={hasFilters ? "تجهیزی با این فیلترها پیدا نشد" : "هنوز تجهیزی ثبت نشده"}
              description={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید تا تجهیزات دیگر نمایش داده شوند." : "اولین پنل، اینورتر یا قطعهٔ جانبی را به کاتالوگ اضافه کنید."}
              icon="solarPanel"
              action={
                <Button variant={hasFilters ? "secondary" : "primary"} onClick={hasFilters ? clearFilters : () => setEditing(null)}>
                  {hasFilters ? "پاک کردن فیلترها" : "تجهیز جدید"}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ul className="admin-equipment-list" aria-label="فهرست تجهیزات">
              {items.map((item) => (
                <li key={item.uuid}>
                  <article className="admin-equipment-row">
                    <div className="admin-equipment-identity">
                      <div className="admin-equipment-category-icon" aria-hidden>
                        <Icon name={item.category === "panel" ? "solarPanel" : item.category === "inverter" ? "bolt" : "settings"} className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="admin-equipment-category">{equipmentCategoryLabel(item.category)}</p>
                        <h3 className="admin-equipment-row-title">{item.name}</h3>
                        <p className="admin-equipment-row-meta">
                          <bdi>{item.brand.trim() || "بدون برند"}</bdi>
                          {item.power_watts != null ? `، ${faNumber(item.power_watts)} وات` : ""}
                        </p>
                        <div className="admin-equipment-status">
                          <StatusPill status={item.is_active ? "active" : "closed"} label={item.is_active ? "فعال در برآورد" : "غیرفعال"} />
                          {item.show_in_price_list ? <span>قابل نمایش در لیست قیمت</span> : null}
                        </div>
                      </div>
                    </div>

                    <dl className="admin-equipment-price">
                      <div>
                        <dt>قیمت تجهیز</dt>
                        <dd><bdi>{formatEquipmentMoney(item.price_toman)}</bdi> <span>تومان</span></dd>
                      </div>
                      <div className="admin-equipment-price-mode">
                        <dt className="sr-only">حالت قیمت‌گذاری</dt>
                        <dd>{equipmentPriceModeLabel(item.price_mode)}</dd>
                      </div>
                      {item.price_mode === "per_unit" ? (
                        <div className="admin-equipment-quantity">
                          <dt>تعداد در هر کیلووات‌پیک</dt>
                          <dd>{formatEquipmentUnits(item.units_per_kwp)}</dd>
                        </div>
                      ) : null}
                    </dl>

                    <div className="admin-equipment-row-foot">
                      <div className="admin-equipment-toggles">
                        <label>
                          <input
                            type="checkbox"
                            role="switch"
                            aria-label={`فعال در برآورد: ${item.name}`}
                            disabled={updating.includes(item.uuid)}
                            checked={item.is_active}
                            onChange={(event) => {
                              void toggleFlag(item, "is_active", event.target.checked);
                            }}
                          />
                          فعال در برآورد
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            role="switch"
                            aria-label={`نمایش در لیست قیمت: ${item.name}`}
                            disabled={updating.includes(item.uuid)}
                            checked={item.show_in_price_list}
                            onChange={(event) => {
                              void toggleFlag(item, "show_in_price_list", event.target.checked);
                            }}
                          />
                          نمایش در لیست قیمت
                        </label>
                      </div>
                      <div className="admin-equipment-actions">
                        <Button variant="secondary" size="sm" disabled={updating.includes(item.uuid)} aria-label={`ویرایش ${item.name}`} onClick={() => setEditing(item)}>
                          <Icon name="edit" className="size-4" />
                          ویرایش
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="admin-equipment-delete"
                          aria-label={`حذف ${item.name}`}
                          disabled={updating.includes(item.uuid)}
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(item);
                          }}
                        >
                          <Icon name="trash" className="size-4" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {editing !== undefined ? (
        <EquipmentEditor
          item={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            toast({ tone: "success", title: editing ? "تغییرات تجهیز ذخیره شد." : "تجهیز جدید ساخته شد." });
            setEditing(undefined);
            await load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => {
          if (!deletePending) setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          setDeletePending(true);
          void deleteEquipment(deleting.uuid)
            .then(async () => {
              toast({ tone: "success", title: `تجهیز «${deleting.name}» حذف شد.` });
              setDeleting(null);
              await load();
            })
            .catch((error: unknown) => {
              setDeleteError(error instanceof ApiError ? error.message : "حذف تجهیز انجام نشد.");
            })
            .finally(() => setDeletePending(false));
        }}
        title="حذف این تجهیز؟"
        description={
          deleting
            ? `تجهیز «${deleting.name}» از کاتالوگ حذف می‌شود و در برآوردهای بعدی دیده نمی‌شود.`
            : undefined
        }
        confirmLabel="حذف تجهیز"
        pending={deletePending}
        tone="danger"
      >
        {deleteError ? <Alert tone="danger" title={deleteError} /> : null}
      </ConfirmDialog>
    </>
  );
}

function EquipmentEditor({
  item,
  onClose,
  onSaved,
}: {
  readonly item: EquipmentItem | null;
  readonly onClose: () => void;
  readonly onSaved: () => Promise<void>;
}): ReactElement {
  const formId = useId();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<Draft>(() => (item ? fromItem(item) : emptyDraft()));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current) return;
    const payload = draftToWrite(draft);
    if (typeof payload === "string") {
      setError(payload);
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    setFieldErrors({});
    try {
      await saveEquipment(payload, item?.uuid);
      await onSaved();
    } catch (failure) {
      if (failure instanceof ApiError) {
        setError(failure.message);
        setFieldErrors(failure.fields);
      } else {
        setError("ذخیرهٔ تجهیز انجام نشد.");
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const previewPrice = Number(draft.price_toman.replace(/[,\s]/g, ""));
  const previewName = draft.name.trim() || "نام تجهیز";

  return (
    <dialog
      ref={dialogRef}
      className="admin-equipment-dialog"
      aria-labelledby={titleId}
      data-reduced-motion={reduceMotion ? "true" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <header className="admin-equipment-dialog-hero">
        <div className="admin-equipment-dialog-hero-glow" aria-hidden />
        <div className="admin-equipment-dialog-hero-main">
          <span className="admin-equipment-dialog-icon" aria-hidden>
            <Icon name="solarPanel" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="admin-equipment-dialog-eyebrow">{item ? "ویرایش کاتالوگ" : "افزودن به کاتالوگ"}</p>
            <h2 id={titleId}>{item ? "ویرایش تجهیز" : "تجهیز جدید"}</h2>
            <p>
              برای حالت واحدی، تعداد واحد به ازای هر کیلووات‌پیک الزامی است؛ در بقیه حالت‌ها خالی بماند.
            </p>
          </div>
          <button
            type="button"
            className="admin-equipment-dialog-close"
            aria-label="بستن پنجره"
            disabled={pending}
            onClick={onClose}
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
        <div className="admin-equipment-dialog-preview" aria-hidden>
          <span>{previewName}</span>
          <span>{draft.category ? equipmentCategoryLabel(draft.category) : "دسته"}</span>
          <span dir="ltr">
            {Number.isFinite(previewPrice) && previewPrice >= 0
              ? `${formatEquipmentMoney(previewPrice)} تومان`
              : "قیمت"}
          </span>
          <span>{draft.price_mode ? equipmentPriceModeLabel(draft.price_mode) : "حالت قیمت"}</span>
        </div>
      </header>

      <form id={formId} className="admin-equipment-dialog-body" onSubmit={(event) => void submit(event)} noValidate>
        {error ? <Alert tone="danger" title={error} /> : null}
        <div className="admin-equipment-editor-grid">
          <Input
            label="نام"
            value={draft.name}
            maxLength={200}
            required
            error={fieldErrors.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="برند"
            value={draft.brand}
            maxLength={150}
            error={fieldErrors.brand}
            onChange={(event) => setDraft((current) => ({ ...current, brand: event.target.value }))}
          />
          <Select
            label="دسته"
            value={draft.category}
            required
            error={fieldErrors.category}
            options={EQUIPMENT_CATEGORIES.map((entry) => ({ value: entry.value, label: entry.label }))}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value as EquipmentCategory,
              }))
            }
          />
          <Select
            label="حالت قیمت‌گذاری"
            value={draft.price_mode}
            required
            error={fieldErrors.price_mode}
            options={EQUIPMENT_PRICE_MODES.map((entry) => ({ value: entry.value, label: entry.label }))}
            onChange={(event) => {
              const nextMode = event.target.value as EquipmentPriceMode;
              setDraft((current) => ({
                ...current,
                price_mode: nextMode,
                units_per_kwp: nextMode === "per_unit" ? current.units_per_kwp : "",
              }));
            }}
          />
          <Input
            label="قیمت (تومان)"
            dir="ltr"
            inputMode="numeric"
            value={draft.price_toman}
            required
            error={fieldErrors.price_toman}
            onChange={(event) => setDraft((current) => ({ ...current, price_toman: event.target.value }))}
          />
          <Input
            label="توان (وات)"
            dir="ltr"
            inputMode="numeric"
            value={draft.power_watts}
            helperText="اختیاری — معمولاً برای پنل یا اینورتر"
            error={fieldErrors.power_watts}
            onChange={(event) => setDraft((current) => ({ ...current, power_watts: event.target.value }))}
          />
          <Input
            label="واحد به ازای هر kWp"
            dir="ltr"
            inputMode="decimal"
            value={draft.units_per_kwp}
            disabled={draft.price_mode !== "per_unit"}
            required={draft.price_mode === "per_unit"}
            helperText={draft.price_mode === "per_unit" ? "الزامی برای حالت واحدی" : "فقط در حالت واحدی"}
            error={fieldErrors.units_per_kwp}
            onChange={(event) => setDraft((current) => ({ ...current, units_per_kwp: event.target.value }))}
          />
        </div>

        <div className="admin-equipment-dialog-flags">
          <label>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))}
            />
            فعال در برآورد
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.show_in_price_list}
              onChange={(event) =>
                setDraft((current) => ({ ...current, show_in_price_list: event.target.checked }))
              }
            />
            نمایش در لیست قیمت
          </label>
        </div>
      </form>

      <footer className="admin-equipment-dialog-foot">
        <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>
          انصراف
        </Button>
        <Button type="submit" form={formId} variant="primary" disabled={pending}>
          {pending ? "در حال ذخیره…" : item ? "ذخیره تغییرات" : "ایجاد تجهیز"}
        </Button>
      </footer>
    </dialog>
  );
}
