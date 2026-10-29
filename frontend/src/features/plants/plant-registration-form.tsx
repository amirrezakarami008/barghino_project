"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ApiError } from "@/features/auth/lib/api";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";
import { latinDigits, plantError, saveBranch, savePlant, type Branch, type Plant } from "./plants-api";

export type Registration = { readonly kind: "branch"; readonly item?: Branch } | { readonly kind: "plant"; readonly item?: Plant };
export type RegistrationResult = { readonly kind: "branch"; readonly item: Branch } | { readonly kind: "plant"; readonly item: Plant };
export function PlantRegistrationForm({ registration, branches, onSaved, onClose }: { readonly registration: Registration; readonly branches: readonly Branch[]; readonly onSaved: (message: string, result: RegistrationResult) => void; readonly onClose: () => void }): ReactElement {
  const item = registration.item;
  const id = useId(), heading = useRef<HTMLHeadingElement>(null), inFlight = useRef(false);
  const [name, setName] = useState(item?.name ?? ""), [address, setAddress] = useState(item?.address ?? "");
  const [meter, setMeter] = useState(registration.kind === "branch" ? registration.item?.meter_number ?? "" : "");
  const [capacity, setCapacity] = useState(registration.kind === "plant" ? registration.item?.capacity_kwp ?? "" : "");
  const [branch, setBranch] = useState(registration.kind === "plant" ? registration.item?.branch_uuid ?? (branches.length === 1 ? branches[0]?.uuid ?? "" : "") : "");
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [uncertain, setUncertain] = useState(false);
  useEffect(() => { heading.current?.focus(); }, []);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current || uncertain) return;
    inFlight.current = true; setPending(true); setError("");
    try {
      const result: RegistrationResult = registration.kind === "branch"
        ? { kind: "branch", item: await saveBranch({ name: name.trim(), address: address.trim(), meter_number: latinDigits(meter.trim()) }, item?.uuid) }
        : { kind: "plant", item: await savePlant({ name: name.trim(), address: address.trim(), branch_uuid: branch, capacity_kwp: latinDigits(capacity.trim()).replace("٫", ".") }, item?.uuid) };
      onSaved(item ? "تغییرات ذخیره شد. اطلاعات تغییرکرده برای تأیید دوباره بررسی می‌شوند." : registration.kind === "branch" ? "انشعاب ثبت شد و در انتظار بررسی است. حالا نیروگاه را روی همین انشعاب ثبت کنید." : "نیروگاه ثبت شد و در انتظار بررسی شرکت است.", result);
    } catch (failure) {
      setError(plantError(failure));
      setUncertain(!(failure instanceof ApiError) || failure.status === 0 || failure.status >= 500);
    } finally { inFlight.current = false; setPending(false); }
  }
  const title = `${item ? "ویرایش" : "ثبت"} ${registration.kind === "branch" ? "انشعاب" : "نیروگاه"}`;
  return <section className="plant-registration" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>{title}</h2>
    <p>اطلاعات را دقیق وارد کنید. تأیید انشعاب و نیروگاه توسط شرکت انجام می‌شود.</p>
    {item?.status === "active" ? <p className="plant-warning">تغییر مشخصات تأییدشده، وضعیت را به «در انتظار بررسی» برمی‌گرداند؛ تغییر انشعاب، نیروگاه‌های متصل را هم نیازمند بررسی دوباره می‌کند.</p> : null}
    <form aria-label={title} onSubmit={(event) => { void submit(event); }}>
      <fieldset disabled={pending || uncertain} className="plant-form-grid">
        <TextField id={`${id}-name`} label={registration.kind === "branch" ? "نام انشعاب" : "نام نیروگاه"} value={name} onChange={(event) => setName(event.target.value)} required maxLength={150} />
        {registration.kind === "branch" ? <TextField id={`${id}-meter`} label="شماره کنتور" dir="ltr" value={meter} onChange={(event) => setMeter(event.target.value)} required maxLength={64} /> : <>
          <label htmlFor={`${id}-branch`}>انشعاب متصل<select id={`${id}-branch`} value={branch} onChange={(event) => setBranch(event.target.value)} required><option value="">انشعاب را انتخاب کنید</option>{branches.map((entry) => <option key={entry.uuid} value={entry.uuid}>{entry.name} — {entry.meter_number}</option>)}</select><small>این نیروگاه به انشعاب انتخابی همین قرارداد متصل می‌شود. پس از تأیید هر دو می‌توانید پلن را انتخاب کنید.</small></label>
          <TextField id={`${id}-capacity`} label="ظرفیت نصب‌شده (kWp)" inputMode="decimal" dir="ltr" value={capacity} onChange={(event) => setCapacity(event.target.value)} required pattern="[0-9۰-۹٠-٩]+([.٫][0-9۰-۹٠-٩]{1,3})?" hint="مثلاً 5.5؛ بیشتر از صفر، حداکثر سه رقم اعشار" />
        </>}
        <label className="plant-form-wide" htmlFor={`${id}-address`}>نشانی {registration.kind === "branch" ? "انشعاب" : "محل نیروگاه"}<textarea id={`${id}-address`} value={address} onChange={(event) => setAddress(event.target.value)} required maxLength={500} rows={3} /></label>
      </fieldset>
      {error ? <p role="alert" className="plant-error">{error}</p> : null}
      <div className="plant-form-actions"><Button type="submit" disabled={pending || uncertain}>{pending ? "در حال ذخیره…" : title}</Button><Button variant="secondary" disabled={pending} onClick={onClose}>{uncertain ? "بستن و بررسی فهرست" : "انصراف"}</Button></div>
    </form>
  </section>;
}
