import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
    <html lang="fa" dir="rtl">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
