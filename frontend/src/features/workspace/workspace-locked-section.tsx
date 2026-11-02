import type { ReactElement } from "react";
import { ButtonLink, LockedFeature } from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";

export function WorkspaceLockedSection({
  title,
  description = "این بخش هنوز آماده نیست و با LockedFeature به‌صورت «به‌زودی» نمایش داده می‌شود.",
}: {
  readonly title: string;
  readonly description?: string;
}): ReactElement {
  return (
    <div className="panel-page mx-auto max-w-3xl space-y-6">
      <header className="panel-page-header space-y-2">
        <h2 className="text-h2 tracking-tight">{title}</h2>
        <p className="text-body text-foreground-muted">قابلیت در نقشهٔ محصول هست، اما هنوز فعال نشده است.</p>
      </header>
      <div className="panel-surface overflow-hidden">
        <div className="mb-4 flex justify-center">
          <PanelArt
            name="locked"
            width={168}
            height={168}
            className="size-36 rounded-[22px] object-cover shadow-[var(--panel-float)]"
          />
        </div>
        <LockedFeature
          title={title}
          description={description}
          className="border-0 bg-transparent p-0 shadow-none"
          action={<ButtonLink href="/panel/contracts">رفتن به قراردادها</ButtonLink>}
        />
      </div>
      <div className="flex justify-center opacity-90">
        <PanelArt name="energy-bulb" width={96} height={96} className="size-20 rounded-2xl object-cover" />
      </div>
    </div>
  );
}
