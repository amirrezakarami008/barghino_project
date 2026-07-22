# برق ما — سامانه آنلاین خرید برق

فرانت‌اند پلتفرم [برق ما](https://bargheto.com/) با **Next.js 16**، TypeScript و Tailwind CSS v4.

## معماری

Hybrid feature-based:

```
src/
├── app/                 # فقط routing و layout (نازک)
├── features/
│   ├── auth/            # احراز هویت (scaffold)
│   ├── marketing/       # سایت مارکتینگ
│   └── dashboard/       # پنل کاربری
├── shared/
│   ├── ui/              # کامپوننت‌های پایه
│   ├── layout/          # Header / Footer
│   ├── lib/             # utils، icons
│   ├── constants/       # دارایی مشترک (مثلاً تصاویر)
│   └── types/
├── config/              # سایت و env
└── proxy.ts             # محافظت route (Next 16)
```

**قوانین:**
- صفحات در `app/` فقط shell هستند؛ منطق دامنه در `features/`
- featureها از `shared` و `config` استفاده می‌کنند، نه مستقیم از یکدیگر
- داده mock فعلی داخل همان feature است و بعداً با API جایگزین می‌شود

## اجرا

```bash
pnpm install
pnpm dev
```

سایت روی [http://localhost:3000](http://localhost:3000)

## اسکریپت‌ها

| دستور | کاربرد |
|--------|--------|
| `pnpm dev` | توسعه (Turbopack پیش‌فرض در Next 16) |
| `pnpm build` | بیلد پروداکشن |
| `pnpm start` | اجرای بیلد |
| `pnpm lint` | ESLint |

## نیازمندی‌ها

- Node.js **20.9+**
- pnpm
