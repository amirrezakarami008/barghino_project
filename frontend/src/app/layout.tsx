import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: {
    default: "برقینو",
    template: "%s | برقینو",
  },
  description: "پلتفرم فروش برق خانگی و نیروگاه خورشیدی",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        <a
          href="#content"
          className="sr-only rounded-control bg-card px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-50"
        >
          رفتن به محتوا
        </a>
        {children}
      </body>
    </html>
  );
}
