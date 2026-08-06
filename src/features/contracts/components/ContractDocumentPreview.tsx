"use client";

import { SITE_CONFIG } from "@/config";
import type { Contract, ContractPartyInfo } from "../types";
import { getContractArticles } from "../lib/contract-content";
import { toPersianDigits } from "../lib/format";
import { Zap } from "lucide-react";
import { forwardRef, type CSSProperties, type ReactNode } from "react";

interface ContractDocumentPreviewProps {
  contract: Contract;
  party: Partial<ContractPartyInfo> & {
    fullName?: string;
    nationalId?: string;
    birthCertificateNumber?: string;
  };
  contractNumber: string;
  signedAt: string;
  nationalIdPhotoUrl?: string | null;
  signatureDataUrl?: string | null;
  className?: string;
  resolved?: {
    startDate?: string;
    endDate?: string;
    volume?: string;
    rate?: string;
    planName?: string;
  };
}

const C = {
  white: "#ffffff",
  muted: "#64748b",
  soft: "#f1f5f9",
  line: "#cbd5e1",
  brand: "#059669",
  brandDark: "#065f46",
} as const;

function Ltr({ children }: { children: ReactNode }) {
  return (
    <span style={{ unicodeBidi: "isolate", direction: "ltr", display: "inline-block" }}>
      {children}
    </span>
  );
}

/** پیش‌نمایش قرارداد در UI (هم‌تراز با قالب PDF) */
export const ContractDocumentPreview = forwardRef<HTMLDivElement, ContractDocumentPreviewProps>(
  function ContractDocumentPreview(
    {
      contract,
      party,
      contractNumber,
      signedAt,
      nationalIdPhotoUrl,
      signatureDataUrl,
      className,
      resolved,
    },
    ref,
  ) {
    const startDate = resolved?.startDate ?? contract.startDate;
    const endDate = resolved?.endDate ?? contract.endDate;
    const volume = resolved?.volume ?? contract.volume;
    const rate = resolved?.rate ?? contract.rate;
    const planName = resolved?.planName ?? contract.planName;

    const articles = getContractArticles({
      ...contract,
      startDate,
      endDate,
      volume,
      rate,
      planName,
    });

    return (
      <div
        ref={ref}
        dir="rtl"
        className={className}
        style={{
          width: 794,
          backgroundColor: C.white,
          color: "#0f172a",
          fontFamily: "Vazirmatn, Tahoma, sans-serif",
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ backgroundColor: C.brandDark, color: C.white, padding: "22px 28px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap style={{ width: 22, height: 22, color: C.white }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{SITE_CONFIG.name}</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>{SITE_CONFIG.tagline}</div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 11,
                lineHeight: 1.7,
                minWidth: 230,
              }}
            >
              <div>
                شماره قرارداد: <Ltr>{contractNumber}</Ltr>
              </div>
              <div>تاریخ تنظیم: {toPersianDigits(signedAt)}</div>
              <div>
                تلفن: <Ltr>{SITE_CONFIG.phone}</Ltr> · <Ltr>{SITE_CONFIG.email}</Ltr>
              </div>
            </div>
          </div>
          <h1 style={{ margin: "16px 0 0", textAlign: "center", fontSize: 18, fontWeight: 800 }}>
            قرارداد فروش برق تجدیدپذیر خانگی
          </h1>
        </div>

        <div style={{ padding: "18px 28px", fontSize: 12, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 12px", textAlign: "justify", color: "#334155" }}>
            این قرارداد بین سامانه «{SITE_CONFIG.name}» به‌عنوان خریدار و شخص حقیقی زیر به‌عنوان
            فروشنده منعقد می‌گردد.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              {(
                [
                  ["عنوان", contract.title],
                  ["نوع قرارداد", contract.type],
                  ["پلن فروش", planName || "—"],
                  ["واحد / نیروگاه", contract.billAccount],
                  ["دوره اعتبار", `${startDate} تا ${endDate}`],
                  ["حجم توافقی", volume],
                  ["نرخ", rate],
                ] as const
              ).map(([label, value]) => (
                <tr key={label}>
                  <th style={thStyle}>{label}</th>
                  <td style={tdStyle}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={h2Style}>مشخصات طرف دوم (فروشنده)</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <th style={thStyle}>نام</th>
                <td style={tdStyle}>{party.fullName || "—"}</td>
                <th style={thStyle}>کد ملی</th>
                <td style={tdStyle}>
                  <Ltr>{toPersianDigits(party.nationalId || "—")}</Ltr>
                </td>
              </tr>
              <tr>
                <th style={thStyle}>شماره شناسنامه</th>
                <td style={tdStyle}>
                  <Ltr>{toPersianDigits(party.birthCertificateNumber || "—")}</Ltr>
                </td>
                <th style={thStyle}>موبایل</th>
                <td style={tdStyle}>
                  <Ltr>{toPersianDigits(party.phone || "—")}</Ltr>
                </td>
              </tr>
              <tr>
                <th style={thStyle}>نشانی</th>
                <td style={tdStyle} colSpan={3}>
                  {party.address || "—"}
                </td>
              </tr>
            </tbody>
          </table>

          <h2 style={h2Style}>مواد قرارداد</h2>
          {articles.map((a) => (
            <p
              key={a}
              style={{ margin: "0 0 7px", textAlign: "justify", color: "#334155", fontSize: 11.5 }}
            >
              {a}
            </p>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div style={boxStyle}>
              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>تصویر کارت ملی</div>
              <div style={frameStyle}>
                {nationalIdPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={nationalIdPhotoUrl}
                    alt="کارت ملی"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>بارگذاری نشده</span>
                )}
              </div>
            </div>
            <div style={boxStyle}>
              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>امضای طرف دوم</div>
              <div style={{ ...frameStyle, flexDirection: "column", gap: 4 }}>
                {signatureDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureDataUrl}
                    alt="امضا"
                    style={{ maxWidth: "92%", maxHeight: 110, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>محل امضا</span>
                )}
                <span style={{ fontSize: 10, color: C.muted }}>{party.fullName || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const thStyle: CSSProperties = {
  width: "18%",
  backgroundColor: C.soft,
  color: "#475569",
  border: `1px solid ${C.line}`,
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 700,
  textAlign: "right",
};

const tdStyle: CSSProperties = {
  border: `1px solid ${C.line}`,
  padding: "6px 8px",
  fontWeight: 600,
  textAlign: "right",
};

const h2Style: CSSProperties = {
  margin: "14px 0 8px",
  fontSize: 13,
  fontWeight: 800,
  color: C.brandDark,
  borderRight: `3px solid ${C.brand}`,
  paddingRight: 8,
};

const boxStyle: CSSProperties = {
  border: `1px solid ${C.line}`,
  borderRadius: 6,
  padding: 8,
};

const frameStyle: CSSProperties = {
  height: 150,
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};
