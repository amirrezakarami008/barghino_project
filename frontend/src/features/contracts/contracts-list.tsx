"use client";

import { useCallback, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { ButtonLink, Button } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { getContracts } from "./contracts-api";
import { formatDecimal, type Contract, type Page } from "./contract-model";
import {
  ContractDate,
  ContractEmpty,
  ContractError,
  ContractPagination,
  ContractStatus,
  contractSummaryDate,
  statusInfo,
} from "./contract-ui";
import { useContractResource } from "./use-contract-resource";
import "./contracts.css";

const STATUS_FILTERS = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "pending", label: "در انتظار شرکت" },
  { value: "active", label: "فعال" },
  { value: "cancelled", label: "بسته‌شده" },
  { value: "expired", label: "منقضی‌شده" },
] as const;

const JOURNEY: { icon: IconName; title: string; detail: string }[] = [
  { icon: "solarPanel", title: "نیروگاه", detail: "ثبت و تأیید انشعاب" },
  { icon: "plan", title: "شرایط", detail: "انتخاب پلن فروش" },
  { icon: "edit", title: "امضا", detail: "بررسی و تأیید شما" },
  { icon: "shield", title: "شرکت", detail: "تصمیم نهایی" },
];

function normalizeText(value: string): string {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک");
}

function matchesContract(contract: Contract, query: string, filter: string): boolean {
  if (filter !== "all" && contract.status !== filter) return false;
  if (!query) return true;
  return normalizeText(`${contract.plantName} ${contract.planName}`).includes(query);
}

function countByStatus(results: readonly Contract[], status: string): number {
  return results.reduce((total, contract) => total + (contract.status === status ? 1 : 0), 0);
}

function dateLabel(contract: Contract): string {
  if (contract.reviewedAt) return "بررسی شرکت";
  if (contract.signedAt) return "زمان امضا";
  return "ایجاد";
}

function openLabel(status: string): string {
  return status === "draft" ? "بررسی و ادامه" : "جزئیات قرارداد";
}

function Overview({ data }: { readonly data: Page<Contract> }): ReactElement {
  const items = [
    { key: "total", label: "کل قراردادها", value: data.count, tone: "blue", hint: "در تمام صفحات" },
    { key: "draft", label: "نیاز به ادامه", value: countByStatus(data.results, "draft"), tone: "blue", hint: "در این صفحه" },
    { key: "pending", label: "نزد شرکت", value: countByStatus(data.results, "pending"), tone: "violet", hint: "در این صفحه" },
    { key: "active", label: "فعال", value: countByStatus(data.results, "active"), tone: "emerald", hint: "در این صفحه" },
  ] as const;
  return (
    <ul className="contract-overview" aria-label="خلاصهٔ وضعیت قراردادها">
      {items.map((item) => (
        <li key={item.key} className={`contract-overview-card contract-tone-${item.tone}`}>
          <span>{item.label}</span>
          <strong>{item.value.toLocaleString("fa-IR")}</strong>
          <small>{item.hint}</small>
        </li>
      ))}
    </ul>
  );
}

