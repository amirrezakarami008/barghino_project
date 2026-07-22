import { Footer } from "@/shared/layout/Footer";
import { Header } from "@/shared/layout/Header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
