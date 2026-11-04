"use client";

import type { ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import {
  SCHEME_OPTIONS,
  SYSTEM_OPTIONS,
  type SchemeType,
  type SystemType,
} from "./plant-options";
import "./plants.css";

type Props = {
  readonly schemeType: SchemeType | "";
  readonly systemType: SystemType | "";
  readonly onSchemeChange: (value: SchemeType) => void;
  readonly onSystemChange: (value: SystemType) => void;
  readonly schemeError?: string;
  readonly systemError?: string;
  readonly schemeValid?: boolean;
  readonly systemValid?: boolean;
  readonly disabled?: boolean;
  readonly idPrefix?: string;
};

export function PlantSpecChoices({
  schemeType,
  systemType,
  onSchemeChange,
  onSystemChange,
  schemeError,
  systemError,
  schemeValid,
  systemValid,
  disabled = false,
  idPrefix = "plant-spec",
}: Props): ReactElement {
  return (
    <div className="plant-spec">
      <fieldset
        className="plant-spec__group"
        disabled={disabled}
        aria-invalid={schemeError ? true : undefined}
        aria-describedby={schemeError ? `${idPrefix}-scheme-error` : undefined}
      >
        <legend className="plant-spec__legend">
          <span>کاربری طرح</span>
          {schemeValid && !schemeError ? (
            <span className="plant-spec__ok" aria-hidden>
              <Icon name="check" className="size-3.5" />
            </span>
          ) : null}
        </legend>
        <p className="plant-spec__hint">نوع محل نصب نیروگاه را مشخص کنید.</p>
        <div className="plant-choice-grid" role="radiogroup" aria-label="کاربری طرح">
          {SCHEME_OPTIONS.map((option) => {
            const selected = schemeType === option.value;
            return (
              <label
                key={option.value}
                className={cn("plant-choice", selected && "is-selected")}
                data-selected={selected || undefined}
              >
                <input
                  type="radio"
                  name={`${idPrefix}-scheme`}
                  value={option.value}
                  checked={selected}
                  onChange={() => onSchemeChange(option.value)}
                />
                <span className="plant-choice__icon" aria-hidden>
                  <Icon name={option.icon} className="size-5" />
                </span>
                <span className="plant-choice__copy">
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </span>
                <span className="plant-choice__check" aria-hidden>
                  <Icon name="check" className="size-3.5" />
                </span>
              </label>
            );
          })}
        </div>
        {schemeError ? (
          <p id={`${idPrefix}-scheme-error`} className="plant-spec__error" role="alert">
            {schemeError}
          </p>
        ) : null}
      </fieldset>

      <fieldset
        className="plant-spec__group"
        disabled={disabled}
        aria-invalid={systemError ? true : undefined}
        aria-describedby={systemError ? `${idPrefix}-system-error` : undefined}
      >
        <legend className="plant-spec__legend">
          <span>اتصال به شبکه</span>
          {systemValid && !systemError ? (
            <span className="plant-spec__ok" aria-hidden>
              <Icon name="check" className="size-3.5" />
            </span>
          ) : null}
        </legend>
        <p className="plant-spec__hint">نحوهٔ اتصال سامانه خورشیدی به برق سراسری.</p>
        <div className="plant-choice-grid" role="radiogroup" aria-label="اتصال به شبکه">
          {SYSTEM_OPTIONS.map((option) => {
            const selected = systemType === option.value;
            return (
              <label
                key={option.value}
                className={cn("plant-choice", selected && "is-selected")}
                data-selected={selected || undefined}
              >
                <input
                  type="radio"
                  name={`${idPrefix}-system`}
                  value={option.value}
                  checked={selected}
                  onChange={() => onSystemChange(option.value)}
                />
                <span className="plant-choice__icon" aria-hidden>
                  <Icon name={option.icon} className="size-5" />
                </span>
                <span className="plant-choice__copy">
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </span>
                <span className="plant-choice__check" aria-hidden>
                  <Icon name="check" className="size-3.5" />
                </span>
              </label>
            );
          })}
        </div>
        {systemError ? (
          <p id={`${idPrefix}-system-error`} className="plant-spec__error" role="alert">
            {systemError}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
