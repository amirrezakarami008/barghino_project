import type { ContentSection } from "@/types";

export const ABOUT_PAGE = {
  meta: {
    title: "درباره ما",
    description: "آشنایی با برق ما — اولین سامانه آنلاین خرید برق در ایران",
    badge: "درباره برق ما",
  },
  hero: {
    title: "درباره برق ما",
    description:
      "برق ما با توسعه یک پلتفرم آنلاین و هوشمند، زیرساختی یکپارچه برای تنظیم قراردادهای شخصی‌سازی‌شده خرید برق فراهم کرده است.",
  },
  mission: {
    title: "ماموریت ما",
    description:
      "تبدیل فرایند پیچیده تامین برق به یک تصمیم دقیق، شفاف و هوشمند برای تمام مصرف‌کنندگان ایران.",
  },
  values: [
    { title: "شفافیت", description: "قراردادها و تعرفه‌های روشن بدون هزینه پنهان" },
    { title: "تخصص", description: "تیم متخصص انرژی، فنی و حقوقی" },
    { title: "نوآوری", description: "فناوری پیشرفته برای مدیریت هوشمند انرژی" },
    { title: "پایداری", description: "ترویج انرژی پاک و بهینه‌سازی مصرف" },
  ],
  timeline: [
    { year: "۱۴۰۲", title: "راه‌اندازی", description: "شروع فعالیت به عنوان اولین سامانه آنلاین خرید برق" },
    { year: "۱۴۰۳", title: "رشد", description: "جذب بیش از ۵۰۰ مشترک صنعتی و تجاری" },
    { year: "۱۴۰۴", title: "توسعه", description: "افزودن خدمات تجدیدپذیر و بهینه‌سازی" },
    { year: "۱۴۰۵", title: "بلوغ", description: "بیش از ۱۵۰۰ مشترک فعال در سراسر کشور" },
  ],
  licenses: [
    "پروانه خرده‌فروشی برق از وزارت نیرو",
    "عضو سندیکای صنعت برق ایران",
    "عضو سازمان نظام صنفی رایانه‌ای",
    "عضو ساتکا",
  ],
} as const;

export const CONTACT_PAGE = {
  meta: {
    title: "تماس با ما",
    description: "راه‌های ارتباطی با برق ما — تلفن، ایمیل و فرم تماس",
    badge: "تماس",
  },
  hero: {
    title: "تماس با ما",
    description: "تیم برق ما آماده پاسخگویی به سوالات شما درباره خدمات تامین برق است.",
  },
  offices: [
    {
      title: "دفتر مرکزی",
      address: "تهران، خیابان ولیعصر، برج انرژی، طبقه ۱۲",
      phone: "۰۲۱-۴۴۰۰۰۶۶۴",
      hours: "شنبه تا چهارشنبه ۸ تا ۱۷",
    },
  ],
  subjects: [
    { label: "مشاوره خرید برق", value: "consulting" },
    { label: "پشتیبانی فنی", value: "support" },
    { label: "همکاری تجاری", value: "partnership" },
    { label: "سایر", value: "other" },
  ],
} as const;

export const LEGAL_PAGES: Record<string, { meta: { title: string; description: string }; sections: ContentSection[] }> = {
  terms: {
    meta: {
      title: "شرایط و ضوابط",
      description: "شرایط استفاده از خدمات برق ما",
    },
    sections: [
      {
        id: "s1",
        title: "پذیرش شرایط",
        paragraphs: [
          "با استفاده از سامانه برق ما، شما شرایط و ضوابط زیر را می‌پذیرید. لطفاً قبل از ثبت‌نام این متن را با دقت مطالعه کنید.",
        ],
      },
      {
        id: "s2",
        title: "خدمات",
        paragraphs: [
          "برق ما خدمات تامین برق، مشاوره انرژی و بهینه‌سازی مصرف را مطابق قوانین بازار برق ایران ارائه می‌دهد.",
        ],
      },
      {
        id: "s3",
        title: "مسئولیت کاربر",
        paragraphs: [
          "کاربر موظف است اطلاعات صحیح و به‌روز ارائه دهد. ارائه اطلاعات نادرست می‌تواند منجر به لغو قرارداد شود.",
        ],
      },
      {
        id: "s4",
        title: "تغییر شرایط",
        paragraphs: [
          "برق ما حق تغییر این شرایط را با اطلاع‌رسانی قبلی محفوظ می‌دارد.",
        ],
      },
    ],
  },
  privacy: {
    meta: {
      title: "حریم خصوصی",
      description: "سیاست حفظ حریم خصوصی کاربران برق ما",
    },
    sections: [
      {
        id: "s1",
        title: "جمع‌آوری اطلاعات",
        paragraphs: [
          "برق ما اطلاعات هویتی، تماس و مصرف برق شما را صرفاً برای ارائه خدمات جمع‌آوری می‌کند.",
        ],
      },
      {
        id: "s2",
        title: "استفاده از اطلاعات",
        paragraphs: [
          "اطلاعات شما برای عقد قرارداد، پشتیبانی و بهبود خدمات استفاده می‌شود و به اشخاص ثالث فروخته نمی‌شود.",
        ],
      },
      {
        id: "s3",
        title: "امنیت",
        paragraphs: [
          "ما از استانداردهای امنیتی برای محافظت از داده‌های شما استفاده می‌کنیم.",
        ],
      },
      {
        id: "s4",
        title: "حقوق کاربر",
        paragraphs: [
          "شما می‌توانید درخواست دسترسی، اصلاح یا حذف اطلاعات خود را از طریق پشتیبانی ثبت کنید.",
        ],
      },
    ],
  },
};

export const AUTH_PAGES = {
  login: {
    title: "ورود به حساب کاربری",
    description: "به پنل مدیریت برق خود دسترسی پیدا کنید",
    fields: [
      { name: "phone", label: "شماره موبایل", type: "tel" as const, placeholder: "۰۹۱۲۳۴۵۶۷۸۹", required: true },
      { name: "password", label: "رمز عبور", type: "password" as const, placeholder: "رمز عبور خود را وارد کنید", required: true },
    ],
    submitLabel: "ورود",
    alternateLabel: "حساب کاربری ندارید؟",
    alternateHref: "/register",
    alternateLinkText: "ثبت‌نام کنید",
  },
  register: {
    title: "ثبت‌نام در برق ما",
    description: "در کمتر از ۳ دقیقه برق خود را تامین کنید",
    fields: [
      { name: "fullName", label: "نام و نام خانوادگی", type: "text" as const, placeholder: "نام کامل", required: true },
      { name: "phone", label: "شماره موبایل", type: "tel" as const, placeholder: "۰۹۱۲۳۴۵۶۷۸۹", required: true },
      { name: "nationalId", label: "کد ملی", type: "text" as const, placeholder: "کد ملی ۱۰ رقمی", required: true },
      { name: "password", label: "رمز عبور", type: "password" as const, placeholder: "حداقل ۸ کاراکتر", required: true },
    ],
    submitLabel: "ثبت‌نام",
    alternateLabel: "قبلاً ثبت‌نام کرده‌اید؟",
    alternateHref: "/login",
    alternateLinkText: "وارد شوید",
  },
} as const;
