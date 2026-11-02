"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  Drawer,
} from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import {
  getPlants,
  type Branch,
  type Plant,
  type Registration,
  type RegistrationResult,
} from "@/features/plants";
import { latinDigits, plantError, saveBranch, savePlant } from "@/features/plants/plants-api";
import { faNumber } from "@/shared/lib/fa";
import { normalizeCapacityInput, normalizeMeterInput } from "./site-intake-validation";

type Props = {
  readonly registration: Registration | undefined;
  readonly branch: Branch;
  readonly onClose: () => void;
  readonly onSaved: (message: string, result: RegistrationResult) => void;
};

type BranchSnapshot = {
  name: string;
  meter: string;
  address: string;
};

type PlantSnapshot = {
  name: string;
  address: string;
  capacity: string;
  branchUuid: string;
};

function Field({
  id,
  label,
  changed,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly changed?: boolean;
  readonly children: ReactElement;
}): ReactElement {
  return (
    <div className="site-review-field" data-changed={changed ? "true" : undefined}>
      <label htmlFor={id}>
        {label}
        {changed ? <span className="site-review-field__mark"> · تغییر کرده</span> : null}
      </label>
      {children}
    </div>
  );
}

export function SiteReviewEditDrawer({
  registration,
  branch,
  onClose,
  onSaved,
}: Props): ReactElement {
  const open = Boolean(registration?.item);
  const item = registration?.item;
  const kind = registration?.kind;
  const id = useId();
  const firstField = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [meter, setMeter] = useState("");
  const [capacity, setCapacity] = useState("");
  const [branchUuid, setBranchUuid] = useState(branch.uuid);
  const [baseline, setBaseline] = useState<BranchSnapshot | PlantSnapshot>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [affectedPlants, setAffectedPlants] = useState<readonly Plant[]>([]);
  const [loadingAffected, setLoadingAffected] = useState(false);

  useEffect(() => {
    if (!registration?.item || !kind) return;
    const current = registration.item;
    queueMicrotask(() => {
      setName(current.name);
      setAddress(current.address);
      setError("");
      setUncertain(false);
      setConfirmOpen(false);
      if (kind === "branch") {
        const snap: BranchSnapshot = {
          name: current.name,
          meter: (current as Branch).meter_number,
          address: current.address,
        };
        setMeter(snap.meter);
        setBaseline(snap);
      } else {
        const plant = current as Plant;
        const snap: PlantSnapshot = {
          name: plant.name,
          address: plant.address,
          capacity: plant.capacity_kwp,
          branchUuid: plant.branch_uuid,
        };
        setCapacity(snap.capacity);
        setBranchUuid(snap.branchUuid);
        setBaseline(snap);
      }
      firstField.current?.focus();
    });
  }, [registration, kind]);

  const changes: string[] = [];
  if (baseline && kind === "branch") {
    const snap = baseline as BranchSnapshot;
    if (name.trim() !== snap.name) changes.push("name");
    if (normalizeMeterInput(meter) !== normalizeMeterInput(snap.meter)) changes.push("meter");
    if (address.trim() !== snap.address) changes.push("address");
  } else if (baseline && kind === "plant") {
    const snap = baseline as PlantSnapshot;
    if (name.trim() !== snap.name) changes.push("name");
    if (address.trim() !== snap.address) changes.push("address");
    if (normalizeCapacityInput(capacity) !== normalizeCapacityInput(snap.capacity)) {
      changes.push("capacity");
    }
  }
  const changeCount = changes.length;
  const rejectionNote = item?.review_note?.trim() || "دلیل رد ثبت نشده است.";

  async function loadAffectedAndConfirm(): Promise<void> {
    setLoadingAffected(true);
    try {
      const page = await getPlants(1, AbortSignal.timeout(12000));
      const linked = page.results.filter((plant) => plant.branch_uuid === branch.uuid);
      setAffectedPlants(linked);
      if (linked.length > 0) setConfirmOpen(true);
      else await save();
    } catch {
      setAffectedPlants([]);
      setConfirmOpen(true);
    } finally {
      setLoadingAffected(false);
    }
  }

  async function save(): Promise<void> {
    if (!kind || !item || inFlight.current || uncertain || changeCount === 0) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setConfirmOpen(false);
    try {
      const result: RegistrationResult =
        kind === "branch"
          ? {
              kind: "branch",
              item: await saveBranch(
                {
                  name: name.trim(),
                  address: address.trim(),
                  meter_number: latinDigits(meter.trim()),
                },
                item.uuid,
              ),
            }
          : {
              kind: "plant",
              item: await savePlant(
                {
                  name: name.trim(),
                  address: address.trim(),
                  branch_uuid: branchUuid,
                  capacity_kwp: latinDigits(capacity.trim()).replace("٫", "."),
                },
                item.uuid,
              ),
            };
      onSaved("ذخیره شد و برای بررسی دوباره ارسال شد.", result);
    } catch (failure) {
      setError(plantError(failure));
      setUncertain(!(failure instanceof ApiError) || failure.status === 0 || failure.status >= 500);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (changeCount === 0 || pending) return;
    if (kind === "branch") {
      void loadAffectedAndConfirm();
      return;
    }
    void save();
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          if (!pending) onClose();
        }}
        title={kind === "branch" ? "اصلاح انشعاب" : "اصلاح نیروگاه"}
        description="پس از ذخیره، مورد دوباره برای بررسی شرکت ارسال می‌شود."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" disabled={pending} onClick={onClose}>
              انصراف
            </Button>
            <Button
              type="submit"
              form={`${id}-form`}
              disabled={pending || uncertain || changeCount === 0 || loadingAffected}
            >
              {pending || loadingAffected
                ? "در حال ذخیره…"
                : "ذخیره و ارسال مجدد برای بررسی"}
            </Button>
          </div>
        }
      >
        {item && kind ? (
          <div>
            <div className="site-review-edit-banner">
              <Alert
                variant="danger"
                title="دلیل رد شرکت"
                description={<blockquote className="site-review-quote">{rejectionNote}</blockquote>}
              />
            </div>

            <div className="site-review-change-bar" aria-live="polite">
              <span>
                تغییرات نسبت به آخرین ارسال:{" "}
                <strong>{faNumber(changeCount)} تغییر</strong>
              </span>
            </div>

            <form id={`${id}-form`} onSubmit={onSubmit}>
              <fieldset disabled={pending || uncertain}>
                <Field id={`${id}-name`} label={kind === "branch" ? "نام انشعاب" : "نام نیروگاه"} changed={changes.includes("name")}>
                  <input
                    ref={firstField}
                    id={`${id}-name`}
                    value={name}
                    maxLength={150}
                    required
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>

                {kind === "branch" ? (
                  <Field id={`${id}-meter`} label="شماره کنتور" changed={changes.includes("meter")}>
                    <input
                      id={`${id}-meter`}
                      dir="ltr"
                      inputMode="numeric"
                      value={meter}
                      maxLength={64}
                      required
                      onChange={(event) => setMeter(normalizeMeterInput(event.target.value))}
                    />
                  </Field>
                ) : (
                  <Field
                    id={`${id}-capacity`}
                    label="ظرفیت نصب‌شده (کیلووات)"
                    changed={changes.includes("capacity")}
                  >
                    <input
                      id={`${id}-capacity`}
                      dir="ltr"
                      inputMode="decimal"
                      value={capacity}
                      required
                      pattern="[0-9۰-۹٠-٩]+([.٫][0-9۰-۹٠-٩]{1,3})?"
                      onChange={(event) => setCapacity(normalizeCapacityInput(event.target.value))}
                    />
                  </Field>
                )}

                <Field id={`${id}-address`} label="نشانی" changed={changes.includes("address")}>
                  <textarea
                    id={`${id}-address`}
                    value={address}
                    maxLength={500}
                    required
                    rows={3}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </Field>
              </fieldset>
              {error ? (
                <Alert variant="danger" title={error} className="mt-3" />
              ) : null}
            </form>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void save();
        }}
        variant="warning"
        title="ویرایش انشعاب روی نیروگاه‌ها اثر می‌گذارد"
        description="با ویرایش انشعاب، نیروگاه‌های متصل دوباره به بررسی می‌روند."
        confirmLabel="ادامه و ذخیره"
        consequences={
          affectedPlants.length
            ? affectedPlants.map((plant) => plant.name)
            : ["نیروگاه‌های متصل به این انشعاب دوباره بررسی می‌شوند."]
        }
      />
    </>
  );
}
