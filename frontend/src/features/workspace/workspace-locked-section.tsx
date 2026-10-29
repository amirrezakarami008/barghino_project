import type { ReactElement } from "react";
import { WorkspacePage } from "./workspace-page";
import { Icon } from "@/shared/ui/icon";
import { ButtonLink } from "@/shared/ui/button";
export function WorkspaceLockedSection({ title }: { readonly title: string }): ReactElement {
  return <WorkspacePage title={title} icon="lock" lede="این بخش هنوز فعال نشده است؛ پس از آماده‌شدن از طریق منوی پنل در دسترس خواهد بود."><section className="product-empty rounded-panel border border-border bg-card p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl"><Icon name="lock" className="size-6" /></span><h2 className="mt-5 text-lg font-semibold">این بخش فعلاً قفل است</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">اکنون می‌توانید مراحل قرارداد، نیروگاه‌های ثبت‌شده و پروفایل خود را پیگیری کنید.</p><ButtonLink href="/panel/contracts" className="mt-5">رفتن به قراردادها</ButtonLink></section></WorkspacePage>;
}
