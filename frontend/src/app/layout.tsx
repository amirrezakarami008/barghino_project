import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/features/auth/session-provider";
import { ThemeProvider, ThemeScript } from "@/shared/theme";
import "./globals.css";
import "@/shared/ui/product-design.css";
import "@/components/ui/components.css";

const vazirmatn = localFont({
  src: [
    { path: "../../public/fonts/vazirmatn/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
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
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeScript />
        <a
          href="#content"
          className="sr-only rounded-control bg-card px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:end-3 focus:z-50"
        >
          رفتن به محتوا
        </a>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
