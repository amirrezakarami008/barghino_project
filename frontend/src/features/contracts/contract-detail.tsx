"use client";

import { useCallback, useEffect, type ReactElement } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { getContract } from "./contracts-api";
import { formatDecimal, signedSnapshot, type Contract, type Identity } from "./contract-model";
import { ContractDate, ContractError, ContractStatus, statusInfo } from "./contract-ui";
import { useContractResource } from "./use-contract-resource";
import { ContractSignature } from "./contract-signature";
import { SignaturePreview } from "./signature-preview";
import { IdentityNotice } from "./identity-notice";
import "./contracts.css";

export function ContractDetail(): ReactElement {
  const { uuid } = useParams<{ uuid: string }>();
  const load = useCallback((signal: AbortSignal) => getContract(uuid, signal), [uuid]);
  const { state, reload, replaceData, refreshing, refreshError } = useContractResource(`contract:${uuid}`, load);
  useEffect(() => {
    function visible(): void {
      if (document.visibilityState === "visible") reload();
    }
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [reload]);

  return (
    <div className="contracts-feature">
      <WorkspacePage title="جزئیات قرارداد" icon="file" lede="مشخصات، شرایط ذخیره‌شده و روند بررسی این نسخه را ببینید.">
        <div className="contract-detail-toolbar">
          <Link href="/panel/contracts" className="contract-back">
            <Icon name="arrow" className="size-4" />
            بازگشت به قراردادها
          </Link>
          <Button variant="secondary" disabled={refreshing} onClick={reload}>
            {refreshing ? "در حال دریافت…" : "تازه‌سازی وضعیت"}
          </Button>
        </div>
        {refreshError ? (
          <ContractError message={`اطلاعات تازه نشد؛ آخرین دادهٔ دریافت‌شده را می‌بینید. ${refreshError}`} retry={reload} />
        ) : null}
        {state.status === "loading" ? (
          <LoadingCards label="دریافت جزئیات قرارداد…" />
        ) : state.status === "error" ? (
          <ContractError message={state.message} retry={reload} />
        ) : (
          <ContractContents key={state.data.uuid} contract={state.data} onServerChange={replaceData} />
        )}
      </WorkspacePage>
    </div>
  );
}

function ContractContents({ contract, onServerChange }: { readonly contract: Contract; readonly onServerChange: (contract: Contract) => void }): ReactElement {
  const snapshot = signedSnapshot(contract);
  const hasSignedEvidence = Boolean(contract.signedAt || contract.history.some((event) => event.type === "signed"));
  const seller = snapshot?.seller ?? contract.seller;
  const plant = snapshot?.plant ?? { name: contract.plantName, uuid: contract.plantUuid, capacity: contract.capacity };
  const branch = snapshot?.branch ?? { meter: contract.meter, uuid: contract.branchUuid, address: contract.address };
  const terms = snapshot?.terms ?? { planName: contract.planName, rate: contract.rate, commitment: contract.commitment };
  const signedEvent = contract.history.find((event) => event.type === "signed");
  const version = signedEvent?.termsVersion || contract.termsVersion;
  const hash = signedEvent?.termsHash || contract.termsHash;
  const info = statusInfo(contract.status);
  const plantSuffix = hasSignedEvidence && !snapshot ? " · اطلاعات فعلی" : "";
  const sellerHeading = `فروشنده${plantSuffix}`;

  return (
    <>
      <section className={`contract-detail-banner contract-tone-${info.tone}`}>
        <div className="contract-masthead-copy">
          <div className="contract-masthead-meta">
            <ContractStatus status={contract.status} />
            <span className="contract-masthead-plan">{terms.planName || "پلن ثبت نشده"}</span>
          </div>
          <h2>{plant.name || "قرارداد فروش برق"}</h2>
          <p>{info.next}</p>
          <span className="contract-document-id">
            شناسهٔ قرارداد <bdi dir="ltr">{contract.uuid}</bdi>
          </span>
        </div>
        <div className="contract-masthead-finance" aria-label="شرایط مالی">
          <div>
            <span>نرخ خرید</span>
            <strong>
              <bdi dir="ltr">{formatDecimal(terms.rate)}</bdi>
            </strong>
            <small>تومان / kWh</small>
          </div>
          <div>
            <span>تعهد انرژی</span>
            <strong>
              <bdi dir="ltr">{formatDecimal(terms.commitment)}</bdi>
            </strong>
            <small>kWh</small>
          </div>
        </div>
      </section>

      {contract.status === "cancelled" ? (
        <div className="contract-feedback contract-feedback-error">
          <Icon name="close" className="size-5" />
          <div>
            <h3>{contract.reviewDecision === "rejected" ? "دلیل رد شرکت" : "این نسخه بسته شده است"}</h3>
            <p>{contract.reviewNote || contract.history.find((event) => event.type === "rejected")?.reason || "دلیلی در اطلاعات دریافتی ثبت نشده است."}</p>
            <p>
              زمان بررسی: <ContractDate value={contract.reviewedAt} />
            </p>
            <ButtonLink href="/panel/contracts/new" variant="secondary" className="mt-3">
              ساخت پیش‌نویس جدید
            </ButtonLink>
          </div>
        </div>
      ) : null}

      <div className="contract-details-grid">
        <div className="contract-dossier">
          <section className="contract-document-sheet" aria-labelledby="contract-record-heading">
            <div className="contract-section-heading">
              <span>
                <Icon name="shield" />
              </span>
              <div>
                <h2 id="contract-record-heading">{snapshot ? "مشخصات ثبت‌شده هنگام امضا" : "مشخصات قرارداد"}</h2>
                <p>
                  {snapshot
                    ? "این اطلاعات از snapshot رویداد امضا خوانده شده‌اند."
                    : hasSignedEvidence
                      ? "snapshot کامل امضا در دسترس نیست؛ مشخصات زنده را به‌جای نسخهٔ امضاشده در نظر نگیرید."
                      : "اطلاعات نیروگاه و هویت تا پیش از امضا ممکن است تغییر کنند."}
                </p>
              </div>
            </div>

            <div className="contract-financial-terms">
              <div>
                <span>نرخ خرید هر کیلووات‌ساعت</span>
                <strong>
                  <bdi dir="ltr">{formatDecimal(terms.rate)}</bdi> <small>تومان</small>
                </strong>
              </div>
              <div>
                <span>تعهد انرژی</span>
                <strong>
                  <bdi dir="ltr">{formatDecimal(terms.commitment)}</bdi>{" "}
                  <small>
                    <bdi dir="ltr">kWh</bdi>
                  </small>
                </strong>
              </div>
            </div>

            <h3 className="contract-subheading">نیروگاه و انشعاب{plantSuffix}</h3>
            <dl className="contract-spec-board">
              <div>
                <dt>پلن</dt>
                <dd>{terms.planName || "ثبت نشده"}</dd>
              </div>
              <div>
                <dt>ظرفیت نیروگاه</dt>
                <dd>
                  <bdi dir="ltr">{formatDecimal(plant.capacity)}</bdi> <bdi dir="ltr">kWp</bdi>
                </dd>
              </div>
              <div>
                <dt>نیروگاه</dt>
                <dd>{plant.name || "ثبت نشده"}</dd>
              </div>
              <div>
                <dt>شماره کنتور</dt>
                <dd>
                  <bdi dir="ltr">{branch.meter || "ثبت نشده"}</bdi>
                </dd>
              </div>
              <div className="contract-spec-wide">
                <dt>نشانی انشعاب</dt>
                <dd>{branch.address || "ثبت نشده"}</dd>
              </div>
            </dl>

            <h3 className="contract-subheading">{sellerHeading}</h3>
            <SellerIdentity value={seller} />

            {hasSignedEvidence ? (
              <div className="contract-evidence-record">
                <h3>ردپای ثبت امضا</h3>
                <dl className="contract-spec-board">
                  <div>
                    <dt>زمان ثبت امضا</dt>
                    <dd>
                      <ContractDate value={contract.signedAt} />
                    </dd>
                  </div>
                  <div>
                    <dt>نسخهٔ ثبت‌شده</dt>
                    <dd>
                      <bdi dir="ltr">{version || "ثبت نشده"}</bdi>
                    </dd>
                  </div>
                  <div className="contract-spec-wide">
                    <dt>SHA-256 ثبت‌شده</dt>
                    <dd className="contract-hash">
                      <bdi dir="ltr">{hash || "ثبت نشده"}</bdi>
                    </dd>
                  </div>
                </dl>
                <p className="contract-note">
                  ثبت این شناسه‌ها به معنی دسترسی به متن اصلی یا تأیید مستقل صحت آن نیست. فایل سند قرارداد از API فعلی ارائه نمی‌شود.
                </p>
                {contract.signatureUuid ? <SignaturePreview key={contract.signatureUuid} uuid={contract.signatureUuid} /> : null}
              </div>
            ) : null}

            <div className="contract-record-dates">
              <span>
                ایجاد: <ContractDate value={contract.createdAt} />
              </span>
              <span>
                آخرین تغییر: <ContractDate value={contract.updatedAt} />
              </span>
            </div>
          </section>

          {contract.status === "draft" ? (
            <>
              <IdentityNotice />
              <ContractSignature contract={contract} onServerChange={onServerChange} />
            </>
          ) : null}
        </div>

        <ContractTimeline contract={contract} />
      </div>
    </>
  );
}

function SellerIdentity({ value }: { readonly value: Identity | null }): ReactElement {
  if (!value) return <p className="contract-note">مشخصات هویتی در پاسخ قرارداد موجود نیست.</p>;
  const legal = value.kind === "legal";
  return (
    <dl className="contract-spec-board">
      <div>
        <dt>{legal ? "نام شرکت" : "نام و نام خانوادگی"}</dt>
        <dd>{legal ? value.company_name || "ثبت نشده" : [value.first_name, value.last_name].filter(Boolean).join(" ") || "ثبت نشده"}</dd>
      </div>
      <div>
        <dt>{legal ? "شناسه ملی شرکت" : "کد ملی"}</dt>
        <dd>
          <bdi dir="ltr">{legal ? value.company_national_id || "ثبت نشده" : value.national_id || "ثبت نشده"}</bdi>
        </dd>
      </div>
      {legal ? (
        <>
          <div>
            <dt>نماینده</dt>
            <dd>{[value.representative_first_name, value.representative_last_name].filter(Boolean).join(" ") || "ثبت نشده"}</dd>
          </div>
          <div>
            <dt>کد ملی نماینده</dt>
            <dd>
              <bdi dir="ltr">{value.representative_national_id || "ثبت نشده"}</bdi>
            </dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

function ContractTimeline({ contract }: { readonly contract: Contract }): ReactElement {
  const eventLabels: Record<string, string> = { signed: "ثبت امضای فروشنده", approved: "تأیید شرکت", rejected: "رد شرکت" };
  return (
    <aside className="contract-timeline">
      <h2>
        <Icon name="clock" className="size-5" />
        مسیر این قرارداد
      </h2>
      <ol>
        <li>
          <span className="contract-timeline-dot">
            <Icon name="file" />
          </span>
          <div>
            <h3>ایجاد پیش‌نویس</h3>
            <ContractDate value={contract.createdAt} />
            <p>شرایط پلن در قرارداد ذخیره شد.</p>
          </div>
        </li>
        {contract.history.map((event) => (
          <li key={event.uuid}>
            <span className={`contract-timeline-dot contract-tone-${event.type === "rejected" ? "coral" : event.type === "approved" ? "emerald" : "blue"}`}>
              <Icon name={event.type === "rejected" ? "close" : event.type === "approved" ? "check" : "edit"} />
            </span>
            <div>
              <h3>{Object.hasOwn(eventLabels, event.type) ? eventLabels[event.type] : "تغییر ثبت‌شده در قرارداد"}</h3>
              <ContractDate value={event.createdAt} />
              <p>
                {statusInfo(event.from).label} ← {statusInfo(event.to).label}
              </p>
              {event.reason ? <p className="contract-rejection-reason">{event.reason}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      {!contract.history.length ? <p className="contract-note">هنوز رویداد امضا یا تصمیم شرکت ثبت نشده است.</p> : null}
      <Link href="/contact">پرسشی دربارهٔ این قرارداد دارید؟</Link>
    </aside>
  );
}
