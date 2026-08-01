import type { FooterLinkGroup } from "@/shared/types";

export const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    title: "دسترسی سریع",
    links: [
      { label: "صفحه اصلی", href: "/" },
      { label: "فروش برق خانگی", href: "/register" },
      { label: "نصب نیروگاه خورشیدی", href: "/solar-home" },
      { label: "سوالات متداول", href: "/faq" },
    ],
  },
  {
    title: "بیشتر بدانید",
    links: [
      { label: "درباره برقینو", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "پشتیبانی", href: "/support" },
      { label: "مجله", href: "/blog" },
    ],
  },
  {
    title: "قوانین",
    links: [
      { label: "شرایط و ضوابط", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
  },
];

export const TRUSTED_CLIENTS = [
  "خانه‌های ویلایی",
  "آپارتمان‌ها",
  "مجتمع‌های مسکونی",
  "باغ‌ویلاها",
];
