import { ButtonLink } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main id="content" className="mx-auto grid min-h-dvh max-w-lg place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-emerald">۴۰۴</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">این صفحه پیدا نشد</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">آدرس را بررسی کنید یا به خانه برقینو برگردید.</p>
        <ButtonLink href="/" className="mt-6">
          خانه
        </ButtonLink>
      </div>
    </main>
  );
}
