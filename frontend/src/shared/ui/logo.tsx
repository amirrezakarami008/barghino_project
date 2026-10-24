import Link from "next/link";
import { cx } from "@/shared/lib/cx";
import { Icon } from "@/shared/ui/icon";

export function Logo({
  href = "/",
  tone = "default",
  caption = true,
  className,
}: {
  href?: string;
  tone?: "default" | "inverse";
  caption?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cx("inline-flex items-center gap-2.5", className)}>
      <span
        className={cx(
          "grid size-9 place-items-center rounded-xl",
          tone === "inverse" ? "bg-white/12 text-solar" : "bg-primary text-primary-foreground",
        )}
      >
        <Icon name="bolt" className="size-5" />
      </span>
      <span className="grid leading-none">
        <span className={cx("text-lg font-bold", tone === "inverse" ? "text-sidebar-foreground" : "text-primary")}>
          برقینو
        </span>
        {caption ? (
          <span className={cx("mt-1 text-[11px]", tone === "inverse" ? "text-sidebar-muted" : "text-muted-foreground")}>
            فروش برق خانگی
          </span>
        ) : null}
      </span>
    </Link>
  );
}
