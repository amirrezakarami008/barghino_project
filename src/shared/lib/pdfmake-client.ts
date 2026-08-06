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
      return (mod.default ?? mod) as PdfMakeInstance;
    });
  }
  return pdfMakePromise;
}

async function ensurePersianFonts(pdfMake: PdfMakeInstance) {
  if (fontsReady) return;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [regular, bold] = await Promise.all([
    fetch(`${origin}/fonts/Vazirmatn-Regular.ttf`).then((r) => {
      if (!r.ok) throw new Error("بارگذاری فونت PDF ناموفق بود.");
      return r.arrayBuffer();
    }),
    fetch(`${origin}/fonts/Vazirmatn-Bold.ttf`).then((r) => {
      if (!r.ok) throw new Error("بارگذاری فونت PDF ناموفق بود.");
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

/** ساخت PDF با فونت Vazirmatn */
export async function createPersianPdf(docDefinition: unknown): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  await ensurePersianFonts(pdfMake);
  return pdfMake.createPdf(docDefinition).getBlob();
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** جداسازی جهت لاتین داخل متن RTL */
export function ltrIsolate(text: string): string {
  return `\u2066${text}\u2069`;
}
