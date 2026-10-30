const decisionLabel: Record<string, string> = {
  approved: "تأیید",
  rejected: "رد",
};

function formatWhen(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatLastAction(input: {
  reviewedAt?: string;
  reviewDecision?: string;
  reviewNote?: string;
  updatedAt?: string;
  createdAt?: string;
}): string {
  if (input.reviewedAt && input.reviewDecision) {
    const label = decisionLabel[input.reviewDecision] ?? input.reviewDecision;
    const note = input.reviewNote?.trim();
    return note
      ? `آخرین اقدام: ${label} · ${formatWhen(input.reviewedAt)} — ${note}`
      : `آخرین اقدام: ${label} · ${formatWhen(input.reviewedAt)}`;
  }
  if (input.updatedAt) return `آخرین به‌روزرسانی · ${formatWhen(input.updatedAt)}`;
  if (input.createdAt) return `ثبت · ${formatWhen(input.createdAt)}`;
  return "هنوز اقدامی ثبت نشده";
}
