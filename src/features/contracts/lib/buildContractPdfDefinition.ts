import { SITE_CONFIG } from "@/config";
import type { Contract } from "../types";
import { getContractArticles } from "./contract-content";
import { toPersianDigits } from "./format";

export interface ContractPdfModel {
  contract: Contract;
  fullName: string;
  nationalId: string;
  birthCertificateNumber: string;
  phone: string;
  address: string;
  contractNumber: string;
  signedAt: string;
  /** data:image/... */
  nationalIdPhotoDataUrl: string;
  /** data:image/... */
  signatureDataUrl: string;
  startDate: string;
  endDate: string;
  volume: string;
  rate: string;
  planName?: string;
}

/** جداسازی جهت برای لاتین داخل متن RTL (LRI…PDI) */
function ltrIsolate(text: string): string {
  return `\u2066${text}\u2069`;
}

function fa(text: string) {
  return toPersianDigits(text);
}

function tableLayout() {
  return {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#cbd5e1",
    vLineColor: () => "#cbd5e1",
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 5,
    paddingBottom: () => 5,
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

/**
 * تعریف سند pdfmake — چیدمان RTL
 * (در pdfmake ستون اول = چپ؛ برای ظاهر راست‌به‌چپ، ترتیب ستون‌ها را معکوس می‌کنیم)
 */
export function buildContractPdfDefinition(model: ContractPdfModel) {
  const articles = getContractArticles({
    ...model.contract,
    startDate: model.startDate,
    endDate: model.endDate,
    volume: model.volume,
    rate: model.rate,
    planName: model.planName,
  });

  // مقدار سمت چپ، برچسب سمت راست
  const infoRows = [
    ["عنوان", model.contract.title],
    ["نوع قرارداد", model.contract.type],
    ["پلن فروش", model.planName ?? "—"],
    ["واحد / نیروگاه", model.contract.billAccount],
    ["دوره اعتبار", `${model.startDate} تا ${model.endDate}`],
    ["حجم توافقی", model.volume],
    ["نرخ", model.rate],
  ].map(([label, value]) => [valueCell(value!), labelCell(label!)]);

  const articleBlocks = articles.map((a) => ({
    text: a,
    style: "article",
    alignment: "justify" as const,
  }));

  const nationalId = fa(model.nationalId);
  const birthCert = fa(model.birthCertificateNumber);
  const phone = fa(model.phone);

  return {
    pageSize: "A4" as const,
    pageMargins: [36, 36, 36, 48],
    defaultStyle: {
      font: "Vazirmatn",
      fontSize: 11,
      lineHeight: 1.45,
      alignment: "right" as const,
      color: "#0f172a",
    },
    styles: {
      brandName: { fontSize: 18, bold: true, color: "#ffffff", alignment: "right" as const },
      brandTag: { fontSize: 9, color: "#ecfdf5", alignment: "right" as const },
      docTitle: { fontSize: 15, bold: true, color: "#ffffff", alignment: "center" as const },
      meta: { fontSize: 9, color: "#ffffff", lineHeight: 1.6, alignment: "right" as const },
      lead: { fontSize: 11, color: "#334155", alignment: "justify" as const, margin: [0, 0, 0, 10] },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: "#065f46",
        alignment: "right" as const,
        margin: [0, 10, 0, 6],
      },
      article: { fontSize: 10.5, color: "#334155", margin: [0, 0, 0, 5], lineHeight: 1.55 },
      boxTitle: { fontSize: 10, bold: true, color: "#334155", alignment: "right" as const, margin: [0, 0, 0, 4] },
      footer: { fontSize: 8.5, color: "#64748b", alignment: "center" as const, lineHeight: 1.5 },
      sealNote: { fontSize: 9, color: "#94a3b8" },
    },
    footer: (currentPage: number, pageCount: number) => ({
      // ستون اول = چپ → شماره صفحه چپ؛ برند راست
      columns: [
        {
          text: `صفحه ${fa(String(currentPage))} از ${fa(String(pageCount))}`,
          alignment: "left",
          style: "footer",
          margin: [36, 0, 0, 0],
        },
        {
          text: `${SITE_CONFIG.name} · ${ltrIsolate(SITE_CONFIG.email)}`,
          alignment: "right",
          style: "footer",
          margin: [0, 0, 36, 0],
        },
      ],
      margin: [0, 8, 0, 0],
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
                    // برند راست، متا چپ
                    columns: [
                      {
                        width: 210,
                        table: {
                          widths: ["*"],
                          body: [
                            [
                              {
                                stack: [
                                  {
                                    text: `شماره قرارداد: ${ltrIsolate(model.contractNumber)}`,
                                    style: "meta",
                                  },
                                  { text: `تاریخ تنظیم: ${fa(model.signedAt)}`, style: "meta" },
                                  {
                                    text: `تلفن: ${ltrIsolate(SITE_CONFIG.phone)} · ${ltrIsolate(SITE_CONFIG.email)}`,
                                    style: "meta",
                                  },
                                ],
                                fillColor: "#0a7058",
                                margin: [8, 6, 8, 6],
                              },
                            ],
                          ],
                        },
                        layout: {
                          hLineWidth: () => 0.8,
                          vLineWidth: () => 0.8,
                          hLineColor: () => "#148f6a",
                          vLineColor: () => "#148f6a",
                        },
                      },
                      {
                        width: "*",
                        stack: [
                          { text: SITE_CONFIG.name, style: "brandName" },
                          { text: SITE_CONFIG.tagline, style: "brandTag", margin: [0, 2, 0, 0] },
                        ],
                      },
                    ],
                    columnGap: 12,
                    margin: [0, 0, 0, 10],
                  },
                  {
                    text: "قرارداد فروش برق تجدیدپذیر خانگی",
                    style: "docTitle",
                    margin: [0, 4, 0, 0],
                  },
                ],
                fillColor: "#065f46",
                margin: [0, 0, 0, 0],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [-36, -36, -36, 14],
      },
      {
        canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 3, lineColor: "#10b981" }],
        margin: [0, 0, 0, 12],
      },
      {
        text: `این قرارداد بین سامانه «${SITE_CONFIG.name}» به‌عنوان خریدار (طرف اول) و شخص حقیقی زیر به‌عنوان فروشنده (طرف دوم)، مطابق قوانین جاری و شرایط بورس سبز منعقد می‌گردد.`,
        style: "lead",
      },
      {
        table: { widths: ["*", "22%"], body: infoRows },
        layout: tableLayout(),
        margin: [0, 0, 0, 6],
      },
      { text: "مشخصات طرف دوم (فروشنده)", style: "sectionTitle" },
      {
        // در RTL: جفت اول سمت راست (نام)، جفت دوم سمت چپ (کد ملی)
        table: {
          widths: ["*", "18%", "*", "18%"],
          body: [
            [
              valueCell(nationalId),
              labelCell("کد ملی"),
              valueCell(model.fullName),
              labelCell("نام و نام خانوادگی"),
            ],
            [
              valueCell(phone),
              labelCell("تلفن همراه"),
              valueCell(birthCert),
              labelCell("شماره شناسنامه"),
            ],
            [
              { ...valueCell(model.address), colSpan: 3 },
              {},
              {},
              labelCell("نشانی"),
            ],
          ],
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 4],
      },
      { text: "مواد قرارداد", style: "sectionTitle" },
      ...articleBlocks,
      { text: "", margin: [0, 6, 0, 0] },
      {
        // کارت ملی راست، امضا چپ
        columns: [
          {
            width: "*",
            stack: [
              { text: "امضای طرف دوم", style: "boxTitle" },
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        stack: [
                          {
                            image: model.signatureDataUrl,
                            fit: [200, 90],
                            alignment: "center",
                            margin: [0, 4, 0, 2],
                          },
                          {
                            text: model.fullName,
                            alignment: "center",
                            fontSize: 9,
                            color: "#64748b",
                          },
                        ],
                        margin: [4, 4, 4, 4],
                      },
                    ],
                  ],
                },
                layout: tableLayout(),
              },
            ],
          },
          {
            width: "*",
            stack: [
              { text: "تصویر کارت ملی پیوست‌شده", style: "boxTitle" },
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        image: model.nationalIdPhotoDataUrl,
                        fit: [220, 130],
                        alignment: "center",
                        margin: [4, 4, 4, 4],
                      },
                    ],
                  ],
                },
                layout: tableLayout(),
              },
            ],
          },
        ],
        columnGap: 10,
      },
      {
        // مهر سامانه راست، تأیید طرف دوم چپ
        columns: [
          {
            width: "*",
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: "تأیید الکترونیکی طرف دوم",
                        style: "boxTitle",
                        alignment: "center",
                        color: "#065f46",
                      },
                      {
                        text: `تاریخ امضا: ${fa(model.signedAt)}`,
                        alignment: "center",
                        fontSize: 10,
                        color: "#065f46",
                        margin: [0, 6, 0, 0],
                      },
                      {
                        text: `شماره: ${ltrIsolate(model.contractNumber)}`,
                        alignment: "center",
                        fontSize: 10,
                        color: "#065f46",
                      },
                    ],
                    fillColor: "#ecfdf5",
                    margin: [8, 10, 8, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#6ee7b7",
              vLineColor: () => "#6ee7b7",
              paddingLeft: () => 0,
              paddingRight: () => 0,
            },
          },
          {
            width: "*",
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: `مهر و امضای ${SITE_CONFIG.name}`,
                        style: "boxTitle",
                        alignment: "center",
                      },
                      {
                        text: "سامانه رسمی فروش برق سبز",
                        style: "sealNote",
                        alignment: "center",
                        margin: [0, 16, 0, 0],
                      },
                    ],
                    margin: [8, 10, 8, 10],
                  },
                ],
              ],
            },
            layout: {
              ...tableLayout(),
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#cbd5e1",
              vLineColor: () => "#cbd5e1",
              paddingLeft: () => 0,
              paddingRight: () => 0,
            },
          },
        ],
        columnGap: 10,
        margin: [0, 10, 0, 0],
      },
      {
        text: `این سند توسط سامانه ${SITE_CONFIG.name} صادر شده و دارای اعتبار امضای الکترونیکی در چارچوب فرآیند داخلی پلتفرم است.`,
        style: "footer",
        margin: [0, 14, 0, 0],
      },
    ],
  };
}
