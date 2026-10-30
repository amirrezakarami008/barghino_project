import type { ReactElement } from "react";
import { ButtonLink, LockedFeature } from "@/components/ui";

export function WorkspaceLockedSection({
  title,
  description = "این بخش هنوز آماده نیست و با LockedFeature به‌صورت «به‌زودی» نمایش داده می‌شود.",
}: {
  readonly title: string;
  readonly description?: string;
}): ReactElement {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-h2">{title}</h2>
        <p className="mt-2 text-body text-foreground-muted">قابلیت در نقشهٔ محصول هست، اما هنوز فعال نشده است.</p>
      </header>
      <LockedFeature
        title={title}
        description={description}
        action={<ButtonLink href="/panel/contracts">رفتن به قراردادها</ButtonLink>}
      />
    </div>
  );
}