function ContractRow({ contract }: { readonly contract: Contract }): ReactElement {
  const info = statusInfo(contract.status);
  const href = `/panel/contracts/${encodeURIComponent(contract.uuid)}`;
  const cta = openLabel(contract.status);
  return (
    <li className={`contract-row contract-tone-${info.tone}`}>
      <div className="contract-row-main">
        <div className="contract-row-heading">
          <ContractStatus status={contract.status} />
          <h3>{contract.plantName || "نیروگاه ثبت نشده"}</h3>
          <p>{contract.planName || "پلن ثبت نشده"}</p>
        </div>
        <p className="contract-row-next">{info.next}</p>
        <dl className="contract-row-meta">
          <div>
            <dt>{dateLabel(contract)}</dt>
            <dd>
              <ContractDate value={contractSummaryDate(contract)} />
            </dd>
          </div>
          {contract.capacity ? (
            <div>
              <dt>ظرفیت</dt>
              <dd>
                <bdi dir="ltr">{formatDecimal(contract.capacity)} kWp</bdi>
              </dd>
            </div>
          ) : null}
          {contract.meter ? (
            <div>
              <dt>شماره کنتور</dt>
              <dd>
                <bdi dir="ltr">{contract.meter}</bdi>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
      <dl className="contract-row-finance">
        <div>
          <dt>نرخ خرید</dt>
          <dd>
            <bdi dir="ltr">{formatDecimal(contract.rate)}</bdi>
            <small>تومان / kWh</small>
          </dd>
        </div>
        <div>
          <dt>تعهد انرژی</dt>
          <dd>
            <bdi dir="ltr">{formatDecimal(contract.commitment)}</bdi>
            <small>kWh</small>
          </dd>
        </div>
      </dl>
      <Link className="product-button product-button-secondary contract-open" href={href}>
        {cta}
        <Icon name="chevron" className="size-4" />
      </Link>
    </li>
  );
}

export function ContractsList(): ReactElement {
  const search = useSearchParams();
  const parsedPage = Number(search.get("page"));
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const query = search.get("q") ?? "";
  const filter = search.get("status") ?? "all";
  const load = useCallback((signal: AbortSignal) => getContracts(page, signal), [page]);
  const { state, reload, refreshing, refreshError } = useContractResource(`contracts:${page}`, load);

  function updateQuery(name: string, value: string): void {
    const next = new URLSearchParams(window.location.search);
    if (value && value !== "all" && !(name === "page" && value === "1")) next.set(name, value);
    else next.delete(name);
    window.history.replaceState(null, "", `/panel/contracts${next.size ? `?${next}` : ""}`);
  }

  function clearFilters(): void {
    const next = new URLSearchParams(window.location.search);
    next.delete("q");
    next.delete("status");
    window.history.replaceState(null, "", `/panel/contracts${next.size ? `?${next}` : ""}`);
  }

  const normalized = normalizeText(query.trim());
  const pageResults = state.status === "ready" ? state.data.results : [];
  const contracts = pageResults.filter((contract) => matchesContract(contract, normalized, filter));
  const activeFilter = STATUS_FILTERS.some((item) => item.value === filter) ? filter : "all";

  return (
    <div className="contracts-feature">
      <WorkspacePage
        title="قراردادهای من"
        icon="file"
        lede="مسیر فروش برق نیروگاه: از تأیید سایت تا امضا و تصمیم شرکت. وضعیت هر نسخه را اینجا ببینید و ادامه دهید."
        action={{ href: "/panel/contracts/new", label: "قرارداد جدید" }}
      >
        <ol className="contract-journey" aria-label="مسیر قرارداد">
          {JOURNEY.map((step, index) => (
            <li key={step.title}>
              <span className="contract-journey-index" aria-hidden="true">
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <span className="contract-journey-icon" aria-hidden="true">
                <Icon name={step.icon} />
              </span>
              <strong>{step.title}</strong>
              <span>{step.detail}</span>
            </li>
          ))}
        </ol>

        {state.status === "ready" && state.data.results.length > 0 ? <Overview data={state.data} /> : null}

        <div className="contract-list-panel">
          <div className="contract-list-toolbar">
            <label className="contract-search">
              <Icon name="search" />
              <span className="sr-only">جست‌وجوی قرارداد در صفحهٔ فعلی</span>
              <input
                type="search"
                value={query}
                onChange={(event) => updateQuery("q", event.target.value)}
                placeholder="جست‌وجوی نیروگاه یا پلن در این صفحه…"
              />
            </label>
            <Button variant="secondary" disabled={refreshing} onClick={reload}>
              <Icon name="clock" className="size-4" />
              {refreshing ? "در حال دریافت…" : "تازه‌سازی"}
            </Button>
          </div>

          <div className="contract-filter-bar">
            <div role="group" aria-label="وضعیت قراردادها" className="contract-status-chips">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={activeFilter === item.value}
                  className="contract-status-chip"
                  data-active={activeFilter === item.value}
                  onClick={() => updateQuery("status", item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="contract-filter-hint">جست‌وجو و فیلتر فقط روی قراردادهای صفحهٔ فعلی اعمال می‌شوند.</p>
          </div>

          {refreshError ? (
            <ContractError message={`فهرست تازه نشد؛ آخرین دادهٔ دریافتی نمایش داده می‌شود. ${refreshError}`} retry={reload} />
          ) : null}

          {state.status === "loading" ? (
            <LoadingCards label="در حال دریافت قراردادها…" />
          ) : state.status === "error" ? (
            <ContractError message={state.message} retry={reload} />
          ) : state.data.results.length === 0 ? (
            <ContractEmpty title="هنوز قراردادی ندارید" icon="file">
              <p>ابتدا انشعاب و نیروگاه را ثبت کنید. پس از تأیید شرکت، پلن فروش را انتخاب و پیش‌نویس را بسازید.</p>
              <ol className="contract-empty-steps">
                <li>ثبت یا انتخاب انشعاب و نیروگاه</li>
                <li>انتخاب پلن و ساخت پیش‌نویس</li>
                <li>امضا و ارسال برای بررسی شرکت</li>
              </ol>
              <ButtonLink href="/panel/contracts/new" className="mt-4">
                شروع مراحل قرارداد
              </ButtonLink>
            </ContractEmpty>
          ) : contracts.length === 0 ? (
            <ContractEmpty title="در این صفحه قراردادی با این مشخصات پیدا نشد">
              <p>عبارت جست‌وجو یا وضعیت انتخاب‌شده را تغییر دهید، یا فیلترها را پاک کنید.</p>
              <Button variant="secondary" onClick={clearFilters}>
                پاک‌کردن فیلترها
              </Button>
            </ContractEmpty>
          ) : (
            <>
              <p className="contract-result-count" aria-live="polite">
                {contracts.length.toLocaleString("fa-IR")} قرارداد در این صفحه
                {activeFilter !== "all" || normalized ? " با فیلتر فعلی" : ""}
              </p>
              <ul className="contract-ledger">
                {contracts.map((contract) => (
                  <ContractRow key={contract.uuid} contract={contract} />
                ))}
              </ul>
            </>
          )}

          {state.status === "ready" && (state.data.next || state.data.previous) ? (
            <ContractPagination page={page} {...state.data} onChange={(value) => updateQuery("page", String(value))} />
          ) : null}
        </div>
      </WorkspacePage>
    </div>
  );
}
