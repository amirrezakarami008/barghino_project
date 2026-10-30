import { AuthStage } from "@/features/auth/components/auth-stage";
import { LoginForm } from "@/features/auth/components/login-form";
import { Icon, type IconName } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "قرارداد رسمی", text: "قابل‌پیگیری" },
  { icon: "clock", title: "تسویه نمونه", text: `حداکثر ${faNumber(2)} ماه` },
  { icon: "chart", title: "نرخ خرید نمونه", text: "نه نرخ زنده بورس" },
];

export function LoginScreen() {
  return (
    <AuthStage>
      <LoginForm />
      <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-5 sm:gap-3">
        {benefits.map((item) => (
          <li key={item.title} className="min-w-0 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-pill border border-border bg-card/70 text-primary">
              <Icon name={item.icon} className="size-5" />
            </span>
            <p className="mt-2 text-xs leading-5 font-semibold text-foreground">{item.title}</p>
            <p className="text-xs leading-5 text-foreground-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </AuthStage>
  );
}
