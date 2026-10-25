import { AuthStage } from "@/features/auth/components/auth-stage";
import { LoginForm } from "@/features/auth/components/login-form";
import { Icon, type IconName } from "@/shared/ui/icon";

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "قرارداد رسمی", text: "و معتبر" },
  { icon: "clock", title: "تسویه حداکثر", text: "۲ ماه" },
  { icon: "chart", title: "فروش برق با", text: "نرخ بورس سبز" },
];

export function LoginScreen() {
  return (
    <AuthStage>
      <LoginForm />
      <ul className="mt-6 grid grid-cols-3 gap-3 border-t border-white/45 pt-5">
        {benefits.map((item) => (
          <li key={item.title} className="text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full border border-white/60 bg-white/45 text-primary">
              <Icon name={item.icon} className="size-5" />
            </span>
            <p className="mt-2 text-xs leading-5 font-semibold text-foreground">{item.title}</p>
            <p className="text-xs leading-5 text-muted-foreground">{item.text}</p>
          </li>
        ))}
      </ul>
    </AuthStage>
  );
}
