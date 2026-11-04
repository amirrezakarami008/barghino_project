import { ApiError, apiRequest } from "@/features/auth/lib/api";
import {
  InstallDataError,
  parseInstallRequest,
  parsePage,
  type InstallRequest,
  type Page,
} from "@/features/installs/install-model";
import { installError } from "@/features/installs/installs-api";
import type { SchemeType, SystemType } from "@/features/plants/plant-options";

export const installReviewPageSize = 12;

export type InstallAdvanceTarget = "contract" | "installation" | "active";

export type InstallMediaReviewInput = {
  readonly decision: "approved" | "rejected";
  readonly reason: string;
};

export type InstallVisitInput = {
  readonly visitAt: string;
  readonly reason: string;
};

export type InstallProposalInput = {
  readonly capacityKwp: string;
  readonly panelCount: number;
  readonly costToman: number;
  readonly monthlyKwh: string;
  readonly monthlyIncomeToman: number;
  readonly visitSummary: string;
  readonly includeCatalogEstimate: boolean;
};

export type InstallAdvanceInput = {
  readonly target: InstallAdvanceTarget;
  readonly branchName: string;
  readonly billId: string;
  readonly schemeType: SchemeType;
  readonly systemType: SystemType;
};

export async function getInstallReviewQueue(
  page: number,
  signal?: AbortSignal,
): Promise<Page<InstallRequest>> {
  return parsePage(
    await apiRequest<unknown>(
      `/installs/staff/reviews/?page=${page}&page_size=${installReviewPageSize}`,
      { auth: true, signal },
    ),
    parseInstallRequest,
  );
}

export async function submitInstallMediaReview(
  uuid: string,
  input: InstallMediaReviewInput,
): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/staff/requests/${encodeURIComponent(uuid)}/media-review/`, {
      method: "POST",
      auth: true,
      body: { decision: input.decision, reason: input.reason },
    }),
  );
}

export async function scheduleInstallVisit(
  uuid: string,
  input: InstallVisitInput,
): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/staff/requests/${encodeURIComponent(uuid)}/visit/`, {
      method: "POST",
      auth: true,
      body: { visit_at: input.visitAt, reason: input.reason },
    }),
  );
}

export async function recordInstallProposal(
  uuid: string,
  input: InstallProposalInput,
): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/staff/requests/${encodeURIComponent(uuid)}/proposal/`, {
      method: "POST",
      auth: true,
      body: {
        capacity_kwp: input.capacityKwp,
        panel_count: input.panelCount,
        cost_toman: input.costToman,
        monthly_kwh: input.monthlyKwh,
        monthly_income_toman: input.monthlyIncomeToman,
        visit_summary: input.visitSummary,
        include_catalog_estimate: input.includeCatalogEstimate,
      },
    }),
  );
}

export async function advanceInstallRequest(
  uuid: string,
  input: InstallAdvanceInput,
): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/staff/requests/${encodeURIComponent(uuid)}/advance/`, {
      method: "POST",
      auth: true,
      body: {
        target: input.target,
        branch_name: input.branchName,
        bill_id: input.billId,
        scheme_type: input.schemeType,
        system_type: input.systemType,
      },
    }),
  );
}

export async function getInstallMediaContent(storedFileUuid: string, signal?: AbortSignal): Promise<Blob> {
  return apiRequest<Blob>(`/files/${encodeURIComponent(storedFileUuid)}/content/`, {
    auth: true,
    responseType: "blob",
    signal,
  });
}

export function staffInstallError(error: unknown): string {
  if (error instanceof InstallDataError) return error.message;
  if (error instanceof ApiError) {
    if (error.fields.decision) return "نتیجهٔ بررسی رسانه معتبر نیست.";
    if (error.fields.reason) return "دلیل رد را کامل وارد کنید.";
    if (error.fields.visit_at) return "زمان بازدید را درست وارد کنید.";
    if (error.fields.capacity_kwp) return "ظرفیت پیشنهادی را عددی مثبت وارد کنید.";
    if (error.fields.panel_count) return "تعداد پنل باید عدد صحیح و مثبت باشد.";
    if (error.fields.cost_toman || error.fields.monthly_income_toman) {
      return "مبالغ پیشنهادی را عددی و معتبر وارد کنید.";
    }
    if (error.fields.monthly_kwh) return "برآورد تولید ماهانه را درست وارد کنید.";
    if (error.fields.target) return "مرحلهٔ مقصد معتبر نیست.";
    if (error.fields.branch_name) return "نام انشعاب را وارد کنید.";
    if (error.fields.bill_id) return "شناسه قبض را درست وارد کنید.";
    if (error.fields.scheme_type || error.fields.system_type) {
      return "کاربری طرح و نوع اتصال شبکه را انتخاب کنید.";
    }
  }
  return installError(error);
}
