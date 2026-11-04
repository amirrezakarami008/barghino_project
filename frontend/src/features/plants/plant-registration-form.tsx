"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ApiError } from "@/features/auth/lib/api";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";
import {
  isSchemeType,
  isSystemType,
  type SchemeType,
  type SystemType,
} from "./plant-options";
import { PlantSpecChoices } from "./plant-spec-choices";
import { latinDigits, plantError, saveBranch, savePlant, type Branch, type Plant } from "./plants-api";
import "./plants.css";

export type Registration = { readonly kind: "branch"; readonly item?: Branch } | { readonly kind: "plant"; readonly item?: Plant };
export type RegistrationResult = { readonly kind: "branch"; readonly item: Branch } | { readonly kind: "plant"; readonly item: Plant };

export function PlantRegistrationForm({
  registration,
  branches,
  onSaved,
  onClose,
}: {
  readonly registration: Registration;
  readonly branches: readonly Branch[];
  readonly onSaved: (message: string, result: RegistrationResult) => void;
  readonly onClose: () => void;
}): ReactElement {
  const item = registration.item;
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const [name, setName] = useState(registration.kind === "branch" ? item?.name ?? "" : "");
  const [address, setAddress] = useState(item?.address ?? "");
  const [billId, setBillId] = useState(registration.kind === "branch" ? registration.item?.bill_id ?? "" : "");
  const [capacity, setCapacity] = useState(registration.kind === "plant" ? registration.item?.capacity_kwp ?? "" : "");
  const [schemeType, setSchemeType] = useState<SchemeType | "">(
    registration.kind === "plant" && registration.item ? registration.item.scheme_type : "",
  );
  const [systemType, setSystemType] = useState<SystemType | "">(
    registration.kind === "plant" && registration.item ? registration.item.system_type : "",
  );
  const lockedBranchUuid =
    registration.kind === "plant"
      ? registration.item?.branch_uuid ?? branches[0]?.uuid ?? ""
      : "";
  const lockedBranch =
    registration.kind === "plant"
      ? branches.find((entry) => entry.uuid === lockedBranchUuid) ?? branches[0]
      : undefined;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current || uncertain) return;
    if (registration.kind === "plant") {
      if (!lockedBranchUuid) {
        setError("انشعاب این نیروگاه مشخص نیست.");
        return;
      }
      if (!isSchemeType(schemeType) || !isSystemType(systemType)) {
        setError("کاربری طرح و نوع اتصال به شبکه را انتخاب کنید.");
        return;
      }
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const result: RegistrationResult =
        registration.kind === "branch"
          ? {
              kind: "branch",
              item: await saveBranch(
                {
                  name: name.trim(),
                  address: address.trim(),
                  bill_id: latinDigits(billId.trim()),
                },
                item?.uuid,
              ),
            }
          : {
              kind: "plant",
              item: await savePlant(
                {
                  branch_uuid: lockedBranchUuid,
                  capacity_kwp: latinDigits(capacity.trim()).replace("٫", "."),
                  scheme_type: schemeType as SchemeType,
                  system_type: systemType as SystemType,
                },
                item?.uuid,
              ),
            };
      onSaved(
        item
          ? "تغییرات ذخیره شد. اطلاعات تغییرکرده برای تأیید دوباره بررسی می‌شوند."
          : registration.kind === "branch"
            ? "انشعاب ثبت شد و در انتظار بررسی است. حالا نیروگاه را روی همین انشعاب ثبت کنید."
            : "نیروگاه ثبت شد و در انتظار بررسی شرکت است.",
        result,
      );
    } catch (failure) {
      setError(plantError(failure));
      setUncertain(!(failure instanceof ApiError) || failure.status === 0 || failure.status >= 500);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const title = `${item ? "ویرایش" : "ثبت"} ${registration.kind === "branch" ? "انشعاب" : "نیروگاه"}`;

  return (
    <section className="plant-registration" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
        {title}
      </h2>
      <p>اطلاعات را دقیق وارد کنید. تأیید انشعاب و نیروگاه توسط شرکت انجام می‌شود.</p>
      {item?.status === "active" ? (
        <p className="plant-warning">
          تغییر مشخصات تأییدشده، وضعیت را به «در انتظار بررسی» برمی‌گرداند.
        </p>
      ) : null}
      <form
        aria-label={title}
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <fieldset disabled={pending || uncertain} className="plant-form-grid">
          {registration.kind === "branch" ? (
            <>
              <TextField
                id={`${id}-name`}
                label="نام انشعاب"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={150}
              />
              <TextField
                id={`${id}-bill`}
                label="شناسه قبض"
                dir="ltr"
                value={billId}
                onChange={(event) => setBillId(event.target.value)}
                required
                maxLength={64}
              />
              <label className="plant-form-wide" htmlFor={`${id}-address`}>
                نشانی انشعاب
                <textarea
                  id={`${id}-address`}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                  maxLength={500}
                  rows={3}
                />
              </label>
            </>
          ) : (
            <>
              <p className="plant-form-wide plant-branch-lock">
                <strong>انشعاب این نیروگاه</strong>
                <span>
                  {lockedBranch
                    ? `${lockedBranch.name} — ${lockedBranch.bill_id}`
                    : "انشعاب ثابت و غیرقابل تغییر است."}
                </span>
              </p>
              <div className="plant-form-wide">
                <PlantSpecChoices
                  idPrefix={id}
                  schemeType={schemeType}
                  systemType={systemType}
                  onSchemeChange={setSchemeType}
                  onSystemChange={setSystemType}
                  schemeValid={isSchemeType(schemeType)}
                  systemValid={isSystemType(systemType)}
                  disabled={pending || uncertain}
                />
              </div>
              <TextField
                id={`${id}-capacity`}
                label="ظرفیت نصب‌شده (kWp)"
                inputMode="decimal"
                dir="ltr"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                required
                pattern="[0-9۰-۹٠-٩]+([.٫][0-9۰-۹٠-٩]{1,3})?"
                hint="مثلاً 5.5؛ بیشتر از صفر، حداکثر سه رقم اعشار"
              />
            </>
          )}
        </fieldset>
        {error ? (
          <p role="alert" className="plant-error">
            {error}
          </p>
        ) : null}
        <div className="plant-form-actions">
          <Button type="submit" disabled={pending || uncertain}>
            {pending ? "در حال ذخیره…" : title}
          </Button>
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            {uncertain ? "بستن و بررسی فهرست" : "انصراف"}
          </Button>
        </div>
      </form>
    </section>
  );
}
