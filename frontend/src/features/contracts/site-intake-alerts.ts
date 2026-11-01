import { createAlertSelector, type AlertDescriptor } from "@/components/ui";
import { faNumber } from "@/shared/lib/fa";
import {
  findOwnMeterDuplicate,
  isSuspiciousCapacity,
} from "./site-intake-validation";
import type { SiteIntakeAlertState, SiteIntakeFieldId } from "./site-intake-types";

const FIELD_LABELS: Record<SiteIntakeFieldId, string> = {
  "branch-select": "انتخاب انشعاب",
  "branch-name": "نام انشعاب",
  "branch-meter": "شماره کنتور",
  "branch-address": "نشانی انشعاب",
  "plant-select": "انتخاب نیروگاه",
  "plant-name": "نام نیروگاه",
  "plant-address": "نشانی نیروگاه",
  "plant-capacity": "ظرفیت نصب‌شده",
};

export type SiteIntakeAlertActions = {
  useExistingBranch: (branchId: string) => void;
  editBranch: () => void;
  pickAnotherBranch: () => void;
  editPlant: () => void;
  pickAnotherPlant: () => void;
  ackCapacity: () => void;
  continueToPlan: () => void;
  resetDraft: () => void;
  retrySubmit: () => void;
  loginAgain: () => void;
};

