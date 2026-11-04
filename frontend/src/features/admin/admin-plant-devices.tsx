"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  Input,
  StatusPill,
} from "@/components/ui";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { formatJalaliDisplay } from "@/shared/ui/jalali-date-field";
import {
  createPlantDevice,
  getPlantDevices,
  plantDeviceError,
  rotatePlantDeviceKey,
  setPlantDeviceActive,
  uncertainDeviceMutation,
  type PlantDevice,
  type PlantDeviceSecret,
} from "./admin-plant-devices-api";
import type { AdminPlant, InventoryPage } from "./admin-plants-api";

type ListState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: InventoryPage<PlantDevice> };

type ConfirmKind =
  | { readonly kind: "rotate"; readonly device: PlantDevice }
  | { readonly kind: "toggle"; readonly device: PlantDevice; readonly nextActive: boolean };

function formatSeen(iso: string): string {
  if (!iso) return "هنوز دیده نشده";
  return formatJalaliDisplay(iso, { withTime: true });
}

export function AdminPlantDevicesPanel({
  plant,
}: {
  readonly plant: AdminPlant;
}): ReactElement {
  const formId = useId();
  const createLock = useRef(false);
  const actionLock = useRef(false);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: ListState }>();
  const [deviceId, setDeviceId] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyUuid, setBusyUuid] = useState("");
  const [secret, setSecret] = useState<PlantDeviceSecret>();
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind>();
  const [confirmPending, setConfirmPending] = useState(false);
  const canRegister = plant.status === "active";
  const key = `${plant.uuid}:${page}:${attempt}`;
  const state: ListState = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const controller = new AbortController();
    void getPlantDevices(plant.uuid, page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantDeviceError(failure) } });
        }
      });
    return () => controller.abort();
  }, [key, page, plant.uuid, attempt]);

  function reload(): void {
    setAttempt((value) => value + 1);
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (createLock.current || !canRegister) return;
    const normalizedId = deviceId.trim().toUpperCase();
    if (!normalizedId) {
      setCreateError("شناسهٔ بورد الزامی است.");
      return;
    }
    createLock.current = true;
    setCreating(true);
    setCreateError("");
    setActionError("");
    try {
      const created = await createPlantDevice(plant.uuid, {
        device_id: normalizedId,
        name: name.trim() || undefined,
      });
      setSecret(created);
      setCopied(false);
      setDeviceId("");
      setName("");
      setPage(1);
      reload();
    } catch (failure) {
      setCreateError(plantDeviceError(failure));
      if (uncertainDeviceMutation(failure)) reload();
    } finally {
      createLock.current = false;
      setCreating(false);
    }
  }

  async function copyKey(): Promise<void> {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.apiKey);
      setCopied(true);
    } catch {
      setCopied(false);
      setActionError("کپی خودکار ممکن نشد؛ کلید را دستی انتخاب و کپی کنید.");
    }
  }

  async function runConfirm(): Promise<void> {
    if (!confirm || actionLock.current) return;
    actionLock.current = true;
    setConfirmPending(true);
    setActionError("");
    try {
      if (confirm.kind === "rotate") {
        const rotated = await rotatePlantDeviceKey(confirm.device.uuid);
        setSecret(rotated);
        setCopied(false);
      } else {
        await setPlantDeviceActive(confirm.device.uuid, confirm.nextActive);
      }
      setConfirm(undefined);
      reload();
    } catch (failure) {
      setActionError(plantDeviceError(failure));
      setConfirm(undefined);
      if (uncertainDeviceMutation(failure)) reload();
    } finally {
      actionLock.current = false;
      setConfirmPending(false);
      setBusyUuid("");
    }
  }

  return (
    <>
      <div className="space-y-4">
        {!canRegister ? (
          <Alert tone="warning" title="نیروگاه هنوز تأیید نشده">
            ثبت بورد فقط برای نیروگاه با وضعیت «تأییدشده» ممکن است. فهرست بوردهای قبلی را می‌توانید ببینید.
          </Alert>
        ) : null}

        {secret ? (
          <Alert tone="warning" title="کلید API را همین حالا ذخیره کنید">
            <p className="mb-2 text-sm">
              بورد <bdi dir="ltr">{secret.deviceId}</bdi>
              {secret.name ? ` · ${secret.name}` : ""} — این کلید دیگر در فهرست دیده نمی‌شود.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code
                dir="ltr"
                className="block flex-1 break-all rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {secret.apiKey}
              </code>
              <Button variant="secondary" onClick={() => void copyKey()}>
                {copied ? "کپی شد" : "کپی کلید"}
              </Button>
            </div>
            <Button variant="ghost" className="mt-2" onClick={() => setSecret(undefined)}>
              متوجه شدم، پنهان کن
            </Button>
          </Alert>
        ) : null}

        {canRegister ? (
          <form
            id={formId}
            className="space-y-3 rounded-md border border-border p-3"
            onSubmit={(event) => void submitCreate(event)}
          >
            <h3 className="text-sm font-semibold">ثبت بورد جدید</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="شناسهٔ بورد (device_id)"
                dir="ltr"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
                required
                maxLength={64}
                disabled={creating}
                helperText="سراسری یکتا؛ هنگام ذخیره به حروف بزرگ تبدیل می‌شود."
              />
              <Input
                label="نام نمایشی (اختیاری)"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                disabled={creating}
              />
            </div>
            {createError ? <Alert tone="danger" title={createError} /> : null}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={creating}>
                <Icon name="plus" className="size-4" />
                {creating ? "در حال ثبت…" : "ثبت بورد"}
              </Button>
            </div>
          </form>
        ) : null}

        {actionError ? <Alert tone="danger" title={actionError} /> : null}

        {state.status === "loading" ? (
          <p className="text-sm text-foreground-muted">در حال بارگذاری بوردها…</p>
        ) : state.status === "error" ? (
          <Alert tone="danger" title={state.message}>
            <Button variant="secondary" className="mt-2" onClick={reload}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : !state.data.results.length ? (
          <Alert tone="info" title="بوردی ثبت نشده">
            هنوز بوردی برای این نیروگاه تعریف نشده است.
          </Alert>
        ) : (
          <ul className="space-y-3" aria-label="فهرست بوردها">
            {state.data.results.map((device) => {
              const busy = busyUuid === device.uuid;
              return (
                <li key={device.uuid} className="space-y-2 rounded-md border border-border px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold" dir="ltr">
                          {device.deviceId}
                        </span>
                        <StatusPill
                          status={device.isActive ? "active" : "rejected"}
                          label={device.isActive ? "فعال" : "غیرفعال"}
                        />
                      </div>
                      {device.name ? <p className="text-sm text-foreground-muted">{device.name}</p> : null}
                      <p className="text-caption text-foreground-muted">
                        آخرین ارتباط: {formatSeen(device.lastSeenAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy || creating || confirmPending}
                        onClick={() => {
                          setBusyUuid(device.uuid);
                          setConfirm({ kind: "rotate", device });
                        }}
                      >
                        تعویض کلید
                      </Button>
                      <Button
                        variant={device.isActive ? "danger" : "secondary"}
                        size="sm"
                        disabled={busy || creating || confirmPending}
                        onClick={() => {
                          setBusyUuid(device.uuid);
                          setConfirm({
                            kind: "toggle",
                            device,
                            nextActive: !device.isActive,
                          });
                        }}
                      >
                        {device.isActive ? "غیرفعال کردن" : "فعال کردن"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {state.status === "ready" && (state.data.next || state.data.previous) ? (
          <nav className="flex items-center justify-between gap-2 text-sm" aria-label="صفحه‌بندی بوردها">
            <Button
              variant="ghost"
              disabled={!state.data.previous}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              قبلی
            </Button>
            <span>
              صفحهٔ {faNumber(page)} · {faNumber(state.data.count)} بورد
            </span>
            <Button variant="ghost" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>
              بعدی
            </Button>
          </nav>
        ) : null}
      </div>

      {confirm ? (
        <ConfirmDialog
          open
          onClose={() => {
            if (!confirmPending) {
              setConfirm(undefined);
              setBusyUuid("");
            }
          }}
          onConfirm={() => {
            void runConfirm();
          }}
          title={
            confirm.kind === "rotate"
              ? "تعویض کلید بورد"
              : confirm.nextActive
                ? "فعال‌سازی بورد"
                : "غیرفعال‌سازی بورد"
          }
          confirmLabel={
            confirm.kind === "rotate" ? "تعویض کلید" : confirm.nextActive ? "فعال کن" : "غیرفعال کن"
          }
          variant={confirm.kind === "toggle" && !confirm.nextActive ? "danger" : "warning"}
          pending={confirmPending}
          confirmDisabled={confirmPending}
        >
          {confirm.kind === "rotate" ? (
            <p>
              کلید قبلی بورد <bdi dir="ltr">{confirm.device.deviceId}</bdi> باطل می‌شود و کلید جدید فقط یک‌بار
              نمایش داده می‌شود.
            </p>
          ) : (
            <p>
              بورد <bdi dir="ltr">{confirm.device.deviceId}</bdi>{" "}
              {confirm.nextActive
                ? "فعال می‌شود و می‌تواند به ingest وصل شود."
                : "غیرفعال می‌شود و دیگر به ingest وصل نمی‌شود."}
            </p>
          )}
        </ConfirmDialog>
      ) : null}
    </>
  );
}
