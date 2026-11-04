import { formatDecimal, type Contract, type Identity } from "./contract-model";

/** Client template version bound to the displayed document text. Keep in sync with hash input. */
export const CONTRACT_TERMS_VERSION = "v1";

function sellerLines(seller: Identity | null): readonly string[] {
  if (!seller) return ["فروشنده: اطلاعات هویتی در پیش‌نویس موجود نیست."];
  if (seller.kind === "legal") {
    return [
      `فروشنده (حقوقی): ${seller.company_name ?? "—"}`,
      `شناسه ملی شرکت: ${seller.company_national_id ?? "—"}`,
      `نماینده: ${[seller.representative_first_name, seller.representative_last_name].filter(Boolean).join(" ") || "—"}`,
      `کد ملی نماینده: ${seller.representative_national_id ?? "—"}`,
      `شماره شناسنامه نماینده: ${seller.representative_birth_certificate_number ?? "—"}`,
      `تاریخ تولد نماینده: ${seller.representative_date_of_birth ?? "—"}`,
    ];
  }
  return [
    `فروشنده (حقیقی): ${[seller.first_name, seller.last_name].filter(Boolean).join(" ") || "—"}`,
    `کد ملی: ${seller.national_id ?? "—"}`,
    `شماره شناسنامه: ${seller.birth_certificate_number ?? "—"}`,
    `تاریخ تولد: ${seller.date_of_birth ?? "—"}`,
  ];
}

/**
 * Deterministic Persian document body for draft signing.
 * The exact UTF-8 of this string is hashed client-side as terms_sha256.
 */
export function buildContractDocumentText(contract: Contract): string {
  const lines = [
    "قرارداد خرید برق نیروگاه خورشیدی — برقینی",
    `نسخه سند: ${CONTRACT_TERMS_VERSION}`,
    "",
    ...sellerLines(contract.seller),
    "",
    `ظرفیت نصب‌شده: ${formatDecimal(contract.capacity)} kWp`,
    `شناسه قبض: ${contract.billId || "—"}`,
    `نشانی انشعاب: ${contract.address || "—"}`,
    "",
    `پلن فروش: ${contract.planName || "—"}`,
    `تعهد انرژی: ${formatDecimal(contract.commitment)} kWh`,
    `نرخ خرید: ${formatDecimal(contract.rate)} تومان به ازای هر کیلووات‌ساعت`,
    "",
    "شرایط پذیرش:",
    "۱. فروشنده شرایط تجاری ذخیره‌شده در این پیش‌نویس را می‌پذیرد و درخواست بررسی شرکت را ارسال می‌کند.",
    "۲. شرایط پلن در لحظه ساخت پیش‌نویس قفل شده‌اند و با ویرایش بعدی پلن تغییر نمی‌کنند.",
    "۳. پس از امضا، قرارداد در وضعیت انتظار بررسی شرکت قرار می‌گیرد تا تأیید یا رد شود.",
    "۴. در صورت رد، این نسخه بسته می‌شود و اصلاح داده با ساخت پیش‌نویس جدید انجام می‌شود.",
    "۵. تصویر امضای پیوست مدرک پذیرش همین متن نمایش‌داده‌شده است.",
  ];
  return lines.join("\n");
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return [...view].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Pure SHA-256 for non-secure origins where crypto.subtle is unavailable. */
function sha256Fallback(text: string): string {
  const encoded = new TextEncoder().encode(text);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const bitLen = encoded.length * 8;
  const withPad = new Uint8Array(((encoded.length + 9 + 63) & ~63));
  withPad.set(encoded);
  withPad[encoded.length] = 0x80;
  const view = new DataView(withPad.buffer);
  view.setUint32(withPad.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(withPad.length - 4, bitLen >>> 0);

  const rotr = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));
  for (let offset = 0; offset < withPad.length; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e!, 6) ^ rotr(e!, 11) ^ rotr(e!, 25);
      const ch = (e! & f!) ^ (~e! & g!);
      const temp1 = (h! + S1 + ch + K[i]! + w[i]!) >>> 0;
      const S0 = rotr(a!, 2) ^ rotr(a!, 13) ^ rotr(a!, 22);
      const maj = (a! & b!) ^ (a! & c!) ^ (b! & c!);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d! + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0]! + a!) >>> 0;
    H[1] = (H[1]! + b!) >>> 0;
    H[2] = (H[2]! + c!) >>> 0;
    H[3] = (H[3]! + d!) >>> 0;
    H[4] = (H[4]! + e!) >>> 0;
    H[5] = (H[5]! + f!) >>> 0;
    H[6] = (H[6]! + g!) >>> 0;
    H[7] = (H[7]! + h!) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i += 1) outView.setUint32(i * 4, H[i]!);
  return toHex(out);
}

export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text));
      return toHex(digest);
    } catch {
      // Fall through for restricted environments.
    }
  }
  return sha256Fallback(text);
}
