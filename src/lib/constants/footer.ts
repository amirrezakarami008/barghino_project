import type { FooterLinkGroup } from "@/types";

export const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    title: "دسترسی سریع",
    links: [
      { label: "صفحه اصلی", href: "/" },
      { label: "سوالات متداول", href: "/faq" },
      { label: "تماس با ما", href: "/contact" },
      { label: "درباره ما", href: "/about" },
    ],
  },
  {
    title: "خدمات",
    links: [
      { label: "تامین برق مصرفی", href: "/services/power-supply" },
      { label: "تامین برق خاموشی", href: "/services/uninterrupted-power" },
      { label: "مشاوره انرژی", href: "/services/energy-consulting" },
      { label: "نیروگاه تجدیدپذیر", href: "/services/renewable" },
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
  "پتروشیمی",
  "فولاد",
  "سیمان",
  "داروسازی",
  "خودروسازی",
  "غذایی",
  "نساجی",
  "فناوری",
];
