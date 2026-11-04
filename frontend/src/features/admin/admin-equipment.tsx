"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Select,
  Skeleton,
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminEquipment(): ReactElement {
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<readonly EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<EquipmentItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<EquipmentItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [attempt, setAttempt] = useState(0);

  async function load(signal?: AbortSignal): Promise<void> {
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
  }

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void load(controller.signal);
    });
    return () => controller.abort();
  }, [attempt, applied]);

  async function toggleFlag(
    item: EquipmentItem,
    field: "is_active" | "show_in_price_list",
    value: boolean,
  ): Promise<void> {
    try {
      const updated = await patchEquipment(item.uuid, { [field]: value });
      setItems((current) => current.map((entry) => (entry.uuid === item.uuid ? { ...entry, ...updated } : entry)));
      setNotice("وضعیت تجهیز ذخیره شد.");
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "ذخیره وضعیت انجام نشد.");
    }
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <>
      <motion.div className="admin-workspace admin-equipment-page" {...motionProps}>
        <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
          <div className="min-w-0">
            <p className="admin-ws-hero-eyebrow">کاتالوگ نصب</p>
            <h2 className="admin-ws-hero-title">تجهیزات نیروگاه</h2>
            <p className="admin-ws-hero-body">
              پنل، اینورتر و اقلام جانبی را با قیمت و حالت محاسبه تعریف کنید تا برآورد نصب از همین کاتالوگ ساخته شود.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" className="admin-ws-hero-cta" onClick={() => setEditing(null)}>
                <Icon name="plus" className="size-4" />
                تجهیز جدید
              </Button>
              <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
                تازه‌سازی
              </Button>
            </div>
          </div>
          <div className="admin-ws-hero-art">
            <PanelArt name="stat-plants" width={160} height={160} className="admin-ws-hero-image" />
          </div>
        </motion.section>

        {notice ? <Alert tone="success" title={notice} /> : null}

        <motion.section className="admin-ws-panel" variants={reduceMotion ? undefined : fadeUp}>
          <form
            className="admin-equipment-filters"
            onSubmit={(event) => {
              event.preventDefault();
              setApplied({ ...filters });
            }}
          >
            <Input
              label="جست‌وجو"
              value={filters.search}
              placeholder="نام یا برند"
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
            <Select
              label="دسته"
              value={filters.category}
              options={EQUIPMENT_CATEGORIES.map((entry) => ({ value: entry.value, label: entry.label }))}
              placeholder="همه"
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            />
            <Select
              label="حالت قیمت"
              value={filters.price_mode}
              options={EQUIPMENT_PRICE_MODES.map((entry) => ({ value: entry.value, label: entry.label }))}
              placeholder="همه"
              onChange={(event) => setFilters((current) => ({ ...current, price_mode: event.target.value }))}
            />
            <Select
              label="وضعیت"
              value={filters.is_active}
              options={[
                { value: "true", label: "فعال" },
                { value: "false", label: "غیرفعال" },
              ]}
              placeholder="همه"
              onChange={(event) => setFilters((current) => ({ ...current, is_active: event.target.value }))}
            />
            <div className="admin-equipment-filters-actions">
              <Button type="submit" variant="secondary">
                اعمال فیلتر
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const next = emptyFilters();
                  setFilters(next);
                  setApplied(next);
                }}
              >
                پاک کردن
              </Button>
            </div>
          </form>
        </motion.section>

        {loading ? (
          <div className="admin-ws-list">
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
        ) : loadError ? (
          <Alert tone="danger" title={loadError}>
            <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : items.length === 0 ? (
          <div className="admin-ws-empty">
            <PanelArt name="installs/empty" width={140} height={140} className="admin-ws-empty-art" />
            <EmptyState
              hideIcon
              className="border-0 bg-transparent p-0 shadow-none"
              title="هنوز تجهیزی ثبت نشده"
              description="اولین پنل، اینورتر یا قطعهٔ جانبی را با قیمت تومان اضافه کنید."
              icon="solarPanel"
              action={
                <Button variant="primary" onClick={() => setEditing(null)}>
                  تعریف تجهیز
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <p className="admin-ws-result">{faNumber(items.length)} تجهیز در فهرست</p>
            <ul className="admin-ws-list" aria-label="فهرست تجهیزات">
              {items.map((item) => (
                <motion.li key={item.uuid} variants={reduceMotion ? undefined : fadeUp}>
                  <article className="admin-equipment-row">
                    <div className="min-w-0">
                      <h3 className="admin-equipment-row-title">{item.name}</h3>
                      <p className="admin-equipment-row-meta">
                        {equipmentCategoryLabel(item.category)}
                        {item.brand.trim() ? ` · ${item.brand.trim()}` : ""}
                        {item.power_watts != null ? ` · ${faNumber(item.power_watts)} وات` : ""}
                      </p>
                      <div className="admin-equipment-row-chips">
                        <span className="admin-ws-chip">{item.is_active ? "فعال" : "غیرفعال"}</span>
                        {item.show_in_price_list ? <span className="admin-ws-chip">لیست قیمت</span> : null}
                        <span className="admin-ws-chip">{equipmentPriceModeLabel(item.price_mode)}</span>
                      </div>
                    </div>

                    <div className="admin-equipment-row-metrics">
                      <div className="admin-equipment-metric">
                        <span>قیمت</span>
                        <strong dir="ltr">{formatEquipmentMoney(item.price_toman)} تومان</strong>
                      </div>
                      <div className="admin-equipment-metric">
                        <span>{item.price_mode === "per_unit" ? "واحد / kWp" : "حالت محاسبه"}</span>
                        <strong dir="ltr">
                          {item.price_mode === "per_unit"
                            ? formatEquipmentUnits(item.units_per_kwp)
                            : equipmentPriceModeLabel(item.price_mode)}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-equipment-row-foot">
                      <div className="admin-equipment-toggles">
                        <label>
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={(event) => {
                              void toggleFlag(item, "is_active", event.target.checked);
                            }}
                          />
                          فعال
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={item.show_in_price_list}
                            onChange={(event) => {
                              void toggleFlag(item, "show_in_price_list", event.target.checked);
                            }}
                          />
                          نمایش در لیست قیمت
                        </label>
                      </div>
                      <div className="admin-equipment-actions">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(item)}>
                          ویرایش
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(item);
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </article>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </motion.div>

      {editing !== undefined ? (
        <EquipmentEditor
          item={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setNotice(editing ? "تغییرات تجهیز ذخیره شد." : "تجهیز جدید ساخته شد.");
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
              setNotice(`تجهیز «${deleting.name}» حذف شد.`);
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