export const selectSiteIntakeAlerts = createAlertSelector(
  (input: { state: SiteIntakeAlertState; actions: SiteIntakeAlertActions }): AlertDescriptor[] => {
    const { state, actions } = input;
    const { draft, selectedBranch, selectedPlant, submitIssue } = state;
    const alerts: AlertDescriptor[] = [];

    if (state.draftRestored) {
      alerts.push({
        id: "draft.restored",
        variant: "info",
        placement: "banner",
        priority: 10,
        title: "اطلاعات ذخیره‌نشدهٔ قبلی بازیابی شد",
        actions: [{ label: "شروع از نو", variant: "secondary", onClick: actions.resetDraft }],
      });
    }

    const bothApproved =
      draft.branchMode === "existing" &&
      draft.plantMode === "existing" &&
      selectedBranch?.status === "active" &&
      selectedPlant?.status === "active" &&
      selectedPlant.branch_uuid === selectedBranch.uuid;

    if (bothApproved) {
      alerts.push({
        id: "both.approved",
        variant: "success",
        placement: "banner",
        priority: 40,
        title: "انشعاب و نیروگاه تأیید شده‌اند",
        actions: [{ label: "ادامه: انتخاب پلن", variant: "primary", onClick: actions.continueToPlan }],
      });
    }

    if (draft.branchMode === "new") {
      alerts.push({
        id: "branch.new",
        variant: "info",
        placement: "section-branch",
        consequenceKey: "review-gate",
        title: "انشعاب جدید پس از ثبت بررسی می‌شود",
        description:
          "تا زمان تأیید شرکت، ادامهٔ قرارداد ممکن نیست. می‌توانید در همین مرحله نیروگاه را هم ثبت کنید.",
      });
    } else if (selectedBranch?.status === "pending") {
      alerts.push({
        id: "branch.existing.pending",
        variant: "warning",
        placement: "section-branch",
        consequenceKey: "review-gate",
        title: "این انشعاب هنوز در انتظار بررسی است",
        description:
          "می‌توانید نیروگاه را ثبت کنید؛ ادامهٔ قرارداد پس از تأیید انشعاب ممکن می‌شود.",
      });
    } else if (selectedBranch?.status === "inactive") {
      alerts.push({
        id: "branch.existing.rejected",
        variant: "danger",
        placement: "section-branch",
        title: "این انشعاب رد شده است",
        description: selectedBranch.review_note || "دلیل رد در پاسخ سرویس ثبت نشده است.",
        actions: [
          { label: "اصلاح اطلاعات", variant: "primary", onClick: actions.editBranch },
          { label: "انتخاب انشعاب دیگر", variant: "secondary", onClick: actions.pickAnotherBranch },
        ],
      });
    }

    if (draft.branchMode === "new") {
      const duplicate = findOwnMeterDuplicate(draft.meter, state.branches);
      if (duplicate) {
        alerts.push({
          id: "branch.duplicate.own",
          variant: "warning",
          placement: "section-branch",
          priority: 30,
          title: "این شماره کنتور قبلاً برای شما ثبت شده است",
          actions: [
            {
              label: "استفاده از انشعاب موجود",
              variant: "primary",
              onClick: () => actions.useExistingBranch(duplicate.uuid),
            },
          ],
        });
      }
    }

    if (submitIssue.kind === "conflict") {
      alerts.push({
        id: "branch.conflict",
        variant: "danger",
        placement: "section-branch",
        priority: 50,
        title: "ثبت این شماره کنتور ممکن نیست",
        description: "شماره را بررسی کنید یا با پشتیبانی تماس بگیرید.",
      });
    }

    const branchNeedsReview =
      draft.branchMode === "new" || selectedBranch?.status === "pending";
    if (branchNeedsReview && (draft.plantMode === "new" || selectedPlant)) {
      alerts.push({
        id: "plant.afterBranch",
        variant: "info",
        placement: "section-plant",
        consequenceKey: "review-gate",
        title: "نیروگاه پس از تأیید انشعاب بررسی می‌شود",
        description:
          "ثبت اطلاعات همین حالا ممکن است؛ تصمیم دربارهٔ نیروگاه بعد از تأیید انشعاب گرفته می‌شود.",
      });
    }

    if (draft.plantMode === "existing" && selectedPlant?.status === "inactive") {
      alerts.push({
        id: "plant.existing.rejected",
        variant: "danger",
        placement: "section-plant",
        title: "این نیروگاه رد شده است",
        description: selectedPlant.review_note || "دلیل رد در پاسخ سرویس ثبت نشده است.",
        actions: [
          { label: "اصلاح اطلاعات", variant: "primary", onClick: actions.editPlant },
          { label: "انتخاب نیروگاه دیگر", variant: "secondary", onClick: actions.pickAnotherPlant },
        ],
      });
    }

    if (
      draft.plantMode === "new" &&
      isSuspiciousCapacity(draft.capacity) &&
      !draft.capacityAcked
    ) {
      alerts.push({
        id: "plant.capacity.suspicious",
        variant: "warning",
        placement: "section-plant",
        priority: 20,
        title: "ظرفیت واردشده زیاد به نظر می‌رسد",
        description: "ظرفیت بر حسب کیلووات وارد می‌شود، نه وات.",
        actions: [{ label: "عدد درست است", variant: "secondary", onClick: actions.ackCapacity }],
      });
    }

    if (submitIssue.kind === "validation") {
      alerts.push({
        id: "form.errors",
        variant: "danger",
        placement: "form-summary",
        priority: 60,
        title: `${faNumber(submitIssue.fields.length)} مورد نیاز به اصلاح دارد`,
        items: submitIssue.fields.map((field) => ({
          id: field,
          label: FIELD_LABELS[field],
          href: `#intake-${field}`,
        })),
      });
    }

    if (submitIssue.kind === "network") {
      alerts.push({
        id: "submit.network",
        variant: "danger",
        placement: "form-summary",
        priority: 55,
        title: "ارتباط با سرور برقرار نشد",
        description: "اطلاعات فرم حفظ شده است.",
        actions: [{ label: "تلاش دوباره", variant: "primary", onClick: actions.retrySubmit }],
      });
    }

    if (submitIssue.kind === "partial") {
      alerts.push({
        id: "submit.partial",
        variant: "warning",
        placement: "form-summary",
        priority: 54,
        title: "انشعاب ثبت شد، اما ثبت نیروگاه کامل نشد",
        description:
          "اطلاعات انشعاب ذخیره شده است. فقط ثبت نیروگاه را دوباره امتحان کنید.",
        actions: [{ label: "تلاش دوباره", variant: "primary", onClick: actions.retrySubmit }],
      });
    }

    if (submitIssue.kind === "session") {
      alerts.push({
        id: "session.expired",
        variant: "danger",
        placement: "form-summary",
        priority: 70,
        title: "نشست شما منقضی شده است",
        description: "پیش‌نویس فرم حفظ شده است.",
        actions: [{ label: "ورود دوباره", variant: "primary", onClick: actions.loginAgain }],
      });
    }

    if (submitIssue.kind === "generic") {
      alerts.push({
        id: "submit.generic",
        variant: "danger",
        placement: "form-summary",
        priority: 50,
        title: submitIssue.message,
        actions: [{ label: "تلاش دوباره", variant: "primary", onClick: actions.retrySubmit }],
      });
    }

    return alerts;
  },
);
