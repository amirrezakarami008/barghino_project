"use client";

import type { ReactElement } from "react";
import { StatusPill } from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { plantStatusMeta } from "./status-map";
import { intakeCompleteness, type Completeness } from "./site-intake-validation";
import type { SiteIntakeDraft } from "./site-intake-types";
import type { Branch, Plant } from "@/features/plants";

type Props = {
  readonly draft: SiteIntakeDraft;
  readonly branch?: Branch;
  readonly plant?: Plant;
  readonly sectionsValid: { readonly branch: boolean; readonly plant: boolean };
  readonly compact?: boolean;
};

function Ring({ value }: { readonly value: Completeness }): ReactElement {
  const pct = value.total === 0 ? 0 : Math.round((value.filled / value.total) * 100);
  return (
    <div className="site-dossier-ring" style={{ ["--pct" as string]: pct }} aria-hidden>
      <span>
        {faNumber(value.filled)}/{faNumber(value.total)}
      </span>
    </div>
  );
}

function Line({ value, fallback }: { readonly value: string; readonly fallback?: boolean }): ReactElement {
  if (!value.trim()) return <span className="site-dossier-skel" aria-hidden />;
  return <span className="site-dossier-line">{fallback ? value : value}</span>;
}

export function SiteDossier({ draft, branch, plant, sectionsValid, compact = false }: Props): ReactElement {
  const completeness = intakeCompleteness(draft);
  const branchName =
    draft.branchMode === "existing" ? (branch?.name ?? "") : draft.branchName;
  const meter =
    draft.branchMode === "existing" ? (branch?.meter_number ?? "") : draft.meter;
  const branchAddress =
    draft.branchMode === "existing" ? (branch?.address ?? "") : draft.branchAddress;
  const plantName = draft.plantMode === "existing" ? (plant?.name ?? "") : draft.plantName;
  const plantAddress =
    draft.plantMode === "existing" ? (plant?.address ?? "") : draft.plantAddress;
  const capacity =
    draft.plantMode === "existing" ? (plant?.capacity_kwp ?? "") : draft.capacity;
  const branchStatus = branch?.status;
  const plantStatus = plant?.status;
  const linked = sectionsValid.branch && sectionsValid.plant;

  return (
    <aside className="site-dossier" aria-label="خلاصه پرونده انشعاب و نیروگاه">
      <div className="flex items-center justify-between gap-3">
        <h3 className="site-dossier__title">پرونده</h3>
        <Ring value={completeness} />
      </div>

      <article className="site-dossier-node">
        <span className="site-dossier-node__icon" aria-hidden>
          <Icon name="home" className="size-5" />
        </span>
        <div className="site-dossier-node__body">
          <strong>{branchName.trim() || "انشعاب"}</strong>
          <Line value={meter ? `کنتور ${meter}` : ""} />
          {!compact ? <Line value={branchAddress} /> : null}
          <StatusPill
            status={branchStatus ? plantStatusMeta(branchStatus).tone : "draft"}
            label={
              branchStatus ? plantStatusMeta(branchStatus).label : "پیش‌نویس فرم"
            }
          />
        </div>
      </article>

      <div className="site-dossier-connector" data-complete={linked}>
        <div className="site-dossier-connector__line" />
        <span className="site-dossier-connector__label">
          {linked ? "متصل" : "در انتظار تکمیل"}
        </span>
      </div>

      <article className="site-dossier-node">
        <span className="site-dossier-node__icon" aria-hidden>
          <Icon name="solarPanel" className="size-5" />
        </span>
        <div className="site-dossier-node__body">
          <strong>{plantName.trim() || "نیروگاه"}</strong>
          <Line value={capacity ? `${capacity} کیلووات` : ""} />
          {!compact ? <Line value={plantAddress} /> : null}
          <StatusPill
            status={plantStatus ? plantStatusMeta(plantStatus).tone : "draft"}
            label={plantStatus ? plantStatusMeta(plantStatus).label : "پیش‌نویس فرم"}
          />
        </div>
      </article>
    </aside>
  );
}
