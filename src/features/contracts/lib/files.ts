import { CONTRACT_FILES_DB, CONTRACT_FILES_STORE } from "../constants";

function canUseIndexedDb() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(CONTRACT_FILES_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CONTRACT_FILES_STORE)) {
        db.createObjectStore(CONTRACT_FILES_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open file DB"));
  });
}

export async function saveFileBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CONTRACT_FILES_STORE, "readwrite");
    tx.objectStore(CONTRACT_FILES_STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save file"));
  });
  db.close();
}

export async function getFileBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(CONTRACT_FILES_STORE, "readonly");
      const request = tx.objectStore(CONTRACT_FILES_STORE).get(key);
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Failed to read file"));
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteFileBlob(key: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CONTRACT_FILES_STORE, "readwrite");
      tx.objectStore(CONTRACT_FILES_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to delete file"));
    });
    db.close();
  } catch {
    // ignore
  }
}

/** Minimal printable PDF for seed/demo downloads */
export function buildSeedPdfBlob(title: string, lines: string[]): Blob {
  const escapePdf = (text: string) =>
    text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const contentLines = [
    "BT",
    "/F1 14 Tf",
    "50 780 Td",
    `(${escapePdf(title)}) Tj`,
    "0 -24 Td",
    "/F1 11 Tf",
    ...lines.flatMap((line, index) => {
      const escaped = escapePdf(line);
      return index === 0 ? [`(${escaped}) Tj`] : [`0 -16 Td`, `(${escaped}) Tj`];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${contentLines.length} >>stream\n${contentLines}\nendstream\nendobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
