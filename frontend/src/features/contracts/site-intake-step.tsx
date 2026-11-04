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
  PlantSpecChoices,
  schemeTypeLabel,
  systemTypeLabel,
  type Branch,
  type Plant,
  type Registration,
  type SchemeType,
  type SystemType,
} from "@/features/plants";
import { isSchemeType, isSystemType } from "@/features/plants/plant-options";
import { latinDigits, plantError, saveBranch, savePlant } from "@/features/plants/plants-api";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { listOccupiedBranchIds } from "./contracts-api";
import { ContractError, ContractPagination } from "./contract-ui";
import { type PlantOption } from "./contract-model";
import { plantStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import {
  selectSiteIntakeAlerts,
  type SiteIntakeAlertActions,
} from "./site-intake-alerts";
import { clearIntakeDraft, intakeDraftIsDirty } from "./site-intake-draft";
import { SiteDossier } from "./site-dossier";
import {
  EMPTY_INTAKE_DRAFT,
  type SiteIntakeDraft,
  type SiteIntakeFieldId,
  type SiteIntakeSubmitIssue,
} from "./site-intake-types";
import {
  branchSectionValid,
  collectInvalidBranchFields,
  collectInvalidPlantFields,
  fieldError,
  normalizeBillIdInput,
  normalizeCapacityInput,
  plantSectionValid,
  plantsForBranch,
} from "./site-intake-validation";
import { type IntakePhase } from "./site-dossier";
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
      billId: branch.bill_id,
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
  const [inFlight, setInFlight] = useState(false);
  const [branchPage, setBranchPage] = useState(1);
  const [plantPage, setPlantPage] = useState(1);
  const [intakePhase, setIntakePhase] = useState<IntakePhase>(() =>
    initialBranchId || initialPlantId ? "plant" : "branch",
  );
  const [draft, setDraft] = useState<SiteIntakeDraft>(() => ({
    ...EMPTY_INTAKE_DRAFT,
    branchId: initialBranchId,
    plantId: initialPlantId,
    branchMode: initialBranchId ? "existing" : "new",
    plantMode: initialPlantId ? "existing" : "new",
  }));
  const [touched, setTouched] = useState<Partial<Record<SiteIntakeFieldId, boolean>>>({});
  const [submitIssue, setSubmitIssue] = useState<SiteIntakeSubmitIssue>({ kind: "none" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [editRegistration, setEditRegistration] = useState<Registration>();
  const [online, setOnline] = useState(true);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const [branches, plants, occupiedBranchIds] = await Promise.all([
        getBranches(branchPage, signal),
        getPlants(plantPage, signal),
        listOccupiedBranchIds(signal),
      ]);
      return { branches, plants, occupiedBranchIds };
    },
    [branchPage, plantPage],
  );
  const resource = useContractResource(`site-intake:${branchPage}:${plantPage}`, load);

  useEffect(() => {
    // Drop any leftover local autosave from older builds; save is explicit only.
    clearIntakeDraft();
  }, []);

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
    queueMicrotask(() => setOnline(navigator.onLine));
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
  const occupiedBranchIds =
    resource.state.status === "ready" ? resource.state.data.occupiedBranchIds : new Set<string>();
  const validationContext = { occupiedBranchIds };

  useEffect(() => {
    if (!branches || draft.branchId) return;
    const available = branches.results.filter((item) => !occupiedBranchIds.has(item.uuid));
    if (available.length === 0 && branches.results.length > 0 && draft.branchMode === "existing") {
      queueMicrotask(() => setDraft((prev) => ({ ...prev, branchMode: "new" })));
      return;
    }
    if (available.length === 1) {
      const only = available[0]!;
      queueMicrotask(() =>
        setDraft((prev) => ({ ...prev, branchMode: "existing", branchId: only.uuid })),
      );
      return;
    }
    if (available.length > 0 && !initialBranchId && draft.branchMode === "new" && !draft.branchName) {
      queueMicrotask(() => setDraft((prev) => ({ ...prev, branchMode: "existing" })));
    }
  }, [branches, draft.branchId, draft.branchMode, draft.branchName, initialBranchId, occupiedBranchIds]);

  useEffect(() => {
    if (!draft.branchId || !occupiedBranchIds.has(draft.branchId)) return;
    if (draft.createdBranchId === draft.branchId) return;
    queueMicrotask(() => {
      setDraft((prev) => {
        if (!prev.branchId || !occupiedBranchIds.has(prev.branchId)) return prev;
        if (prev.createdBranchId === prev.branchId) return prev;
        return { ...prev, branchId: "", plantId: "", plantMode: "new" };
      });
      const params = new URLSearchParams(window.location.search);
      params.delete("branch");
      params.delete("plant");
      window.history.replaceState(null, "", `/panel/contracts/new${params.size ? `?${params}` : ""}`);
    });
  }, [draft.branchId, draft.createdBranchId, occupiedBranchIds]);

  const selectedBranch =
    branches?.results.find((item) => item.uuid === draft.branchId) ??
    (draft.createdBranchId
      ? branches?.results.find((item) => item.uuid === draft.createdBranchId)
      : undefined);
  const matchingPlants = plantsForBranch(plants?.results ?? [], draft.branchId || draft.createdBranchId);
  const selectedPlant =
    matchingPlants.find((item) => item.uuid === draft.plantId) ??
    plants?.results.find((item) => item.uuid === draft.plantId);

  const branchValid = branchSectionValid(draft, validationContext);
  const plantValid = plantSectionValid(draft);
  const phaseValid = intakePhase === "branch" ? branchValid : plantValid;
  const branchCtaLabel =
    draft.branchMode === "new" && !draft.createdBranchId ? "ثبت انشعاب و ادامه" : "ادامه به نیروگاه";
  const plantCtaLabel =
    draft.plantMode === "existing" ? "تأیید و ادامه" : "ثبت نیروگاه و ادامه";
  const primaryCtaLabel = intakePhase === "branch" ? branchCtaLabel : plantCtaLabel;

  function patch(next: Partial<SiteIntakeDraft>): void {
    setDraft((prev) => {
      const merged = { ...prev, ...next };
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
      if (occupiedBranchIds.has(branchId)) return;
      patch({ branchMode: "existing", branchId, plantId: "", plantMode: "new" });
    },
    editBranch: () => {
      if (selectedBranch) setEditRegistration({ kind: "branch", item: selectedBranch });
    },
    editPlant: () => {
      if (selectedPlant) setEditRegistration({ kind: "plant", item: selectedPlant });
    },
    pickAnotherBranch: () => {
      patch({ branchId: "", plantId: "", plantMode: "new" });
      syncUrl("", "");
    },
    pickAnotherPlant: () => {
      patch({ plantId: "" });
    },
    ackCapacity: () => patch({ capacityAcked: true }),
    resetDraft: () => {
      clearIntakeDraft();
      setDraft({
        ...EMPTY_INTAKE_DRAFT,
        branchMode: (branches?.results.length ?? 0) > 0 ? "existing" : "new",
      });
      setIntakePhase("branch");
      setDismissedBanners((prev) => new Set([...prev, "draft.restored"]));
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
      occupiedBranchIds,
      selectedBranch,
      selectedPlant,
      submitIssue,
      draftRestored: false,
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
    return fieldError(field, draft, validationContext);
  }

  function showValidation(invalid: readonly SiteIntakeFieldId[]): void {
    setSubmitIssue({ kind: "validation", fields: [...invalid] });
    setTouched(Object.fromEntries(invalid.map((field) => [field, true])));
    setConfirmOpen(false);
    queueMicrotask(() => {
      summaryRef.current?.focus();
      document.getElementById(`intake-${invalid[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function advanceFromBranch(): Promise<void> {
    if (inFlight) return;
    const invalid = collectInvalidBranchFields(draft, validationContext);
    if (invalid.length) {
      showValidation(invalid);
      return;
    }

    if (draft.branchMode === "existing" || draft.createdBranchId) {
      const branchId = draft.createdBranchId || draft.branchId;
      if (!branchId) return;
      if (occupiedBranchIds.has(branchId) && draft.createdBranchId !== branchId) {
        showValidation(["branch-select"]);
        return;
      }
      setConfirmOpen(false);
      syncUrl(branchId, draft.plantId);
      setIntakePhase("plant");
      queueMicrotask(() => plantSectionRef.current?.focus());
      return;
    }

    setInFlight(true);
    setSubmitIssue({ kind: "none" });
    try {
      const branch = await saveBranch({
        name: draft.branchName.trim(),
        address: draft.branchAddress.trim(),
        bill_id: latinDigits(draft.billId.trim()),
      });
      patch({
        createdBranchId: branch.uuid,
        branchId: branch.uuid,
        branchMode: "existing",
      });
      syncUrl(branch.uuid, "");
      toast({ tone: "success", title: "انشعاب ثبت شد؛ حالا نیروگاه را تعریف کنید" });
      setConfirmOpen(false);
      resource.reload();
      setIntakePhase("plant");
      queueMicrotask(() => plantSectionRef.current?.focus());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSubmitIssue({ kind: "session" });
      } else if (error instanceof ApiError && error.fields.bill_id) {
        setSubmitIssue({ kind: "conflict" });
      } else if (error instanceof ApiError && (error.status === 0 || error.code === "network")) {
        setSubmitIssue({ kind: "network" });
      } else {
        setSubmitIssue({ kind: "generic", message: plantError(error) });
      }
      setConfirmOpen(false);
      queueMicrotask(() => summaryRef.current?.focus());
    } finally {
      setInFlight(false);
    }
  }

  async function performPlantSubmit(): Promise<void> {
    if (inFlight) return;
    const invalid = collectInvalidPlantFields(draft);
    if (invalid.length) {
      showValidation(invalid);
      return;
    }

    if (draft.branchMode === "existing" && draft.plantMode === "existing") {
      if (!selectedBranch || !selectedPlant) return;
      if (occupiedBranchIds.has(selectedBranch.uuid)) {
        showValidation(["branch-select"]);
        setIntakePhase("branch");
        return;
      }
      setConfirmOpen(false);
      clearIntakeDraft();
      syncUrl(selectedBranch.uuid, selectedPlant.uuid);
      if (selectedBranch.status === "active" && selectedPlant.status === "active") {
        onSkipToPlan(contractOption(selectedPlant, selectedBranch));
      } else {
        onContinueReview(contractOption(selectedPlant, selectedBranch));
      }
      return;
    }

    setInFlight(true);
    setSubmitIssue({ kind: "none" });
    try {
      let branch = selectedBranch;
      const branchId = draft.createdBranchId || draft.branchId;
      if (!branchId) throw new ApiError("انشعاب مشخص نیست.", 400, "invalid", {});

      let plant = selectedPlant;
      if (draft.plantMode === "new" && !draft.createdPlantId) {
        if (!isSchemeType(draft.schemeType) || !isSystemType(draft.systemType)) {
          throw new ApiError("مشخصات طرح نیروگاه ناقص است.", 400, "invalid", {});
        }
        plant = await savePlant({
          branch_uuid: branchId,
          capacity_kwp: latinDigits(draft.capacity.trim()).replace("٫", "."),
          scheme_type: draft.schemeType,
          system_type: draft.systemType,
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
      toast({ tone: "success", title: "نیروگاه ثبت شد و برای بررسی ارسال شد" });
      setConfirmOpen(false);
      resource.reload();
      onContinueReview(contractOption(plant, branch));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSubmitIssue({ kind: "session" });
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
      setInFlight(false);
    }
  }

  function requestPrimaryAction(): void {
    if (!phaseValid) {
      const invalid =
        intakePhase === "branch"
          ? collectInvalidBranchFields(draft, validationContext)
          : collectInvalidPlantFields(draft);
      showValidation(invalid);
      return;
    }
    if (intakePhase === "branch" && (draft.branchMode === "existing" || draft.createdBranchId)) {
      void advanceFromBranch();
      return;
    }
    setConfirmOpen(true);
  }

  function onFormKeyDown(event: KeyboardEvent<HTMLFormElement>): void {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      requestPrimaryAction();
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

  const listedBranchCount = branches?.results.length ?? 0;
  const availableBranchCount = branches
    ? branches.results.filter((item) => !occupiedBranchIds.has(item.uuid)).length
    : 0;
  const branchCount = listedBranchCount;

  const branchSummary =
    draft.branchMode === "existing" && selectedBranch
      ? `${selectedBranch.name} · ${selectedBranch.bill_id}`
      : [draft.branchName, draft.billId].filter(Boolean).join(" · ") || "انشعاب";

  const plantSummary =
    draft.plantMode === "existing" && selectedPlant
      ? [
          selectedPlant.name,
          `${selectedPlant.capacity_kwp} کیلووات`,
          schemeTypeLabel(selectedPlant.scheme_type),
          systemTypeLabel(selectedPlant.system_type),
        ].join(" · ")
      : [
          draft.capacity ? `${draft.capacity} کیلووات` : "",
          draft.schemeType ? schemeTypeLabel(draft.schemeType) : "",
          draft.systemType ? systemTypeLabel(draft.systemType) : "",
        ]
          .filter(Boolean)
          .join(" · ") || "نیروگاه";

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

      <SiteDossier
        draft={draft}
        branch={selectedBranch}
        plant={selectedPlant}
        phase={intakePhase}
        sectionsValid={{ branch: branchValid, plant: plantValid }}
      />

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
                ? "محتوای فرم هنوز روی صفحه است؛ دوباره ذخیره را بزنید."
                : submitIssue.kind === "partial"
                  ? "اطلاعات انشعاب ذخیره شده است. فقط ثبت نیروگاه را دوباره امتحان کنید."
                  : submitIssue.kind === "session"
                    ? "پس از ورود دوباره، همین فرم را دوباره ذخیره کنید."
                    : submitIssue.kind === "generic"
                      ? submitIssue.message
                      : undefined
            }
            items={
              submitIssue.kind === "validation"
                ? submitIssue.fields.map((field) => ({
                    label:
                      field === "branch-bill"
                        ? "شناسه قبض"
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
              requestPrimaryAction();
            }}
            onKeyDown={onFormKeyDown}
          >
            <section
              ref={plantSectionRef}
              className="site-section-card"
              tabIndex={-1}
              aria-labelledby={`${formId}-site-title`}
            >
              <div className="site-section-card__head">
                <h3 id={`${formId}-site-title`} className="site-section-card__title">
                  <span className="site-section-card__index">
                    {faNumber(intakePhase === "branch" ? 1 : 2)}
                  </span>
                  {intakePhase === "branch" ? "ثبت انشعاب" : "ثبت نیروگاه"}
                </h3>
              </div>
              <div className="site-section-card__body">
                <p className="site-field__hint" style={{ margin: 0 }}>
                  {intakePhase === "branch"
                    ? "اول انشعاب را انتخاب یا ثبت کنید؛ ثبت نیروگاه در مرحلهٔ بعد انجام می‌شود."
                    : "نیروگاه را روی انشعاب انتخاب‌شده تعریف کنید."}
                </p>

                {intakePhase === "branch" ? (
                <div className="site-field-group" aria-labelledby={`${formId}-branch-title`}>
                  <h4 id={`${formId}-branch-title`} className="site-field-group__title">
                    انشعاب
                  </h4>
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
                        badge: faNumber(availableBranchCount),
                        disabled: branchCount === 0,
                        title:
                          branchCount === 0
                            ? "هنوز انشعابی ثبت نکرده‌اید"
                            : availableBranchCount === 0
                              ? "همهٔ انشعاب‌ها در قرارداد دیگری هستند"
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
                          const occupied = occupiedBranchIds.has(entry.uuid);
                          return (
                            <label
                              key={entry.uuid}
                              className="site-select-card"
                              data-selected={!occupied && draft.branchId === entry.uuid}
                              data-disabled={occupied ? "true" : undefined}
                              title={
                                occupied
                                  ? "این انشعاب در قرارداد دیگری استفاده شده است"
                                  : undefined
                              }
                            >
                              <input
                                type="radio"
                                name="intake-branch"
                                checked={!occupied && draft.branchId === entry.uuid}
                                disabled={occupied}
                                onChange={() => {
                                  if (occupied) return;
                                  patch({
                                    branchId: entry.uuid,
                                    plantId: "",
                                    plantMode: "new",
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
                                  شناسه قبض: <bdi dir="ltr">{entry.bill_id}</bdi>
                                </span>
                                <span>{entry.address}</span>
                                {occupied ? (
                                  <span className="site-select-card__note">
                                    در قرارداد دیگری استفاده شده
                                  </span>
                                ) : null}
                              </span>
                              <span className="site-select-card__end">
                                <StatusPill
                                  status={occupied ? "closed" : meta.tone}
                                  label={occupied ? "در قرارداد دیگر" : meta.label}
                                />
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
                        id="intake-branch-bill"
                        label="شناسه قبض"
                        error={visibleError("branch-bill")}
                        valid={!fieldError("branch-bill", draft) && Boolean(draft.billId.trim())}
                        popover={
                          <InfoPopover title="شناسه قبض کجاست؟">
                            همان شناسه‌ای را وارد کنید که روی قبض برق چاپ شده است (شناسه قبض).
                          </InfoPopover>
                        }
                      >
                        <input
                          id="intake-branch-bill-control"
                          dir="ltr"
                          inputMode="numeric"
                          value={draft.billId}
                          maxLength={64}
                          required
                          onBlur={() => blurField("branch-bill")}
                          onPaste={(event) => {
                            event.preventDefault();
                            const text = event.clipboardData.getData("text");
                            patch({ billId: normalizeBillIdInput(text) });
                          }}
                          onChange={(event) =>
                            patch({ billId: normalizeBillIdInput(event.target.value) })
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
                ) : (
                <div className="site-field-group" aria-labelledby={`${formId}-plant-title`}>
                  <div className="site-branch-summary">
                    <div>
                      <p className="site-field-group__title">انشعاب این نیروگاه</p>
                      <p className="site-field__hint" style={{ margin: 0 }}>
                        {branchSummary}
                      </p>
                    </div>
                  </div>
                  <h4 id={`${formId}-plant-title`} className="site-field-group__title">
                    نیروگاه
                  </h4>
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
                                  <bdi dir="ltr">{entry.capacity_kwp}</bdi> کیلووات ·{" "}
                                  {schemeTypeLabel(entry.scheme_type)} ·{" "}
                                  {systemTypeLabel(entry.system_type)}
                                </span>
                                {entry.address ? <span>{entry.address}</span> : null}
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
                      <div id="intake-plant-scheme">
                        <PlantSpecChoices
                          idPrefix={`${formId}-plant`}
                          schemeType={draft.schemeType}
                          systemType={draft.systemType}
                          onSchemeChange={(value: SchemeType) => {
                            patch({ schemeType: value });
                            blurField("plant-scheme");
                          }}
                          onSystemChange={(value: SystemType) => {
                            patch({ systemType: value });
                            blurField("plant-system");
                          }}
                          schemeError={visibleError("plant-scheme")}
                          systemError={visibleError("plant-system")}
                          schemeValid={isSchemeType(draft.schemeType)}
                          systemValid={isSystemType(draft.systemType)}
                          disabled={inFlight}
                        />
                      </div>
                      <span id="intake-plant-system" className="sr-only" />

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
                          <span className="site-capacity__unit">kWp</span>
                        </div>
                      </Field>
                    </>
                  )}
                  {plants && (plants.next || plants.previous) ? (
                    <ContractPagination page={plantPage} {...plants} onChange={setPlantPage} />
                  ) : null}
                </div>
                )}
              </div>
            </section>

            <div className="site-sticky-actions">
              <div className="site-autosave" role="status">
                {intakePhase === "branch"
                  ? "مرحلهٔ ۱ از ۲ — اول انشعاب، بعد نیروگاه"
                  : "مرحلهٔ ۲ از ۲ — ثبت نیروگاه روی انشعاب انتخاب‌شده"}
              </div>
              <div className="site-sticky-actions__buttons">
                {intakePhase === "plant" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={inFlight}
                    onClick={() => {
                      setIntakePhase("branch");
                      setSubmitIssue({ kind: "none" });
                    }}
                  >
                    بازگشت به انشعاب
                  </Button>
                ) : (
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
                )}
                <Button type="submit" disabled={inFlight} className="site-sticky-actions__primary">
                  {primaryCtaLabel}
                </Button>
              </div>
            </div>
          </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (intakePhase === "branch") void advanceFromBranch();
          else void performPlantSubmit();
        }}
        variant="info"
        title={intakePhase === "branch" ? "ثبت انشعاب" : "ثبت نیروگاه"}
        description="پیش از ارسال، خلاصه را بررسی کنید."
        confirmLabel="ثبت و ادامه"
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-foreground-muted">انشعاب</dt>
            <dd className="font-semibold">{branchSummary}</dd>
          </div>
          {intakePhase === "plant" ? (
            <div>
              <dt className="text-foreground-muted">نیروگاه</dt>
              <dd className="font-semibold">{plantSummary}</dd>
            </div>
          ) : null}
        </dl>
        <ol className="site-timeline mt-4">
          {intakePhase === "branch" ? (
            <>
              <li>ثبت انشعاب در سامانه</li>
              <li>تعریف نیروگاه در مرحلهٔ بعد</li>
              <li>بررسی شرکت</li>
            </>
          ) : (
            <>
              <li>ثبت نیروگاه در سامانه</li>
              <li>بررسی شرکت</li>
              <li>ادامهٔ قرارداد پس از تأیید لازم</li>
            </>
          )}
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
        description="با خروج، اطلاعات واردشده در این فرم ذخیره نمی‌شود."
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
