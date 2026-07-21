import type { Metadata, Viewport } from "next";
import { Vazirmatn, Tajawal } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "برق ما | سامانه آنلاین خرید برق در ایران",
    template: "%s | برق ما",
  },
  description:
    "تامین برق با تعرفه اقتصادی و کاهش هزینه تا ۶۰ درصد، سریع، ساده و متناسب با نیاز شما",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${tajawal.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
