"use client";

import Link from "next/link";
import { ThemeToggle } from "@/shared/theme";
import { Logo } from "@/shared/ui/logo";
import "./site-footer.css";

const columns = [
  {
    title: "محصول",
    links: [
      { href: "/services#sell", label: "فروش برق" },
      { href: "/services#install", label: "نصب نیروگاه" },
      { href: "/services", label: "همه خدمات" },
    ],
  },
  {
    title: "برقینو",
    links: [
      { href: "/learn", label: "آموزش" },
      { href: "/contact", label: "تماس" },
      { href: "/about", label: "درباره ما" },
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
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <Logo />
          <p className="site-footer__lede">
            مسیر شفاف فروش برق خانگی و نصب نیروگاه خورشیدی — با قرارداد قابل‌پیگیری.
          </p>
          <p className="site-footer__contact">
            تلفن ۰۲۱-۴۴۰۰۰۶۶۴
            <br />
            info@bargheto.com
          </p>
        </div>

        <div className="site-footer__cols">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="site-footer__col-title">{column.title}</p>
              <ul className="site-footer__links">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer__bar">
        <p className="site-footer__meta">برقینو</p>
        <div className="site-footer__bar-actions">
          <ThemeToggle />
          <div
            className="site-footer__trust"
            role="img"
            aria-label="جایگاه نماد اعتماد — به‌زودی"
          >
            نماد اعتماد
          </div>
        </div>
      </div>
    </footer>
  );
}
