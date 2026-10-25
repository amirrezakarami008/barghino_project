const messages: Record<string, string> = {
  "Enter a valid Iranian mobile number.": "شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.",
  "Enter the 6-digit code.": "کد شش‌رقمی پیامک را وارد کنید.",
  "The code is invalid or has expired.": "کد نادرست است یا مهلتش تمام شده.",
  "Too many attempts. Request a new code.": "تعداد تلاش‌ها تمام شد. کد تازه‌ای بگیرید.",
  "Too many code requests. Try again later.": "درخواست کد زیاد شده است. کمی بعد دوباره تلاش کنید.",
  "You must accept the terms.": "پذیرفتن شرایط برای ثبت‌نام لازم است.",
  "First name and last name are required.": "نام و نام خانوادگی را وارد کنید.",
  "Company name and the representative's name are required.": "نام شرکت و نام نماینده را وارد کنید.",
  "Enter a valid Iranian national ID.": "کد ملی معتبر نیست.",
  "A profile with this national ID already exists.": "این کد ملی قبلاً ثبت شده است.",
  "Enter a valid 11-digit company national ID.": "شناسه ملی شرکت معتبر نیست.",
  "A company with this national ID already exists.": "این شناسه ملی شرکت قبلاً ثبت شده است.",
  "A user with this phone already exists.": "با این شماره قبلاً حساب ساخته شده است.",
  "This registration can no longer be completed.": "این ثبت‌نام دیگر قابل تکمیل نیست. دوباره از اول شروع کنید.",
  "Request was throttled.": "درخواست‌ها زیاد شده است. کمی بعد دوباره تلاش کنید.",
};

export function translateApiMessage(value: string) {
  return messages[value] ?? "این مقدار پذیرفته نشد.";
}
