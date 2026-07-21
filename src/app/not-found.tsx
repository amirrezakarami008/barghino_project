import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-mesh-light bg-grid py-20">
      <div className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-brand-400/10 blur-[80px]" />
      <Container className="relative text-center">
        <p className="mb-4 font-display text-9xl font-black text-brand-200">۴۰۴</p>
        <h1 className="mb-4 font-display text-3xl font-extrabold text-slate-900">صفحه یافت نشد</h1>
        <p className="mb-10 text-lg text-slate-600">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <Button href="/" size="lg">
          بازگشت به صفحه اصلی
        </Button>
      </Container>
    </div>
  );
}
