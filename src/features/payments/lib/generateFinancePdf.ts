import { SITE_CONFIG } from "@/config";
import { createPersianPdf, ltrIsolate } from "@/shared/lib/pdfmake-client";
import type { Payment, SellInvoice } from "@/shared/types/dashboard";
import { DASHBOARD_USER } from "@/features/dashboard/constants";

function faDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}

function tableLayout() {
  return {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#cbd5e1",
    vLineColor: () => "#cbd5e1",
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6,
  };
}

function labelCell(text: string) {
  return {
    text,
    bold: true,
    fillColor: "#f1f5f9",
    color: "#475569",
    fontSize: 10,
    alignment: "right" as const,
  };
}

function valueCell(text: string) {
  return {
    text,
    bold: true,
    fontSize: 10,
    color: "#0f172a",
    alignment: "right" as const,
  };
}

function statusLabel(status: Payment["status"] | SellInvoice["status"]) {
  const map: Record<string, string> = {
    success: "موفق",
    pending: "در انتظار",
    failed: "ناموفق",
    processing: "در پردازش",
    paid: "پرداخت‌شده",
  };
  return map[status] ?? status;
}

function buildInfoRows(rows: [string, string][]) {
  // مقدار چپ، برچسب راست (RTL در pdfmake)
  return rows.map(([label, value]) => [valueCell(value), labelCell(label)]);
}

function baseDoc(title: string, content: unknown[]) {
  return {
    pageSize: "A4" as const,
    pageMargins: [40, 40, 40, 48],
    defaultStyle: {
      font: "Vazirmatn",
      fontSize: 11,
      lineHeight: 1.45,
      alignment: "right" as const,
      color: "#0f172a",
    },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: `صفحه ${faDigits(currentPage)} از ${faDigits(pageCount)}`,
          alignment: "left",
          fontSize: 8.5,
          color: "#64748b",
          margin: [40, 0, 0, 0],
        },
        {
          text: `${SITE_CONFIG.name} · ${ltrIsolate(SITE_CONFIG.email)}`,
          alignment: "right",
          fontSize: 8.5,
          color: "#64748b",
          margin: [0, 0, 40, 0],
        },
      ],
      margin: [0, 10, 0, 0],
    }),
    content: [
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    columns: [
                      {
                        width: 200,
                        stack: [
                          { text: title, fontSize: 11, color: "#ecfdf5", alignment: "right" },
                          {
                            text: faDigits(new Date().toLocaleDateString("fa-IR")),
                            fontSize: 9,
                            color: "#a7f3d0",
                            alignment: "right",
                            margin: [0, 4, 0, 0],
                          },
                        ],
                      },
                      {
                        width: "*",
                        stack: [
                          {
                            text: SITE_CONFIG.name,
                            fontSize: 18,
                            bold: true,
                            color: "#ffffff",
                            alignment: "right",
                          },
                          {
                            text: SITE_CONFIG.tagline,
                            fontSize: 9,
                            color: "#ecfdf5",
                            alignment: "right",
                            margin: [0, 2, 0, 0],
                          },
                        ],
                      },
                    ],
                  },
                ],
                fillColor: "#065f46",
                margin: [12, 14, 12, 14],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [-40, -40, -40, 16],
      },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 3, lineColor: "#10b981" }],
        margin: [0, 0, 0, 16],
      },
      ...content,
    ],
  };
}

/** فاکتور / رسید پرداخت واریز درآمد */
export async function generatePaymentReceiptPdf(payment: Payment): Promise<Blob> {
  const rows = buildInfoRows([
    ["عنوان", payment.title],
    ["شماره پیگیری", payment.reference],
    ["تاریخ", payment.date],
    ["وضعیت", statusLabel(payment.status)],
    ["روش", payment.method],
    ["مبلغ (تومان)", payment.amount],
    ["نیروگاه", payment.plantName ?? "—"],
    ["دوره", payment.period ?? "—"],
    ["تولید (kWh)", payment.energyKwh ?? "—"],
    ["نرخ (تومان/kWh)", payment.ratePerKwh ?? "—"],
    ["شماره صورت‌حساب", payment.invoiceNumber ?? "—"],
    ["بانک مقصد", payment.bankName ? `${payment.bankName} · ****${payment.bankLast4 ?? ""}` : "—"],
    ["گیرنده", DASHBOARD_USER.name],
  ]);

  const doc = baseDoc("رسید پرداخت درآمد فروش برق", [
    {
      text: "این سند رسید رسمی واریز درآمد فروش برق تجدیدپذیر از سوی سامانه برقینو است.",
      color: "#334155",
      margin: [0, 0, 0, 12],
      alignment: "justify",
    },
    {
      table: { widths: ["*", "28%"], body: rows },
      layout: tableLayout(),
    },
    payment.description
      ? {
          text: `توضیحات: ${payment.description}`,
          margin: [0, 14, 0, 0],
          fontSize: 10,
          color: "#475569",
        }
      : { text: "" },
    {
      text: `صادرکننده: ${SITE_CONFIG.name} · تلفن ${ltrIsolate(SITE_CONFIG.phone)}`,
      margin: [0, 20, 0, 0],
      fontSize: 9,
      color: "#64748b",
      alignment: "center",
    },
  ]);

  return createPersianPdf(doc);
}

/** فاکتور صورت‌حساب فروش برق */
export async function generateSellInvoicePdf(invoice: SellInvoice): Promise<Blob> {
  const rows = buildInfoRows([
    ["شماره صورت‌حساب", invoice.number],
    ["نیروگاه", invoice.plantName],
    ["دوره", invoice.period],
    ["تولید تأییدشده", `${invoice.energyKwh} kWh`],
    ["نرخ واحد", `${invoice.ratePerKwh} تومان/kWh`],
    ["مبلغ قابل پرداخت", `${invoice.amount} تومان`],
    ["موعد پرداخت", invoice.dueDate],
    ["وضعیت", statusLabel(invoice.status)],
    ["تاریخ واریز", invoice.paidDate ?? "—"],
    ["فروشنده", DASHBOARD_USER.name],
    ["خریدار", SITE_CONFIG.name],
  ]);

  const doc = baseDoc("فاکتور صورت‌حساب فروش برق", [
    {
      text: `صورت‌حساب فروش برق تجدیدپذیر مطابق قرارداد بین «${SITE_CONFIG.name}» و «${DASHBOARD_USER.name}».`,
      color: "#334155",
      margin: [0, 0, 0, 12],
      alignment: "justify",
    },
    {
      table: { widths: ["*", "28%"], body: rows },
      layout: tableLayout(),
    },
    {
      margin: [0, 16, 0, 0],
      table: {
        widths: ["*", "35%"],
        body: [
          [
            {
              text: `${invoice.amount} تومان`,
              bold: true,
              fontSize: 14,
              color: "#065f46",
              alignment: "right",
              fillColor: "#ecfdf5",
            },
            {
              text: "جمع قابل پرداخت",
              bold: true,
              fontSize: 11,
              color: "#065f46",
              alignment: "right",
              fillColor: "#ecfdf5",
            },
          ],
        ],
      },
      layout: tableLayout(),
    },
    {
      text: `پرداخت حداکثر ظرف ${SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه پس از تأیید دوره انجام می‌شود.`,
      margin: [0, 16, 0, 0],
      fontSize: 9.5,
      color: "#64748b",
      alignment: "center",
    },
  ]);

  return createPersianPdf(doc);
}
