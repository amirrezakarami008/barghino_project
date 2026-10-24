import Link from "next/link";
import { Logo } from "@/shared/ui/logo";

const columns = [
  {
    title: "محصول",
    links: [
      { href: "/sell", label: "فروش برق" },
      { href: "/install", label: "نصب نیروگاه" },
      { href: "/faq", label: "پرسش‌ها" },
    ],
  },
  {
    title: "برقینو",
    links: [
      { href: "/about", label: "درباره ما" },
      { href: "/blog", label: "مجله" },
      { href: "/contact", label: "تماس" },
      { href: "/support", label: "پشتیبانی" },
    ],
  },
  {
    title: "اسناد",
    links: [
      { href: "/terms", label: "شرایط استفاده" },
      { href: "/privacy", label: "حریم خصوصی" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            برق خانگی را با قرارداد رسمی و تسویه حداکثر دو ماه می‌فروشید. نیروگاه ندارید؟ مسیر نصب از همین‌جا شروع می‌شود.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            تلفن ۰۲۱-۴۴۰۰۰۶۶۴
            <br />
            info@bargheto.com
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-primary">{column.title}</p>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
