import {
  buildContractPdfDefinition,
  type ContractPdfModel,
} from "./buildContractPdfDefinition";

export type { ContractPdfModel };

type PdfMakeInstance = {
  addVirtualFileSystem: (vfs: Record<string, string>) => void;
  addFonts: (fonts: Record<string, Record<string, string>>) => void;
  createPdf: (docDefinition: unknown) => {
    getBlob: () => Promise<Blob>;
  };
};

let pdfMakePromise: Promise<PdfMakeInstance> | null = null;
let fontsReady = false;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadPdfMake(): Promise<PdfMakeInstance> {
  if (!pdfMakePromise) {
    pdfMakePromise = import("pdfmake/build/pdfmake").then((mod) => {
      const instance = (mod.default ?? mod) as PdfMakeInstance;
      return instance;
    });
  }
  return pdfMakePromise;
}

/** همان فونت پیش‌نمایش UI — پوشش کامل حروف و علائم فارسی */
async function ensurePersianFonts(pdfMake: PdfMakeInstance) {
  if (fontsReady) return;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [regular, bold] = await Promise.all([
    fetch(`${origin}/fonts/Vazirmatn-Regular.ttf`).then((r) => {
      if (!r.ok) throw new Error("بارگذاری فونت قرارداد ناموفق بود.");
      return r.arrayBuffer();
    }),
    fetch(`${origin}/fonts/Vazirmatn-Bold.ttf`).then((r) => {
      if (!r.ok) throw new Error("بارگذاری فونت قرارداد ناموفق بود.");
      return r.arrayBuffer();
    }),
  ]);

  pdfMake.addVirtualFileSystem({
    "Vazirmatn-Regular.ttf": arrayBufferToBase64(regular),
    "Vazirmatn-Bold.ttf": arrayBufferToBase64(bold),
  });

  pdfMake.addFonts({
    Vazirmatn: {
      normal: "Vazirmatn-Regular.ttf",
      bold: "Vazirmatn-Bold.ttf",
      italics: "Vazirmatn-Regular.ttf",
      bolditalics: "Vazirmatn-Bold.ttf",
    },
  });

  fontsReady = true;
}

/**
 * ساخت PDF رسمی A4 از مدل قرارداد
 * — pdfmake + Vazirmatn (هم‌تراز با پیش‌نمایش)
 */
export async function generateContractPdf(model: ContractPdfModel): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  await ensurePersianFonts(pdfMake);

  const docDefinition = buildContractPdfDefinition(model);
  const blob = await pdfMake.createPdf(docDefinition).getBlob();
  return blob;
}

/** تبدیل File یا data URL به data URL پایدار برای PDF */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });
}
