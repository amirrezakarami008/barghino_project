import type { InstallRequest, InstallRequestStep } from "@/shared/types/dashboard";

export const INSTALL_STORAGE_KEY = "barghino:install-requests-v1";
export const INSTALL_EVENT = "barghino:install-updated";

export function createInstallId() {
  return `ir-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INSTALL_EVENT));
}

export function getInstallRequests(): InstallRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INSTALL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InstallRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLatestInstallRequest(): InstallRequest | null {
  const all = getInstallRequests();
  return all[0] ?? null;
}

export function saveInstallRequest(input: {
  address: string;
  note?: string;
  phone?: string;
  area?: string;
}): InstallRequest {
  const request: InstallRequest = {
    id: createInstallId(),
    address: input.address,
    submittedAt: new Date().toLocaleDateString("fa-IR"),
    currentStep: "submitted",
    note: [input.phone && `تماس: ${input.phone}`, input.area && `مساحت: ${input.area} م²`, input.note]
      .filter(Boolean)
      .join(" · ") || undefined,
  };

  const next = [request, ...getInstallRequests()];
  window.localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify(next));
  emit();
  return request;
}

export function advanceInstallStep(id: string, step: InstallRequestStep) {
  const next = getInstallRequests().map((item) =>
    item.id === id ? { ...item, currentStep: step } : item,
  );
  window.localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify(next));
  emit();
}

export function subscribeInstall(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(INSTALL_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(INSTALL_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
