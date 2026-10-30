"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, Textarea } from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import { faNumber } from "@/shared/lib/fa";
import {
  adminPlantError,
  getAdminBranches,
  saveAdminPlant,
  uncertainPlantMutation,
  type AdminBranch,
  type AdminPlant,
  type InventoryPage,
} from "./admin-plants-api";

type BranchState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: InventoryPage<AdminBranch> };

export function AdminPlantForm({
  plant,
  onClose,
  onSaved,
}: {
  readonly plant?: AdminPlant;
  readonly onClose: (refresh?: boolean) => void;
  readonly onSaved: () => void;
}): ReactElement {
  const id = useId();
  const inFlight = useRef(false);
  const [name, setName] = useState(plant?.name ?? "");
  const [address, setAddress] = useState(plant?.address ?? "");
  const [capacity, setCapacity] = useState(plant?.capacity_kwp ?? "");
  const [date, setDate] = useState(plant?.commissionedAt ?? "");
  const [branchId, setBranchId] = useState(plant?.branch_uuid ?? "");
  const [selected, setSelected] = useState<AdminBranch>();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{ readonly key: string; readonly state: BranchState }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [fields, setFields] = useState<Readonly<Record<string, string>>>({});
  const key = `${page}:${query}:${attempt}:${plant?.ownerUuid ?? ""}`;
  const state: BranchState = response?.key === key ? response.state : { status: "loading" };

  useEffect(() => {
    const controller = new AbortController();
    void getAdminBranches(page, query, plant?.ownerUuid, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResponse({ key, state: { status: "ready", data } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResponse({ key, state: { status: "error", message: adminPlantError(failure) } });
        }
      });
    return () => controller.abort();
  }, [page, query, attempt, key, plant?.ownerUuid]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current || uncertain) return;
    const normalized = capacity
      .replace(/[۰-۹٠-٩]/g, (digit) =>
        String(
          "۰۱۲۳۴۵۶۷۸۹".includes(digit)
            ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
            : "٠١٢٣٤٥٦٧٨٩".indexOf(digit),
        ),
      )
      .replace("٫", ".");
    if (!branchId || !/^\d{1,5}(\.\d{1,3})?$/.test(normalized) || !/[1-9]/.test(normalized)) {
      setError("انشعاب و ظرفیت مثبت با حداکثر پنج رقم صحیح و سه رقم اعشار را مشخص کنید.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    setFields({});
    try {
      await saveAdminPlant(
        {
          branch_uuid: branchId,
          name: name.trim(),
          address: address.trim(),
          capacity_kwp: normalized,
          commissioned_at: date || null,
        },
        plant?.uuid,
      );
      onSaved();
    } catch (failure) {
      setError(adminPlantError(failure));
      setUncertain(uncertainPlantMutation(failure));
      if (failure instanceof ApiError) {
        const errors: Record<string, string> = {};
        for (const field of Object.keys(failure.fields)) {
          errors[field] = "این مقدار از سمت سرویس پذیرفته نشد؛ آن را بررسی کنید.";
        }
        setFields(errors);
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const selectedBranch =
    selected ??
    (state.status === "ready" ? state.data.results.find((entry) => entry.uuid === branchId) : undefined);

  return (
    <Modal
      open
      onClose={() => {
        if (!pending) onClose(uncertain);
      }}
      title={plant ? "ویرایش نیروگاه" : "ثبت نیروگاه جدید"}
      description="مالک نیروگاه همان مالک انشعاب انتخابی است. ذخیره، نیروگاه را به بررسی شرکت می‌فرستد."
      className="max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" disabled={pending} onClick={() => onClose(uncertain)}>
            {uncertain ? "بستن و بررسی فهرست" : "انصراف"}
          </Button>
          <Button
            type="submit"
            form={`${id}-form`}
            variant="primary"
            disabled={pending || uncertain || !branchId}
          >
            {pending ? "در حال ثبت…" : "ذخیره نیروگاه"}
          </Button>
        </div>
      }
    >
      <form id={`${id}-form`} className="space-y-4" onSubmit={(event) => void submit(event)}>
        {plant ? (
          <Alert tone="warning" title="انشعاب و مالک">
            انشعاب جدید فقط از انشعاب‌های همین مالک قابل انتخاب است. انتقال به مالک دیگر ویرایش عادی نیست.
          </Alert>
        ) : null}

        <fieldset disabled={pending || uncertain} className="space-y-4">
          <Input
            label="نام نیروگاه"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={150}
            error={fields.name}
          />
          <Input
            label="ظرفیت نصب‌شده (kWp)"
            inputMode="decimal"
            dir="ltr"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            required
            error={fields.capacity_kwp}
            helperText="ظرفیت مثبت؛ حداکثر سه رقم اعشار، مثلاً 5.5"
          />
          <Input
            label="تاریخ بهره‌برداری (اختیاری)"
            type="date"
            dir="ltr"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Textarea
            label="نشانی نیروگاه"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            rows={2}
            maxLength={500}
            error={fields.address}
          />

          <section className="space-y-3 rounded-md border border-border bg-surface p-3" aria-label="انتخاب انشعاب">
            <h3 className="text-sm font-semibold">انشعاب و مالک</h3>
            {selectedBranch ? (
              <p className="text-sm text-foreground-muted">
                انتخاب‌شده: {selectedBranch.name} · <bdi dir="ltr">{selectedBranch.owner_phone}</bdi> · کنتور{" "}
                <bdi dir="ltr">{selectedBranch.meter_number}</bdi>
              </p>
            ) : plant ? (
              <p className="text-sm text-foreground-muted">
                انشعاب فعلی: <bdi dir="ltr">{plant.branch_uuid}</bdi> · مالک{" "}
                <bdi dir="ltr">{plant.owner_phone}</bdi>
              </p>
            ) : (
              <p className="text-sm text-foreground-muted">از انشعاب‌های ثبت‌شدهٔ کاربران انتخاب کنید.</p>
            )}

            <Input
              label="جست‌وجوی انشعاب"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="نام، شماره کنتور یا موبایل مالک…"
            />

            {state.status === "loading" ? (
              <p role="status" className="text-sm text-foreground-muted">
                دریافت انشعاب‌ها…
              </p>
            ) : state.status === "error" ? (
              <Alert tone="danger" title={state.message}>
                <Button type="button" variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
                  تلاش دوباره
                </Button>
              </Alert>
            ) : state.data.results.length ? (
              <div className="max-h-48 space-y-2 overflow-auto">
                {state.data.results.map((entry) => (
                  <label
                    key={entry.uuid}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-card p-2 text-sm has-[:checked]:border-energy-400"
                  >
                    <input
                      type="radio"
                      name={`${id}-branch`}
                      checked={branchId === entry.uuid}
                      onChange={() => {
                        setBranchId(entry.uuid);
                        setSelected(entry);
                      }}
                    />
                    <span>
                      <strong>{entry.name}</strong>
                      <small className="mt-0.5 block text-foreground-muted">
                        <bdi dir="ltr">{entry.owner_phone}</bdi> · کنتور{" "}
                        <bdi dir="ltr">{entry.meter_number}</bdi>
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">
                انشعابی در این صفحه پیدا نشد. ثبت انشعاب کاربر از مسیر قرارداد انجام می‌شود.
              </p>
            )}

            {state.status === "ready" ? (
              <nav className="flex items-center justify-between gap-2 text-sm" aria-label="صفحه‌بندی انتخاب انشعاب">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!state.data.previous}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  قبلی
                </Button>
                <span>{faNumber(page)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!state.data.next}
                  onClick={() => setPage((value) => value + 1)}
                >
                  بعدی
                </Button>
              </nav>
            ) : null}
          </section>
        </fieldset>

        {error ? <Alert tone="danger" title={error} /> : null}
      </form>
    </Modal>
  );
}
