"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { type PlantOption } from "./contract-model";
import { SiteIntakeStep } from "./site-intake-step";
import { SiteReviewStep } from "./site-review-step";

/** 1 = انشعاب و نیروگاه، 2 = وضعیت بررسی */
export type SitePhase = 1 | 2;

type Props = {
  readonly phase: SitePhase;
  readonly onPhaseChange: (phase: SitePhase) => void;
  readonly onReady: (option: PlantOption) => void;
  /** Both already approved — skip review and mark it done. */
  readonly onSkipReview: (option: PlantOption) => void;
};

export function ContractSiteStage({
  phase,
  onPhaseChange,
  onReady,
  onSkipReview,
}: Props): ReactElement {
  const search = useSearchParams();
  const [selection, setSelection] = useState(() => ({
    branchId: search.get("branch") ?? "",
    plantId: search.get("plant") ?? "",
  }));
  const { branchId, plantId } = selection;

  function remember(next: PlantOption): void {
    setSelection({
      branchId: next.branch?.uuid ?? "",
      plantId: next.plant.uuid,
    });
    const params = new URLSearchParams(window.location.search);
    if (next.branch?.uuid) params.set("branch", next.branch.uuid);
    else params.delete("branch");
    params.set("plant", next.plant.uuid);
    window.history.replaceState(null, "", `/panel/contracts/new${params.size ? `?${params}` : ""}`);
  }

  if (phase === 1) {
    return (
      <SiteIntakeStep
        initialBranchId={branchId}
        initialPlantId={plantId}
        onContinueReview={(next) => {
          remember(next);
          onPhaseChange(2);
        }}
        onSkipToPlan={(next) => {
          remember(next);
          onSkipReview(next);
        }}
      />
    );
  }

  return (
    <SiteReviewStep
      branchId={branchId}
      plantId={plantId}
      onBack={() => onPhaseChange(1)}
      onReady={(option) => {
        remember(option);
        onReady(option);
      }}
    />
  );
}
