import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/shared/ui/logo";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/hero-solar.jpg" alt="" width={1280} height={720} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-primary/10" />
        <div className="absolute right-8 bottom-8 left-8 text-white">
          <p className="text-2xl font-bold">برق خانگی‌ات را بفروش</p>
          <p className="mt-2 max-w-sm text-sm leading-7 text-white/85">قرارداد رسمی، تسویه حداکثر دو ماه، و اگر نیروگاه نداری مسیر نصب.</p>
        </div>
      </div>
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div id="content" className="mx-auto mt-12 w-full max-w-md flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
