"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  PlanCard,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { AdminAuditLine, AdminPage, AdminSolidSurface } from "./admin-page";
import {
  deletePlan,
  formatPlanNumber,
  getPlans,
  patchPlan,
  savePlan,
  type SellPlan,
} from "./plans-api";

type Draft = {
  name: string;
  description: string;
  commitment_kwh: string;
  rate_toman_per_kwh: string;
  savings_text: string;
  benefits: string[];
  is_recommended: boolean;
  is_active: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  description: "",
  commitment_kwh: "",
  rate_toman_per_kwh: "",
  savings_text: "",
  benefits: [""],
  is_recommended: false,
  is_active: true,
});

function fromPlan(plan: SellPlan): Draft {
  return {
    name: plan.name,
    description: plan.description,
    commitment_kwh: String(plan.commitment_kwh),
    rate_toman_per_kwh: String(plan.rate_toman_per_kwh),
    savings_text: plan.savings_text,
    benefits: plan.benefits.length ? [...plan.benefits] : [""],
    is_recommended: plan.is_recommended,
    is_active: plan.is_active,
  };
}

export function AdminPlans(): ReactElement {
  const [plans, setPlans] = useState<readonly SellPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<SellPlan | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<SellPlan | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [dragId, setDragId] = useState<string>();
  const [reorderPending, setReorderPending] = useState(false);
  const [attempt, setAttempt] = useState(0);

  async function load(): Promise<void> {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getPlans("page_size=100&ordering=sort_order");
      setPlans(response.results);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "دریافت پلن‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [attempt]);

  async function toggleFlag(plan: SellPlan, field: "is_active" | "is_recommended", value: boolean): Promise<void> {
    try {
      const updated = await patchPlan(plan.uuid, { [field]: value });
      setPlans((current) => current.map((entry) => (entry.uuid === plan.uuid ? { ...entry, ...updated } : entry)));
      setNotice("تغییر وضعیت پلن ذخیره شد.");
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "ذخیره وضعیت انجام نشد.");
    }
  }

  async function persistOrder(next: readonly SellPlan[]): Promise<void> {
    setReorderPending(true);
    try {
      await Promise.all(next.map((plan, index) => patchPlan(plan.uuid, { sort_order: index + 1 })));
      setPlans(next.map((plan, index) => ({ ...plan, sort_order: index + 1 })));
      setNotice("ترتیب نمایش به‌روز شد.");
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "ذخیره ترتیب انجام نشد.");
      setAttempt((value) => value + 1);
    } finally {
      setReorderPending(false);
    }
  }

  function onDrop(targetId: string): void {
    if (!dragId || dragId === targetId || reorderPending) return;
    const from = plans.findIndex((plan) => plan.uuid === dragId);
    const to = plans.findIndex((plan) => plan.uuid === targetId);
    if (from < 0 || to < 0) return;
    const next = [...plans];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(undefined);
    void persistOrder(next);
  }

  return (
    <AdminPage
      title="پلن‌های فروش"
      description="ترتیب نمایش را بکشید، وضعیت فعال و پیشنهادی را تنظیم کنید، و فرم را کنار پیش‌نمایش زنده کارت پلن ویرایش کنید."
      headerAction={
        <Button variant="primary" onClick={() => setEditing(null)}>
          <Icon name="plus" className="size-4" />
          پلن جدید
        </Button>
      }
    >
      {notice ? <Alert tone="success" title={notice} /> : null}

      {editing !== undefined ? (
        <PlanEditor
          plan={editing}
          nextSortOrder={plans.length + 1}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setNotice(editing ? "تغییرات پلن ذخیره شد." : "پلن جدید ساخته شد.");
            setEditing(undefined);
            await load();
          }}
        />
      ) : null}

      <AdminSolidSurface className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-3/4" />
          </div>
        ) : loadError ? (
          <div className="p-4">
            <Alert tone="danger" title={loadError}>
              <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
                تلاش دوباره
              </Button>
            </Alert>
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            title="هنوز پلنی تعریف نشده"
            description="اولین پلن فروش را با نرخ خرید، تعهد انرژی و مزایا بسازید."
            icon="plan"
            action={
              <Button variant="primary" onClick={() => setEditing(null)}>
                تعریف پلن
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="فهرست پلن‌ها با امکان جابه‌جایی">
            {plans.map((plan) => (
              <li
                key={plan.uuid}
                draggable={!reorderPending}
                onDragStart={() => setDragId(plan.uuid)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(plan.uuid)}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-1 grid size-9 shrink-0 cursor-grab place-items-center rounded-md border border-border text-foreground-muted active:cursor-grabbing"
                    aria-hidden="true"
                    title="کشیدن برای تغییر ترتیب"
                  >
                    ⋮⋮
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{plan.name}</strong>
                      {plan.is_recommended ? (
                        <span className="rounded-sm bg-sun-100 px-2 py-0.5 text-caption font-semibold text-sun-800 dark:bg-sun-900/40 dark:text-sun-200">
                          پیشنهادی
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-foreground-muted">
                      {formatPlanNumber(plan.rate_toman_per_kwh)} تومان/kWh · تعهد{" "}
                      {formatPlanNumber(plan.commitment_kwh)} kWh · ترتیب {faNumber(plan.sort_order)}
                    </p>
                    <AdminAuditLine
                      text={
                        plan.is_active
                          ? "آخرین وضعیت: فعال در کاتالوگ قرارداد"
                          : "آخرین وضعیت: غیرفعال — در قراردادهای جدید دیده نمی‌شود"
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 ps-12 sm:ps-0">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.is_active}
                      onChange={(event) => {
                        void toggleFlag(plan, "is_active", event.target.checked);
                      }}
                    />
                    فعال
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.is_recommended}
                      onChange={(event) => {
                        void toggleFlag(plan, "is_recommended", event.target.checked);
                      }}
                    />
                    پیشنهادی
                  </label>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(plan)}>
                    ویرایش
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError("");
                      setDeleting(plan);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSolidSurface>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => {
          if (!deletePending) setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          setDeletePending(true);
          void deletePlan(deleting.uuid)
            .then(async () => {
              setNotice(`پلن «${deleting.name}» حذف شد.`);
              setDeleting(null);
              await load();
            })
            .catch((error: unknown) => {
              setDeleteError(error instanceof ApiError ? error.message : "حذف پلن انجام نشد.");
            })
            .finally(() => setDeletePending(false));
        }}
        title="حذف این پلن؟"
        description={
          deleting
            ? `پلن «${deleting.name}» از فهرست قابل انتخاب حذف می‌شود. قراردادهای قبلی تغییری نمی‌کنند.`
            : undefined
        }
        confirmLabel="حذف پلن"
        pending={deletePending}
        tone="danger"
      >
        {deleteError ? <Alert tone="danger" title={deleteError} /> : null}
      </ConfirmDialog>
    </AdminPage>
  );
}

function PlanEditor({
  plan,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  readonly plan: SellPlan | null;
  readonly nextSortOrder: number;
  readonly onClose: () => void;
  readonly onSaved: () => Promise<void>;
}): ReactElement {
  const formId = useId();
  const inFlight = useRef(false);
  const [draft, setDraft] = useState<Draft>(() => (plan ? fromPlan(plan) : emptyDraft()));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current) return;
    const rate = Number(draft.rate_toman_per_kwh);
    const commitment = Number(draft.commitment_kwh);
    if (!draft.name.trim()) {
      setError("نام پلن را وارد کنید.");
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(commitment) || commitment <= 0) {
      setError("نرخ خرید و تعهد انرژی باید بیشتر از صفر باشند.");
      return;
    }
    const benefits = draft.benefits.map((item) => item.trim()).filter(Boolean);
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await savePlan(
        {
          name: draft.name.trim(),
          description: draft.description.trim(),
          commitment_kwh: draft.commitment_kwh,
          rate_toman_per_kwh: draft.rate_toman_per_kwh,
          savings_text: draft.savings_text.trim(),
          benefits,
          is_recommended: draft.is_recommended,
          is_active: draft.is_active,
          sort_order: plan?.sort_order ?? nextSortOrder,
        },
        plan?.uuid,
      );
      await onSaved();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "ذخیرهٔ پلن انجام نشد.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const previewBenefits = draft.benefits.map((item) => item.trim()).filter(Boolean);
  const previewRate = Number(draft.rate_toman_per_kwh) || 0;

  return (
    <AdminSolidSurface className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-h4">{plan ? "ویرایش پلن" : "پلن جدید"}</h3>
          <p className="text-sm text-foreground-muted">تغییرات فرم بلافاصله در کارت پیش‌نمایش دیده می‌شود.</p>
        </div>
        <Button variant="ghost" disabled={pending} onClick={onClose}>
          بستن
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <form id={formId} className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
          {error ? <Alert tone="danger" title={error} /> : null}
          <Input
            label="نام پلن"
            value={draft.name}
            maxLength={150}
            required
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
          <Textarea
            label="توضیحات"
            value={draft.description}
            rows={2}
            maxLength={500}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="نرخ خرید (تومان / kWh)"
              dir="ltr"
              inputMode="decimal"
              value={draft.rate_toman_per_kwh}
              required
              onChange={(event) =>
                setDraft((current) => ({ ...current, rate_toman_per_kwh: event.target.value }))
              }
            />
            <Input
              label="تعهد انرژی (kWh)"
              dir="ltr"
              inputMode="decimal"
              value={draft.commitment_kwh}
              required
              onChange={(event) =>
                setDraft((current) => ({ ...current, commitment_kwh: event.target.value }))
              }
            />
          </div>
          <Input
            label="متن ارزش / صرفه‌جویی"
            value={draft.savings_text}
            onChange={(event) => setDraft((current) => ({ ...current, savings_text: event.target.value }))}
          />
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">مزایا</legend>
            {draft.benefits.map((benefit, index) => (
              <div key={`${formId}-benefit-${index}`} className="flex items-end gap-2">
                <Input
                  className="min-w-0 flex-1"
                  label={`مزیت ${faNumber(index + 1)}`}
                  value={benefit}
                  onChange={(event) =>
                    setDraft((current) => {
                      const benefits = [...current.benefits];
                      benefits[index] = event.target.value;
                      return { ...current, benefits };
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="حذف مزیت"
                  disabled={draft.benefits.length <= 1}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      benefits: current.benefits.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Icon name="trash" className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDraft((current) => ({ ...current, benefits: [...current.benefits, ""] }))}
            >
              افزودن مزیت
            </Button>
          </fieldset>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))}
              />
              فعال
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_recommended}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, is_recommended: event.target.checked }))
                }
              />
              پیشنهادی
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "در حال ذخیره…" : plan ? "ذخیره تغییرات" : "ایجاد پلن"}
            </Button>
          </div>
        </form>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-caption text-foreground-muted">پیش‌نمایش زنده</p>
          <PlanCard
            name={draft.name.trim() || "نام پلن"}
            buyRate={previewRate}
            energyCommitment={
              draft.commitment_kwh
                ? `${formatPlanNumber(draft.commitment_kwh)} kWh`
                : "تعهد انرژی"
            }
            benefits={previewBenefits.length ? previewBenefits : ["مزیت‌ها اینجا دیده می‌شوند"]}
            recommended={draft.is_recommended}
            sample={false}
            actionLabel={draft.savings_text.trim() || "انتخاب طرح"}
          />
        </div>
      </div>
    </AdminSolidSurface>
  );
}
