"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertSlot,
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  InfoPopover,
  selectBannerAlert,
  Skeleton,
  StatusPill,
  useToast,
  type AlertHandle,
} from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import {
  getBranches,
  getPlants,
  PlantRegistrationForm,
  type Branch,
  type Plant,
  type Registration,
} from "@/features/plants";
import { latinDigits, plantError, saveBranch, savePlant } from "@/features/plants/plants-api";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { ContractError, ContractPagination } from "./contract-ui";
import { type PlantOption } from "./contract-model";
import { plantStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import {
  selectSiteIntakeAlerts,
  type SiteIntakeAlertActions,
} from "./site-intake-alerts";
import {
  clearIntakeDraft,
  intakeDraftIsDirty,
  readIntakeDraft,
  writeIntakeDraft,
} from "./site-intake-draft";
import { SiteDossier } from "./site-dossier";
import {
  EMPTY_INTAKE_DRAFT,
  type SiteIntakeDraft,
  type SiteIntakeFieldId,
  type SiteIntakeSubmitIssue,
} from "./site-intake-types";
import {
  branchSectionValid,
  collectInvalidFields,
  fieldError,
  intakeCompleteness,
  intakeFormValid,
  normalizeCapacityInput,
  normalizeMeterInput,
  plantSectionValid,
  plantsForBranch,
} from "./site-intake-validation";
import "./site-intake.css";

type Props = {
  readonly initialBranchId?: string;
  readonly initialPlantId?: string;
  readonly onContinueReview: (option: PlantOption) => void;
  readonly onSkipToPlan: (option: PlantOption) => void;
};

function contractOption(plant: Plant, branch: Branch): PlantOption {
  return {
    plant: {
      uuid: plant.uuid,
      name: plant.name,
      branchUuid: plant.branch_uuid,
      capacity: plant.capacity_kwp,
      status: plant.status,
      reviewNote: plant.review_note,
    },
    branch: {
      uuid: branch.uuid,
      name: branch.name,
      meter: branch.meter_number,
      address: branch.address,
      status: branch.status,
    },
  };
}

function Segmented({
  value,
  onChange,
  options,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly {
    readonly id: string;
    readonly label: string;
    readonly badge?: string;
    readonly disabled?: boolean;
    readonly title?: string;
  }[];
}): ReactElement {
  return (
    <div className="site-segment" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="site-segment__btn"
          aria-pressed={value === option.id}
          disabled={option.disabled}
          title={option.title}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.badge ? <span className="site-segment__badge">{option.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  valid,
  hint,
  popover,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly valid?: boolean;
  readonly hint?: string;
  readonly popover?: ReactNode;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="site-field" id={id} data-invalid={error ? "true" : undefined}>
      <div className="site-field__label-row">
        <label htmlFor={`${id}-control`}>{label}</label>
        {popover}
        {valid && !error ? (
          <span className="site-field__valid" aria-hidden>
            <Icon name="check" className="size-3.5" />
          </span>
        ) : null}
      </div>
      {children}
      {hint && !error ? <p className="site-field__hint">{hint}</p> : null}
      {error ? (
        <p className="site-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SiteIntakeStep({
  initialBranchId = "",
  initialPlantId = "",
  onContinueReview,
  onSkipToPlan,
}: Props): ReactElement {
  const router = useRouter();
  const formId = useId();
  const { push: toast } = useToast();
  const [dismissedBanners, setDismissedBanners] = useState<ReadonlySet<string>>(new Set());
  const summaryRef = useRef<AlertHandle>(null);
  const plantSectionRef = useRef<HTMLElement>(null);
  const inFlight = useRef(false);
  const branchBecameValid = useRef(false);
  const plantBecameValid = useRef(false);
  const [branchPage, setBranchPage] = useState(1);
  const [plantPage, setPlantPage] = useState(1);
  const [draft, setDraft] = useState<SiteIntakeDraft>(() => ({
    ...EMPTY_INTAKE_DRAFT,
    branchId: initialBranchId,
    plantId: initialPlantId,
    branchMode: initialBranchId ? "existing" : "new",
    plantMode: initialPlantId ? "existing" : "new",
  }));
  const [touched, setTouched] = useState<Partial<Record<SiteIntakeFieldId, boolean>>>({});
  const [branchOpen, setBranchOpen] = useState(true);
  const [plantOpen, setPlantOpen] = useState(false);
  const [submitIssue, setSubmitIssue] = useState<SiteIntakeSubmitIssue>({ kind: "none" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editRegistration, setEditRegistration] = useState<Registration>();
  const [draftRestored, setDraftRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [online, setOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const [branches, plants] = await Promise.all([
        getBranches(branchPage, signal),
        getPlants(plantPage, signal),
      ]);
      return { branches, plants };
    },
    [branchPage, plantPage],
  );
  const resource = useContractResource(`site-intake:${branchPage}:${plantPage}`, load);

  useEffect(() => {
    const saved = readIntakeDraft();
    if (saved && intakeDraftIsDirty(saved)) {
      setDraft((prev) => ({
        ...saved,
        branchId: saved.branchId || prev.branchId,
        plantId: saved.plantId || prev.plantId,
      }));
      setDraftRestored(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !intakeDraftIsDirty(draft)) return;
    const handle = window.setTimeout(() => {
      writeIntakeDraft(draft);
      setSavedAt(Date.now());
      toast({
        id: "intake-autosave",
        tone: "info",
        title: "پیش‌نویس فرم ذخیره شد",
        durationMs: 2200,
      });
    }, 900);
    return () => window.clearTimeout(handle);
  }, [draft, hydrated, toast]);

  useEffect(() => {
    function onOnline() {
      setOnline(true);
      toast({ tone: "success", title: "ارتباط دوباره برقرار شد" });
    }
    function onOffline() {
      setOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [toast]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!intakeDraftIsDirty(draft)) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [draft]);

  const branches = resource.state.status === "ready" ? resource.state.data.branches : undefined;
  const plants = resource.state.status === "ready" ? resource.state.data.plants : undefined;

  useEffect(() => {
    if (!branches || draft.branchId || draftRestored) return;
    if (branches.results.length === 1) {
      const only = branches.results[0]!;
      setDraft((prev) => ({ ...prev, branchMode: "existing", branchId: only.uuid }));
      return;
    }
    if (branches.results.length > 0 && !initialBranchId && draft.branchMode === "new" && !draft.branchName) {
      setDraft((prev) => ({ ...prev, branchMode: "existing" }));
    }
  }, [
    branches,
    draft.branchId,
    draft.branchMode,
    draft.branchName,
    draftRestored,
    initialBranchId,
  ]);

  const selectedBranch =
    branches?.results.find((item) => item.uuid === draft.branchId) ??
    (draft.createdBranchId
      ? branches?.results.find((item) => item.uuid === draft.createdBranchId)
      : undefined);
  const matchingPlants = plantsForBranch(plants?.results ?? [], draft.branchId || draft.createdBranchId);
  const selectedPlant =
    matchingPlants.find((item) => item.uuid === draft.plantId) ??
    plants?.results.find((item) => item.uuid === draft.plantId);

  const branchValid = branchSectionValid(draft);
  const plantValid = plantSectionValid(draft);
  const formValid = intakeFormValid(draft);

  useEffect(() => {
    if (branchValid && !branchBecameValid.current) {
      branchBecameValid.current = true;
      setBranchOpen(false);
      setPlantOpen(true);
      queueMicrotask(() =>
        plantSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
    if (!branchValid) branchBecameValid.current = false;
  }, [branchValid]);

  useEffect(() => {
    if (plantValid && !plantBecameValid.current) {
      plantBecameValid.current = true;
      setPlantOpen(false);
    }
    if (!plantValid) plantBecameValid.current = false;
  }, [plantValid]);

  function patch(next: Partial<SiteIntakeDraft>): void {
    setDraft((prev) => {
      const merged = { ...prev, ...next };
      if (merged.sameAddress && "branchAddress" in next) {
        merged.plantAddress = merged.branchAddress;
      }
      if (merged.branchMode === "new") {
        merged.plantMode = "new";
        merged.plantId = "";
      }
      return merged;
    });
    setSubmitIssue((prev) => (prev.kind === "validation" ? { kind: "none" } : prev));
  }

  function syncUrl(branchId: string, plantId: string): void {
    const params = new URLSearchParams(window.location.search);
    if (branchId) params.set("branch", branchId);
    else params.delete("branch");
    if (plantId) params.set("plant", plantId);
    else params.delete("plant");
    window.history.replaceState(null, "", `/panel/contracts/new${params.size ? `?${params}` : ""}`);
  }

  const actions: SiteIntakeAlertActions = {
    useExistingBranch: (branchId) => {
      patch({ branchMode: "existing", branchId, plantId: "", plantMode: "new" });
      setBranchOpen(false);
      setPlantOpen(true);
    },
    editBranch: () => {
      if (selectedBranch) setEditRegistration({ kind: "branch", item: selectedBranch });
    },
    pickAnotherBranch: () => {
      patch({ branchId: "", plantId: "", plantMode: "new" });
      setBranchOpen(true);
    },
    editPlant: () => {
      if (selectedPlant) setEditRegistration({ kind: "plant", item: selectedPlant });
    },
    pickAnotherPlant: () => {
      patch({ plantId: "" });
      setPlantOpen(true);
    },
    ackCapacity: () => patch({ capacityAcked: true }),
    continueToPlan: () => {
      if (selectedBranch && selectedPlant) onSkipToPlan(contractOption(selectedPlant, selectedBranch));
    },
    resetDraft: () => {
      clearIntakeDraft();
      setDraft({
        ...EMPTY_INTAKE_DRAFT,
        branchMode: (branches?.results.length ?? 0) > 0 ? "existing" : "new",
      });
      setDraftRestored(false);
      setDismissedBanners((prev) => new Set([...prev, "draft.restored"]));
      setSavedAt(null);
    },
    retrySubmit: () => {
      setConfirmOpen(true);
    },
    loginAgain: () => {
      router.push("/login?next=/panel/contracts/new");
    },
  };

  const alerts = selectSiteIntakeAlerts({
    state: {
      draft,
      branches: branches?.results ?? [],
      plants: plants?.results ?? [],
      selectedBranch,
      selectedPlant,
      submitIssue,
      draftRestored,
      online,
    },
    actions,
  });

  const banner = selectBannerAlert(
    alerts.filter((item) => !dismissedBanners.has(item.id)),
  ).visible;

  function blurField(field: SiteIntakeFieldId): void {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function visibleError(field: SiteIntakeFieldId): string | undefined {
    if (!touched[field] && submitIssue.kind !== "validation") return undefined;
    return fieldError(field, draft);
  }

  async function performSubmit(): Promise<void> {
    if (inFlight.current) return;
    const invalid = collectInvalidFields(draft);
    if (invalid.length) {
      setSubmitIssue({ kind: "validation", fields: invalid });
      setTouched(Object.fromEntries(invalid.map((field) => [field, true])));
      setConfirmOpen(false);
      queueMicrotask(() => {
        summaryRef.current?.focus();
        document.getElementById(`intake-${invalid[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    if (draft.branchMode === "existing" && draft.plantMode === "existing") {
      if (!selectedBranch || !selectedPlant) return;
      setConfirmOpen(false);
      clearIntakeDraft();
      setSavedAt(null);
      syncUrl(selectedBranch.uuid, selectedPlant.uuid);
      if (selectedBranch.status === "active" && selectedPlant.status === "active") {
        onSkipToPlan(contractOption(selectedPlant, selectedBranch));
      } else {
        onContinueReview(contractOption(selectedPlant, selectedBranch));
      }
      return;
    }

    inFlight.current = true;
    setSubmitIssue({ kind: "none" });
    try {
      let branch = selectedBranch;
      let branchId = draft.createdBranchId || draft.branchId;

      if (draft.branchMode === "new" && !draft.createdBranchId) {
        branch = await saveBranch({
          name: draft.branchName.trim(),
          address: draft.branchAddress.trim(),
          meter_number: latinDigits(draft.meter.trim()),
        });
        branchId = branch.uuid;
        patch({ createdBranchId: branch.uuid, branchId: branch.uuid, branchMode: "existing" });
        syncUrl(branch.uuid, "");
      } else if (draft.createdBranchId && !branch) {
        branchId = draft.createdBranchId;
      }

      if (!branchId) throw new ApiError("انشعاب مشخص نیست.", 400, "invalid", {});

      let plant = selectedPlant;
      if (draft.plantMode === "new" && !draft.createdPlantId) {
        plant = await savePlant({
          name: draft.plantName.trim(),
          address: draft.plantAddress.trim(),
          branch_uuid: branchId,
          capacity_kwp: latinDigits(draft.capacity.trim()).replace("٫", "."),
        });
        patch({ createdPlantId: plant.uuid, plantId: plant.uuid, plantMode: "existing" });
        syncUrl(branchId, plant.uuid);
      }

      if (!plant) {
        setSubmitIssue({ kind: "partial" });
        return;
      }

      if (!branch) {
        const pages = await getBranches(1, AbortSignal.timeout(10000));
        branch = pages.results.find((item) => item.uuid === branchId);
      }
      if (!branch) {
        setSubmitIssue({ kind: "partial" });
        return;
      }

      clearIntakeDraft();
      setSavedAt(null);
      toast({ tone: "success", title: "ثبت شد و برای بررسی ارسال شد" });
      setConfirmOpen(false);
      resource.reload();
      onContinueReview(contractOption(plant, branch));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSubmitIssue({ kind: "session" });
      } else if (error instanceof ApiError && error.fields.meter_number) {
        setSubmitIssue({ kind: "conflict" });
      } else if (error instanceof ApiError && (error.status === 0 || error.code === "network")) {
        setSubmitIssue({ kind: "network" });
      } else if (draft.createdBranchId && !draft.createdPlantId) {
        setSubmitIssue({ kind: "partial" });
      } else {
        setSubmitIssue({ kind: "generic", message: plantError(error) });
      }
      setConfirmOpen(false);
      queueMicrotask(() => summaryRef.current?.focus());
    } finally {
      inFlight.current = false;
    }
  }

  function onFormKeyDown(event: KeyboardEvent<HTMLFormElement>): void {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (formValid) setConfirmOpen(true);
      else {
        const invalid = collectInvalidFields(draft);
        setSubmitIssue({ kind: "validation", fields: invalid });
        setTouched(Object.fromEntries(invalid.map((field) => [field, true])));
        queueMicrotask(() => summaryRef.current?.focus());
      }
      return;
    }
    if (event.key !== "Enter" || event.target instanceof HTMLTextAreaElement) return;
    const form = event.currentTarget;
    const controls = Array.from(
      form.querySelectorAll<HTMLElement>("input:not([type=checkbox]):not([type=radio]), textarea, select, button.site-segment__btn"),
    ).filter((node) => !("disabled" in node && (node as HTMLButtonElement).disabled));
    const index = controls.indexOf(event.target as HTMLElement);
    if (index >= 0 && index < controls.length - 1) {
      event.preventDefault();
      controls[index + 1]?.focus();
    }
  }

  if (resource.state.status === "loading") {
    return (
      <div className="site-intake-main">
        <Skeleton className="h-40" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  if (resource.state.status === "error") {
    return <ContractError message={resource.state.message} retry={resource.reload} />;
  }

  const completeness = intakeCompleteness(draft);
  const branchCount = branches?.count ?? branches?.results.length ?? 0;

  const branchSummary =
    draft.branchMode === "existing" && selectedBranch
      ? `${selectedBranch.name} · ${selectedBranch.meter_number}`
      : [draft.branchName, draft.meter].filter(Boolean).join(" · ") || "انشعاب";

  const plantSummary =
    draft.plantMode === "existing" && selectedPlant
      ? `${selectedPlant.name} · ${selectedPlant.capacity_kwp} کیلووات`
      : [draft.plantName, draft.capacity ? `${draft.capacity} کیلووات` : ""].filter(Boolean).join(" · ") ||
        "نیروگاه";

  return (
    <div className="site-intake">
      {banner ? (
        <Alert
          key={banner.id}
          variant={banner.variant}
          title={banner.title}
          description={banner.description}
          actions={banner.actions}
          dismissible
          onDismiss={() => setDismissedBanners((prev) => new Set([...prev, banner.id]))}
        />
      ) : null}

      <button
        type="button"
        className="site-intake-mobile-chip"
        onClick={() => setSheetOpen(true)}
      >
        <span>
          پرونده · {faNumber(completeness.filled)} از {faNumber(completeness.total)} فیلد
        </span>
        <Icon name="chevron" className="size-4 -rotate-90" />
      </button>

      {sheetOpen ? (
        <>
          <button
            type="button"
            className="site-sheet-backdrop"
            aria-label="بستن خلاصه پرونده"
            onClick={() => setSheetOpen(false)}
          />
          <div className="site-sheet" role="dialog" aria-label="خلاصه پرونده">
            <div className="site-sheet__grab" />
            <SiteDossier
              draft={draft}
              branch={selectedBranch}
              plant={selectedPlant}
              sectionsValid={{ branch: branchValid, plant: plantValid }}
              compact
            />
          </div>
        </>
      ) : null}

      <div className="site-intake-layout">
        <div className="site-intake-main">
          <Alert
            ref={summaryRef}
            variant="danger"
            title={
              submitIssue.kind === "validation"
                ? `${faNumber(submitIssue.fields.length)} مورد نیاز به اصلاح دارد`
                : "خطای ارسال"
            }
            open={
              submitIssue.kind === "validation" ||
              submitIssue.kind === "network" ||
              submitIssue.kind === "partial" ||
              submitIssue.kind === "session" ||
              submitIssue.kind === "generic"
            }
            description={
              submitIssue.kind === "network"
                ? "اطلاعات فرم حفظ شده است."
                : submitIssue.kind === "partial"
                  ? "اطلاعات انشعاب ذخیره شده است. فقط ثبت نیروگاه را دوباره امتحان کنید."
                  : submitIssue.kind === "session"
                    ? "پیش‌نویس فرم حفظ شده است."
                    : submitIssue.kind === "generic"
                      ? submitIssue.message
                      : undefined
            }
            items={
              submitIssue.kind === "validation"
                ? submitIssue.fields.map((field) => ({
                    label:
                      field === "branch-meter"
                        ? "شماره کنتور"
                        : field === "plant-capacity"
                          ? "ظرفیت نصب‌شده"
                          : field,
                    href: `#intake-${field}`,
                  }))
                : undefined
            }
            actions={
              submitIssue.kind === "network" ||
              submitIssue.kind === "partial" ||
              submitIssue.kind === "generic"
                ? [{ label: "تلاش دوباره", variant: "primary", onClick: () => setConfirmOpen(true) }]
                : submitIssue.kind === "session"
                  ? [{ label: "ورود دوباره", variant: "primary", onClick: actions.loginAgain }]
                  : undefined
            }
          />
          <form
            id={formId}
            className="space-y-4"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              if (formValid) setConfirmOpen(true);
              else {
                const invalid = collectInvalidFields(draft);
                setSubmitIssue({ kind: "validation", fields: invalid });
                setTouched(Object.fromEntries(invalid.map((field) => [field, true])));
                queueMicrotask(() => summaryRef.current?.focus());
              }
            }}
            onKeyDown={onFormKeyDown}
          >
            <section className="site-section-card" aria-labelledby={`${formId}-branch-title`}>
              {branchValid && !branchOpen ? (
                <button type="button" className="site-section-chip" onClick={() => setBranchOpen(true)}>
                  <span className="site-section-chip__check">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className="site-section-chip__meta">
                    <strong>۱ · انشعاب</strong>
                    <span>{branchSummary}</span>
                  </span>
                  <span className="site-section-chip__edit">ویرایش</span>
                </button>
              ) : (
                <>
                  <div className="site-section-card__head">
                    <h3 id={`${formId}-branch-title`} className="site-section-card__title">
                      <span className="site-section-card__index">{faNumber(1)}</span>
                      انشعاب
                    </h3>
                  </div>
                  <div className="site-section-card__body">
                    <AlertSlot placement="section-branch" alerts={alerts} />
                    <Segmented
                      value={draft.branchMode}
                      onChange={(value) => {
                        if (value === "existing" && branchCount === 0) return;
                        patch({
                          branchMode: value as "existing" | "new",
                          plantMode: value === "new" ? "new" : draft.plantMode,
                          plantId: value === "new" ? "" : draft.plantId,
                        });
                      }}
                      options={[
                        {
                          id: "existing",
                          label: "انتخاب از انشعاب‌های من",
                          badge: faNumber(branchCount),
                          disabled: branchCount === 0,
                          title:
                            branchCount === 0
                              ? "هنوز انشعابی ثبت نکرده‌اید"
                              : undefined,
                        },
                        { id: "new", label: "انشعاب جدید" },
                      ]}
                    />

                    {draft.branchMode === "existing" ? (
                      !branches?.results.length ? (
                        <EmptyState
                          title="انشعابی ثبت نشده"
                          description="با «انشعاب جدید» مشخصات را وارد کنید."
                        />
                      ) : (
                        <fieldset id="intake-branch-select" className="site-select-list">
                          <legend className="sr-only">انتخاب انشعاب</legend>
                          {branches.results.map((entry) => {
                            const meta = plantStatusMeta(entry.status);
                            return (
                              <label
                                key={entry.uuid}
                                className="site-select-card"
                                data-selected={draft.branchId === entry.uuid}
                              >
                                <input
                                  type="radio"
                                  name="intake-branch"
                                  checked={draft.branchId === entry.uuid}
                                  onChange={() => {
                                    patch({
                                      branchId: entry.uuid,
                                      plantId: "",
                                      plantMode: "new",
                                      plantAddress: draft.sameAddress
                                        ? entry.address
                                        : draft.plantAddress,
                                    });
                                    syncUrl(entry.uuid, "");
                                    blurField("branch-select");
                                  }}
                                />
                                <span className="site-select-card__icon" aria-hidden>
                                  <Icon name="home" className="size-5" />
                                </span>
                                <span className="site-select-card__body">
                                  <strong>{entry.name}</strong>
                                  <span>
                                    کنتور: <bdi dir="ltr">{entry.meter_number}</bdi>
                                  </span>
                                  <span>{entry.address}</span>
                                </span>
                                <span className="site-select-card__end">
                                  <StatusPill status={meta.tone} label={meta.label} />
                                  <span className="site-select-card__check" aria-hidden>
                                    <Icon name="check" className="size-3.5" />
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </fieldset>
                      )
                    ) : (
                      <>
                        <Field
                          id="intake-branch-name"
                          label="نام انشعاب"
                          error={visibleError("branch-name")}
                          valid={!fieldError("branch-name", draft) && Boolean(draft.branchName.trim())}
                        >
                          <input
                            id="intake-branch-name-control"
                            value={draft.branchName}
                            maxLength={150}
                            required
                            onBlur={() => blurField("branch-name")}
                            onChange={(event) => patch({ branchName: event.target.value })}
                          />
                        </Field>
                        <Field
                          id="intake-branch-meter"
                          label="شماره کنتور"
                          error={visibleError("branch-meter")}
                          valid={!fieldError("branch-meter", draft) && Boolean(draft.meter.trim())}
                          popover={
                            <InfoPopover title="شماره کنتور کجاست؟">
                              معمولاً روی صفحه یا بدنهٔ کنتور برق چاپ شده است. همان شماره‌ای را وارد کنید که روی
                              قبض یا خود کنتور می‌بینید.
                            </InfoPopover>
                          }
                        >
                          <input
                            id="intake-branch-meter-control"
                            dir="ltr"
                            inputMode="numeric"
                            value={draft.meter}
                            maxLength={64}
                            required
                            onBlur={() => blurField("branch-meter")}
                            onPaste={(event) => {
                              event.preventDefault();
                              const text = event.clipboardData.getData("text");
                              patch({ meter: normalizeMeterInput(text) });
                            }}
                            onChange={(event) =>
                              patch({ meter: normalizeMeterInput(event.target.value) })
                            }
                          />
                        </Field>
                        <Field
                          id="intake-branch-address"
                          label="نشانی انشعاب"
                          error={visibleError("branch-address")}
                          valid={
                            !fieldError("branch-address", draft) && Boolean(draft.branchAddress.trim())
                          }
                        >
                          <textarea
                            id="intake-branch-address-control"
                            value={draft.branchAddress}
                            maxLength={500}
                            required
                            rows={3}
                            onBlur={() => blurField("branch-address")}
                            onChange={(event) => patch({ branchAddress: event.target.value })}
                          />
                        </Field>
                      </>
                    )}
                    {branches && (branches.next || branches.previous) ? (
                      <ContractPagination page={branchPage} {...branches} onChange={setBranchPage} />
                    ) : null}
                  </div>
                </>
              )}
            </section>

            <section
              ref={plantSectionRef}
              className="site-section-card"
              aria-labelledby={`${formId}-plant-title`}
            >
              {plantValid && !plantOpen ? (
                <button type="button" className="site-section-chip" onClick={() => setPlantOpen(true)}>
                  <span className="site-section-chip__check">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className="site-section-chip__meta">
                    <strong>۲ · نیروگاه</strong>
                    <span>{plantSummary}</span>
                  </span>
                  <span className="site-section-chip__edit">ویرایش</span>
                </button>
              ) : (
                <>
                  <div className="site-section-card__head">
                    <h3 id={`${formId}-plant-title`} className="site-section-card__title">
                      <span className="site-section-card__index">{faNumber(2)}</span>
                      نیروگاه
                    </h3>
                  </div>
                  <div className="site-section-card__body">
                    <AlertSlot placement="section-plant" alerts={alerts} />
                    <Segmented
                      value={draft.plantMode}
                      onChange={(value) => {
                        if (value === "existing" && draft.branchMode === "new") return;
                        patch({ plantMode: value as "existing" | "new" });
                      }}
                      options={[
                        {
                          id: "existing",
                          label: "انتخاب از نیروگاه‌های این انشعاب",
                          badge: faNumber(matchingPlants.length),
                          disabled: draft.branchMode === "new" || !draft.branchId,
                          title:
                            draft.branchMode === "new"
                              ? "برای انشعاب جدید فقط ثبت نیروگاه جدید ممکن است"
                              : !draft.branchId
                                ? "ابتدا انشعاب را انتخاب کنید"
                                : undefined,
                        },
                        { id: "new", label: "نیروگاه جدید" },
                      ]}
                    />

                    {draft.plantMode === "existing" ? (
                      !matchingPlants.length ? (
                        <EmptyState
                          title="نیروگاهی برای این انشعاب نیست"
                          description="با «نیروگاه جدید» مشخصات را ثبت کنید."
                        />
                      ) : (
                        <fieldset id="intake-plant-select" className="site-select-list">
                          <legend className="sr-only">انتخاب نیروگاه</legend>
                          {matchingPlants.map((entry) => {
                            const meta = plantStatusMeta(entry.status);
                            return (
                              <label
                                key={entry.uuid}
                                className="site-select-card"
                                data-selected={draft.plantId === entry.uuid}
                              >
                                <input
                                  type="radio"
                                  name="intake-plant"
                                  checked={draft.plantId === entry.uuid}
                                  onChange={() => {
                                    patch({ plantId: entry.uuid });
                                    syncUrl(draft.branchId, entry.uuid);
                                    blurField("plant-select");
                                  }}
                                />
                                <span className="site-select-card__icon" aria-hidden>
                                  <Icon name="solarPanel" className="size-5" />
                                </span>
                                <span className="site-select-card__body">
                                  <strong>{entry.name}</strong>
                                  <span>
                                    <bdi dir="ltr">{entry.capacity_kwp}</bdi> کیلووات
                                  </span>
                                  <span>{entry.address}</span>
                                </span>
                                <span className="site-select-card__end">
                                  <StatusPill status={meta.tone} label={meta.label} />
                                  <span className="site-select-card__check" aria-hidden>
                                    <Icon name="check" className="size-3.5" />
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </fieldset>
                      )
                    ) : (
                      <>
                        <Field
                          id="intake-plant-name"
                          label="نام نیروگاه"
                          error={visibleError("plant-name")}
                          valid={!fieldError("plant-name", draft) && Boolean(draft.plantName.trim())}
                        >
                          <input
                            id="intake-plant-name-control"
                            value={draft.plantName}
                            maxLength={150}
                            required
                            onBlur={() => blurField("plant-name")}
                            onChange={(event) => patch({ plantName: event.target.value })}
                          />
                        </Field>
                        <label className="site-check">
                          <input
                            type="checkbox"
                            checked={draft.sameAddress}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              patch({
                                sameAddress: checked,
                                plantAddress: checked
                                  ? draft.branchMode === "existing"
                                    ? (selectedBranch?.address ?? draft.branchAddress)
                                    : draft.branchAddress
                                  : draft.plantAddress,
                              });
                            }}
                          />
                          <span>آدرس نیروگاه با آدرس انشعاب یکی است</span>
                        </label>
                        <Field
                          id="intake-plant-address"
                          label="نشانی محل نیروگاه"
                          error={visibleError("plant-address")}
                          valid={
                            !fieldError("plant-address", draft) && Boolean(draft.plantAddress.trim())
                          }
                        >
                          <textarea
                            id="intake-plant-address-control"
                            value={draft.plantAddress}
                            maxLength={500}
                            required
                            rows={3}
                            disabled={draft.sameAddress}
                            onBlur={() => blurField("plant-address")}
                            onChange={(event) => patch({ plantAddress: event.target.value })}
                          />
                        </Field>
                        <Field
                          id="intake-plant-capacity"
                          label="ظرفیت نصب‌شده"
                          error={visibleError("plant-capacity")}
                          valid={
                            !fieldError("plant-capacity", draft) && Boolean(draft.capacity.trim())
                          }
                          popover={
                            <InfoPopover title="ظرفیت نصب‌شده">
                              ظرفیت نصب‌شده، اندازهٔ نیروگاه است؛ با میزان برق تولیدی فرق دارد.
                            </InfoPopover>
                          }
                        >
                          <div className="site-capacity">
                            <input
                              id="intake-plant-capacity-control"
                              dir="ltr"
                              inputMode="decimal"
                              value={draft.capacity}
                              required
                              pattern="[0-9۰-۹٠-٩]+([.٫][0-9۰-۹٠-٩]{1,3})?"
                              onBlur={() => blurField("plant-capacity")}
                              onChange={(event) =>
                                patch({
                                  capacity: normalizeCapacityInput(event.target.value),
                                  capacityAcked: false,
                                })
                              }
                            />
                            <span className="site-capacity__unit">کیلووات</span>
                          </div>
                        </Field>
                      </>
                    )}
                    {plants && (plants.next || plants.previous) ? (
                      <ContractPagination page={plantPage} {...plants} onChange={setPlantPage} />
                    ) : null}
                  </div>
                </>
              )}
            </section>

            <div className="site-sticky-actions">
              <div className="site-autosave" role="status">
                {savedAt
                  ? `ذخیره شد · لحظاتی پیش`
                  : intakeDraftIsDirty(draft)
                    ? "در حال آماده‌سازی ذخیره…"
                    : "پیش‌نویس فرم"}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (intakeDraftIsDirty(draft)) setLeaveOpen(true);
                    else router.push("/panel/contracts");
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit" disabled={inFlight.current}>
                  ادامه
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="site-intake-aside">
          <SiteDossier
            draft={draft}
            branch={selectedBranch}
            plant={selectedPlant}
            sectionsValid={{ branch: branchValid, plant: plantValid }}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void performSubmit();
        }}
        variant="info"
        title="ثبت انشعاب و نیروگاه"
        description="پیش از ارسال، خلاصه را بررسی کنید."
        confirmLabel="ثبت و ادامه"
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-foreground-muted">انشعاب</dt>
            <dd className="font-semibold">{branchSummary}</dd>
          </div>
          <div>
            <dt className="text-foreground-muted">نیروگاه</dt>
            <dd className="font-semibold">{plantSummary}</dd>
          </div>
        </dl>
        <ol className="site-timeline mt-4">
          <li>ثبت اطلاعات در سامانه</li>
          <li>بررسی شرکت</li>
          <li>ادامهٔ قرارداد پس از تأیید لازم</li>
        </ol>
      </ConfirmDialog>

      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false);
          router.push("/panel/contracts");
        }}
        variant="warning"
        title="تغییرات ذخیره‌نشده"
        description="با خروج، می‌توانید بعداً از پیش‌نویس محلی ادامه دهید."
        confirmLabel="خروج"
        cancelLabel="ماندن"
      />

      <Drawer
        open={Boolean(editRegistration)}
        onClose={() => setEditRegistration(undefined)}
        title={editRegistration?.kind === "branch" ? "اصلاح انشعاب" : "اصلاح نیروگاه"}
      >
        {editRegistration ? (
          <PlantRegistrationForm
            key={`${editRegistration.kind}:${editRegistration.item?.uuid ?? "x"}`}
            registration={editRegistration}
            branches={selectedBranch ? [selectedBranch] : (branches?.results ?? [])}
            onSaved={() => {
              setEditRegistration(undefined);
              resource.reload();
              toast({ tone: "success", title: "تغییرات ذخیره شد" });
            }}
            onClose={() => setEditRegistration(undefined)}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
