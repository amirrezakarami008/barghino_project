# برق ما — سامانه آنلاین خرید برق

فرانت‌اند حرفه‌ای و مدرن برای پلتفرم [برق ما](https://bargheto.com/) با Next.js 15، TypeScript و Tailwind CSS v4.

## ویژگی‌ها

- **Next.js 15** با App Router و Turbopack
- **TypeScript** با تایپ‌های strict
- **Tailwind CSS v4** با طراحی RTL و فونت Vazirmatn
- **معماری تمیز** — جداسازی داده، UI و بخش‌ها
- **کامپوننت‌های قابل استفاده مجدد** — بدون تکرار کد
- **طراحی مدرن** — گرادیان، Glass morphism، انیمیشن‌های ظریف

## ساختار پروژه

```
src/
├── app/              # صفحات و layout
├── components/
│   ├── layout/       # Header, Footer
│   ├── sections/     # بخش‌های صفحه اصلی
│   └── ui/           # کامپوننت‌های پایه
├── lib/
│   ├── constants/    # داده‌های استاتیک
│   ├── icons.ts      # رجیstry آیکون‌ها
│   └── utils.ts      # توابع کمکی
└── types/            # TypeScript interfaces
```

## اجرا

```bash
npm install
npm run dev
```

سایت روی [http://localhost:3000](http://localhost:3000) در دسترس است.

## بیلد

```bash
npm run build
npm start
```

## اصول طراحی کد

- **Single Responsibility**: هر کامپوننت یک وظیفه
- **Open/Closed**: variantها از طریق props
- **Dependency Inversion**: بخش‌ها به constants وابسته‌اند، نه داده hardcode
