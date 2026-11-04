"use client";

import type { ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import { faNumber } from "@/shared/lib/fa";
import { intakeCompleteness } from "./site-intake-validation";
import type { SiteIntakeDraft } from "./site-intake-types";
import type { Branch, Plant } from "@/features/plants";

export type IntakePhase = "branch" | "plant";

type Props = {
  readonly draft: SiteIntakeDraft;
  readonly branch?: Branch;
  readonly plant?: Plant;
  readonly sectionsValid: { readonly branch: boolean; readonly plant: boolean };
  readonly phase: IntakePhase;
  readonly compact?: boolean;
};

/**
 * Lightweight progress strip for sequential branch → plant intake.
 */
export function SiteDossier({ draft, sectionsValid, phase }: Props): ReactElement {
  const completeness = intakeCompleteness(draft);
  const branchLabel =
    draft.branchMode === "existing"
      ? "انشعاب انتخاب‌شده"
      : draft.branchName.trim() || "انشعاب";
  const plantLabel =
    draft.plantMode === "existing"
      ? "نیروگاه انتخاب‌شده"
      : draft.capacity.trim()
        ? `${draft.capacity} kWp`
        : "نیروگاه";

  return (
    <aside className="site-progress" aria-label="پیشرفت ثبت انشعاب و نیروگاه">
      <div className="site-progress__meta">
        <p className="site-progress__title">ثبت انشعاب و نیروگاه</p>
        <p className="site-progress__count" role="status">
          {faNumber(completeness.filled)} از {faNumber(completeness.total)} فیلد
        </p>
      </div>
      <ol className="site-progress__steps">
        <li
          className={cn(
            "site-progress__step",
            sectionsValid.branch && "site-progress__step--done",
            phase === "branch" && "site-progress__step--current",
          )}
        >
          <span className="site-progress__index" aria-hidden>
            {sectionsValid.branch ? <Icon name="check" className="size-3.5" /> : faNumber(1)}
          </span>
          <span className="site-progress__body">
            <strong>۱. انشعاب</strong>
            <span>
              {sectionsValid.branch
                ? branchLabel
                : "ابتدا انشعاب را انتخاب یا ثبت کنید"}
            </span>
          </span>
          <span className="site-progress__glyph" aria-hidden>
            <Icon name="home" className="size-4" />
          </span>
        </li>
        <li
          className={cn(
            "site-progress__step",
            sectionsValid.plant && "site-progress__step--done",
            phase === "plant" && "site-progress__step--current",
          )}
        >
          <span className="site-progress__index" aria-hidden>
            {sectionsValid.plant ? <Icon name="check" className="size-3.5" /> : faNumber(2)}
          </span>
          <span className="site-progress__body">
            <strong>۲. نیروگاه</strong>
            <span>
              {phase === "branch"
                ? "پس از انشعاب فعال می‌شود"
                : sectionsValid.plant
                  ? plantLabel
                  : "نیروگاه را روی انشعاب انتخاب‌شده تعریف کنید"}
            </span>
          </span>
          <span className="site-progress__glyph" aria-hidden>
            <Icon name="solarPanel" className="size-4" />
          </span>
        </li>
      </ol>
    </aside>
  );
}
