import { createAlertSelector, type AlertDescriptor } from "@/components/ui";
import type { Branch, Plant } from "@/features/plants";

export type SiteReviewAlertState = {
  readonly branch: Branch;
  readonly plant: Plant;
  readonly branchApproved: boolean;
  readonly plantBlocked: boolean;
  readonly anyRejected: boolean;
  readonly pendingReview: boolean;
};

export type SiteReviewAlertActions = {
  editBranch: () => void;
  editPlant: () => void;
};

function rejectionMeta(item: Branch | Plant): { who: string; when: string } {
  const when = item.reviewed_at
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(item.reviewed_at),
      )
    : "";
  const who = item.review_decision ? "شرکت" : "";
  return { who, when };
}

export const selectSiteReviewAlerts = createAlertSelector(
  (input: { state: SiteReviewAlertState; actions: SiteReviewAlertActions }): AlertDescriptor[] => {
    const { state, actions } = input;
    const alerts: AlertDescriptor[] = [];

    if (state.branch.status === "inactive") {
      const meta = rejectionMeta(state.branch);
      alerts.push({
        id: "review.next.branch-rejected",
        variant: "danger",
        placement: "review-next",
        priority: 60,
        title: "انشعاب رد شده است",
        description: (
          <>
            <blockquote className="site-review-quote">{state.branch.review_note || "دلیل رد ثبت نشده است."}</blockquote>
            {meta.who || meta.when ? (
              <p className="site-review-meta">
                {[meta.who && `توسط ${meta.who}`, meta.when].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </>
        ),
        actions: [{ label: "اصلاح اطلاعات", variant: "primary", onClick: actions.editBranch }],
      });
    }

    if (state.plant.status === "inactive" && state.branchApproved) {
      const meta = rejectionMeta(state.plant);
      alerts.push({
        id: "review.next.plant-rejected",
        variant: "danger",
        placement: "review-next",
        priority: 55,
        title: "نیروگاه رد شده است",
        description: (
          <>
            <blockquote className="site-review-quote">{state.plant.review_note || "دلیل رد ثبت نشده است."}</blockquote>
            {meta.who || meta.when ? (
              <p className="site-review-meta">
                {[meta.who && `توسط ${meta.who}`, meta.when].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </>
        ),
        actions: [{ label: "اصلاح اطلاعات", variant: "primary", onClick: actions.editPlant }],
      });
    }

    if (state.pendingReview && !state.anyRejected) {
      alerts.push({
        id: "review.next.pending",
        variant: "info",
        placement: "review-next",
        priority: 30,
        consequenceKey: "review-wait",
        title: "در صف بررسی شرکت هستید",
        description: state.plantBlocked
          ? "انشعاب هنوز تأیید نشده؛ بررسی نیروگاه بعد از آن شروع می‌شود. می‌توانید صفحه را ترک کنید و بعداً برگردید."
          : "می‌توانید از این صفحه خارج شوید؛ وضعیت در «نیروگاه من» و همین مسیر قرارداد قابل مشاهده است.",
      });
    }

    return alerts;
  },
);
