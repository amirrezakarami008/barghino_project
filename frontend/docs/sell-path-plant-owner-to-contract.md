# مسیر فروش برق — از صاحب نیروگاه تا قرارداد فعال

مستند کامل روند کاری و APIهایی که فرانت (پنل کاربر و پنل ادمین) باید صدا بزند.

- Base URL: `/api/v1`
- Auth: هدر `Authorization: Bearer <access_token>`
- شناسه‌های عمومی: همیشه `uuid`
- لیست‌ها صفحه‌بندی‌شده‌اند: `{ "count", "next", "previous", "results" }` (پیش‌فرض `page_size=20`)
- خطای استاندارد:

```json
{
  "error": {
    "code": "validation_error",
    "detail": "..."
  }
}
```

---

## نمای کلی روند

```
ثبت‌نام (path=sell)
  → تکمیل/چک هویت
  → ثبت انشعاب (branch)  → تایید ادمین
  → ثبت نیروگاه (plant)  → تایید ادمین
  → انتخاب پلن فروش
  → ساخت پیش‌نویس قرارداد (draft)
  → آپلود مدارک + امضا      → pending
  → بررسی شرکت (ادمین)     → active  یا  cancelled
  → (نزدیک انقضا) درخواست تمدید → تایید ادمین
  → انقضای خودکار (سیستمی) → expired
```

---

## فاز ۰ — ثبت‌نام و ورود (صاحب نیروگاه / مسیر sell)

کاربر باید با `path=sell` ثبت‌نام کند.

### ۰.۱ درخواست OTP ثبت‌نام

`POST /api/v1/auth/register/`

```json
{
  "phone": "09123456789",
  "account_type": "individual",
  "path": "sell",
  "terms_accepted": true,
  "first_name": "علی",
  "last_name": "محمدی",
  "national_id": "0012345678"
}
```

برای حقوقی (`account_type: "legal"`):

```json
{
  "phone": "09123456789",
  "account_type": "legal",
  "path": "sell",
  "terms_accepted": true,
  "company_name": "شرکت نمونه",
  "company_national_id": "12345678901",
  "representative_first_name": "علی",
  "representative_last_name": "محمدی",
  "representative_national_id": "0012345678",
  "registration_number": "",
  "economic_code": ""
}
```

**200:** `{ "detail": "..." }` — کد OTP ارسال شد.

### ۰.۲ تایید ثبت‌نام

`POST /api/v1/auth/register/verify/`

```json
{
  "phone": "09123456789",
  "code": "123456"
}
```

**200:**

```json
{
  "access": "...",
  "refresh": "...",
  "user": { /* UserSerializer */ }
}
```

### ۰.۳ ورود بعدی (OTP)

1. `POST /api/v1/auth/otp/request/` → `{ "phone": "09..." }`
2. `POST /api/v1/auth/otp/verify/` → `{ "phone": "09...", "code": "123456" }` → همان token pair

### ۰.۴ پروفایل و آمادگی هویت برای قرارداد

`GET /api/v1/auth/me/`

قبل از امضای قرارداد، `identity_profile_completion.is_complete` باید `true` باشد.

نمونه فیلدهای مهم:

```json
{
  "uuid": "...",
  "phone": "09123456789",
  "account_type": "individual",
  "path": "sell",
  "role": "user",
  "identity_profile": {
    "kind": "individual",
    "first_name": "علی",
    "last_name": "محمدی",
    "national_id": "0012345678",
    "birth_certificate_number": "12345",
    "date_of_birth": "1990-01-01"
  },
  "identity_profile_completion": {
    "is_complete": true,
    "missing_fields": []
  }
}
```

ویرایش مشخصات (در صورت نیاز): `PUT/PATCH /api/v1/auth/me/`

حقیقی:

```json
{
  "first_name": "علی",
  "last_name": "محمدی",
  "birth_certificate_number": "12345",
  "date_of_birth": "1990-01-01"
}
```

حقوقی:

```json
{
  "first_name": "علی",
  "last_name": "محمدی",
  "representative_birth_certificate_number": "12345",
  "representative_date_of_birth": "1990-01-01"
}
```

> شماره ملی / نوع حساب / path از این endpoint عوض نمی‌شود. شماره شناسنامه و تاریخ تولد روی پروفایل هویت (`IndividualProfile` / `LegalProfile`) هستند؛ در `identity_profile_completion` اجباری نیستند. تاریخ آینده رد می‌شود. برای امضا فقط شماره شناسنامه لازم است.

---

## فاز ۱ — ثبت انشعاب (Branch)

انشعاب = کنتور/آدرس خانگی که نیروگاه به آن وصل است.  
وضعیت‌ها: `pending` → `active` | `inactive`

### ۱.۱ کاربر — ثبت انشعاب

`POST /api/v1/branches/`

```json
{
  "name": "منزل اصلی",
  "meter_number": "1234567890",
  "address": "تهران، خیابان نمونه"
}
```

**201:**

```json
{
  "uuid": "...",
  "owner_uuid": "...",
  "owner_phone": "09123456789",
  "name": "منزل اصلی",
  "meter_number": "1234567890",
  "address": "تهران، خیابان نمونه",
  "status": "pending",
  "reviewed_at": null,
  "reviewed_by_uuid": null,
  "review_decision": "",
  "review_note": "",
  "created_at": "...",
  "updated_at": "..."
}
```

سایر APIهای کاربر:

| متد | مسیر | کار |
|-----|------|-----|
| `GET` | `/api/v1/branches/` | لیست انشعاب‌های من |
| `GET` | `/api/v1/branches/{uuid}/` | جزئیات |
| `PATCH` / `PUT` | `/api/v1/branches/{uuid}/` | ویرایش (تغییر داده دوباره به `pending` می‌برد) |
| `DELETE` | `/api/v1/branches/{uuid}/` | soft-delete (اگر plant فعال داشته باشد fail می‌شود) |

### ۱.۲ ادمین — تایید انشعاب

| متد | مسیر | کار |
|-----|------|-----|
| `GET` | `/api/v1/staff/branches/` | صف انشعاب‌های `pending` |
| `POST` | `/api/v1/staff/branches/{uuid}/review/` | تایید / رد |

Body تایید:

```json
{ "decision": "approved", "reason": "" }
```

Body رد (دلیل اجباری):

```json
{ "decision": "rejected", "reason": "شماره کنتور نامعتبر است" }
```

- `approved` → `status: "active"`
- `rejected` → `status: "inactive"`

**شرط جلو رفتن:** انشعاب باید `active` باشد تا بعداً قرارداد ساخته شود و نیروگاه هم بتواند تایید نهایی بگیرد.

---

## فاز ۲ — ثبت نیروگاه (Plant)

نیروگاه روی یک انشعاب متعلق به همان کاربر ساخته می‌شود.  
وضعیت‌ها: `pending` → `active` | `inactive`

### ۲.۱ کاربر — ثبت نیروگاه

`POST /api/v1/plants/`

```json
{
  "branch_uuid": "<uuid انشعاب تاییدشده یا در انتظار>",
  "name": "نیروگاه پشت‌بام",
  "address": "تهران، خیابان نمونه",
  "capacity_kwp": 5.5,
  "commissioned_at": "2024-06-01"
}
```

`commissioned_at` اختیاری است.

**201:** `status: "pending"`

سایر APIهای کاربر:

| متد | مسیر | کار |
|-----|------|-----|
| `GET` | `/api/v1/plants/` | لیست نیروگاه‌های من |
| `GET` | `/api/v1/plants/{uuid}/` | جزئیات |
| `PATCH` / `PUT` | `/api/v1/plants/{uuid}/` | ویرایش (دوباره `pending`) |
| `DELETE` | `/api/v1/plants/{uuid}/` | soft-delete |

نمونه پاسخ:

```json
{
  "uuid": "...",
  "owner_uuid": "...",
  "owner_phone": "09123456789",
  "branch_uuid": "...",
  "name": "نیروگاه پشت‌بام",
  "address": "تهران، خیابان نمونه",
  "capacity_kwp": 5.5,
  "commissioned_at": "2024-06-01",
  "status": "pending",
  "reviewed_at": null,
  "reviewed_by_uuid": null,
  "review_decision": "",
  "review_note": "",
  "created_at": "...",
  "updated_at": "..."
}
```

### ۲.۲ ادمین — تایید نیروگاه

| متد | مسیر | کار |
|-----|------|-----|
| `GET` | `/api/v1/staff/plants/` | صف نیروگاه‌های `pending` |
| `POST` | `/api/v1/staff/plants/{uuid}/review/` | تایید / رد |

Body مثل انشعاب: `{ "decision": "approved"|"rejected", "reason": "..." }`

تأیید نیروگاه به وضعیت انشعاب وابسته نیست؛ ادمین می‌تواند نیروگاه را مستقل تأیید کند.

- `approved` → `status: "active"`
- `rejected` → `status: "inactive"`

**شرط جلو رفتن برای قرارداد:** هم `branch.status=active` و هم `plant.status=active`.

---

## فاز ۳ — انتخاب پلن فروش

پلن‌های فعال کاتالوگ را کاربر می‌بیند؛ شرایط پلن در لحظه ساخت قرارداد روی قرارداد snapshot می‌شود و بعداً با ویرایش پلن عوض نمی‌شود.

### ۳.۱ لیست پلن‌ها

`GET /api/v1/catalog/plans/`

کاربر عادی فقط پلن‌های `is_active=true` را می‌بیند.

نمونه آیتم:

```json
{
  "uuid": "...",
  "name": "Standard",
  "description": "...",
  "commitment_kwh": 100.5,
  "rate_toman_per_kwh": 10.25,
  "savings_text": "...",
  "benefits": [],
  "is_recommended": true,
  "is_active": true,
  "sort_order": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

جزئیات یک پلن: `GET /api/v1/catalog/plans/{uuid}/`

> مدیریت ساخت/ویرایش پلن توسط ادمین است (`POST/PATCH/DELETE` روی همین مسیرها با `IsStaff`) و جزء فلو کاربر نیست.

---

## فاز ۴ — قرارداد خرید برق

وضعیت‌های قرارداد:

| status | معنی |
|--------|------|
| `draft` | پیش‌نویس؛ هنوز امضا نشده |
| `pending` | امضا شده؛ منتظر بررسی شرکت |
| `active` | تایید شده و جاری |
| `cancelled` | رد شده توسط شرکت |
| `expired` | تاریخ پایان گذشته (سیستمی) |

`is_near_expiry`: فقط برای `active` وقتی `ends_on` در ۳۰ روز آینده باشد → `true`.

### ۴.۱ آمار داشبورد کاربر

`GET /api/v1/contracts/stats/`

**200:**

```json
{
  "draft": 0,
  "pending": 1,
  "active": 2,
  "expired": 0,
  "cancelled": 0
}
```

### ۴.۲ لیست قراردادهای من

`GET /api/v1/contracts/?status=active&q=Rooftop&page=1`

Query:
- `status` — یکی از وضعیت‌ها
- `q` — جستجو در عنوان، شماره قرارداد، نام نیروگاه، نام پلن، شماره کنتور

### ۴.۳ ساخت پیش‌نویس

`POST /api/v1/contracts/`

```json
{
  "plant_uuid": "<نیروگاه active>",
  "plan_uuid": "<پلن active>"
}
```

**201** — نمونه:

```json
{
  "uuid": "...",
  "title": "نیروگاه پشت‌بام — Standard",
  "note": "",
  "contract_number": null,
  "status": "draft",
  "starts_on": null,
  "ends_on": null,
  "is_near_expiry": false,
  "terms_version": "",
  "terms_sha256": "",
  "signed_at": null,
  "signature_file_uuid": null,
  "national_id_file_uuid": null,
  "signed_pdf_file_uuid": null,
  "review_decision": "",
  "reviewed_at": null,
  "reviewed_by_uuid": null,
  "review_note": "",
  "renewal_requested": false,
  "renewal_requested_at": null,
  "plant_uuid": "...",
  "plant_name": "نیروگاه پشت‌بام",
  "plant_capacity_kwp": 5.5,
  "branch_uuid": "...",
  "meter_number": "1234567890",
  "branch_address": "تهران، خیابان نمونه",
  "seller_identity": {
    "kind": "individual",
    "first_name": "علی",
    "last_name": "محمدی",
    "national_id": "0012345678"
  },
  "plan_uuid": "...",
  "plan_name": "Standard",
  "commitment_kwh": 100.5,
  "rate_toman_per_kwh": 10.25,
  "created_at": "...",
  "updated_at": "...",
  "history": [],
  "files": []
}
```

خطاهای رایج:
- انشعاب یا نیروگاه تایید نشده → `400`
- نیروگاه مال کاربر نیست → `404`
- پلن غیرفعال → `400`

### ۴.۴ جزئیات قرارداد

`GET /api/v1/contracts/{uuid}/`

همان شکل `ContractSerializer` بالا. قرارداد دیگران → `404`.

---

## فاز ۵ — امضای قرارداد توسط فروشنده

فقط وقتی `status=draft`.

### ۵.۱ کار فرانت قبل از API امضا

1. سند قرارداد را با داده‌های draft + هویت نمایش بده.
2. نسخه سند را به عنوان `terms_version` نگه دار (مثلاً `v1`).
3. از محتوای نمایش‌داده‌شده **SHA-256** بگیر → `terms_sha256` (۶۴ کاراکتر hex).
4. سه فایل private آپلود کن.

### ۵.۲ آپلود فایل‌ها

`POST /api/v1/files/` — `multipart/form-data`

| فایل | `purpose` | نوع مجاز |
|------|-----------|----------|
| تصویر امضا | `contract` | PNG / JPEG / WebP |
| کارت ملی | `national_id` | PNG / JPEG / WebP / PDF |
| PDF امضاشده | `contract` | فقط PDF |

همه با `visibility=private` (پیش‌فرض).

```
file: <binary>
purpose: contract
visibility: private
```

**201:**

```json
{
  "uuid": "...",
  "original_name": "sig.png",
  "content_type": "image/png",
  "size_bytes": 1234,
  "purpose": "contract",
  "visibility": "private",
  "url": "...",
  "url_expires_at": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

هر `uuid` فایل فقط یک‌بار روی یک قرارداد قابل استفاده است.

### ۵.۳ ارسال امضا

`POST /api/v1/contracts/{uuid}/sign/`

```json
{
  "accepted_terms": true,
  "terms_version": "v1",
  "terms_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "signature_file_uuid": "<از آپلود امضا>",
  "national_id_file_uuid": "<از آپلود کارت ملی>",
  "signed_pdf_file_uuid": "<از آپلود PDF>"
}
```

**200:**
- `status` → `pending`
- `signed_at` پر می‌شود
- سه فایل در `files` ظاهر می‌شوند (`signed` + دو `attachment`)
- رکورد history با `event_type: "signed"`

پیش‌نیازها برای موفقیت:
- هویت کامل (`identity_profile`)
- branch و plant هنوز `active`
- `accepted_terms` دقیقاً `true`

اگر قرارداد رد شود (`cancelled`)، **همان قرارداد دوباره امضا نمی‌شود**؛ کاربر draft جدید می‌سازد.

---

## فاز ۶ — بررسی شرکت (ادمین)

### ۶.۱ صف قراردادهای امضاشده

`GET /api/v1/staff/contracts/`

قراردادهای `pending` با `review_decision=""`.

### ۶.۲ مشاهده فایل‌های پیوست

کاربر مالک:

- `GET /api/v1/contracts/{uuid}/files/`
- `GET /api/v1/contracts/{uuid}/files/{file_uuid}/` → `{ access_url, url_expires_at, ... }`

ادمین هم می‌تواند همان endpoint دسترسی فایل را بزند (`is_staff` اجازه می‌دهد حتی اگر مالک نباشد).

نمونه دسترسی فایل:

```json
{
  "uuid": "...",
  "kind": "signed",
  "version": 1,
  "stored_file_uuid": "...",
  "original_name": "signed.pdf",
  "content_type": "application/pdf",
  "size_bytes": 10240,
  "access_url": "https://...",
  "url_expires_at": "2026-11-03T21:00:00+00:00"
}
```

`kind`: `system` | `signed` | `attachment` | `amendment`

### ۶.۳ تایید یا رد

`POST /api/v1/staff/contracts/{uuid}/review/`

تایید:

```json
{ "decision": "approved", "reason": "" }
```

**200 بعد از تایید:**
- `status: "active"`
- `contract_number`: مثل `BRG-...`
- `starts_on`: امروز (اگر خالی بود)
- `ends_on`: شروع + ۱ سال
- `review_decision: "approved"`
- history با `event_type: "approved"`

رد:

```json
{ "decision": "rejected", "reason": "تصویر کارت ملی خوانا نیست" }
```

**200 بعد از رد:**
- `status: "cancelled"`
- `review_decision: "rejected"`
- `review_note`: دلیل
- history با `event_type: "rejected"`

`rejected` بدون reason → `400`.

---

## فاز ۷ — تمدید قرارداد

معمولاً وقتی `is_near_expiry=true` (۳۰ روز مانده به `ends_on`).

### ۷.۱ کاربر — درخواست تمدید

`POST /api/v1/contracts/{uuid}/renewal/`

بدون body. فقط برای `active` و وقتی هنوز درخواست باز ندارد.

**200:** `renewal_requested: true`, `renewal_requested_at` ست می‌شود.

### ۷.۲ ادمین — صف و پردازش

| متد | مسیر | کار |
|-----|------|-----|
| `GET` | `/api/v1/staff/contracts/renewals/` | قراردادهای active با درخواست تمدید |
| `POST` | `/api/v1/staff/contracts/{uuid}/renewal/` | اعمال تمدید |

پردازش بدون body:
- `ends_on` از تاریخ پایان فعلی (یا امروز اگر گذشته) + ۱ سال
- `renewal_requested` پاک می‌شود
- history با `event_type: "renewed"`

---

## فاز ۸ — انقضا (سیستمی)

API فرانت برای expire کردن وجود ندارد.  
job بک‌اند قراردادهای `active` با `ends_on < امروز` را `expired` می‌کند و پرچم تمدید را پاک می‌کند.

فرانت فقط `status=expired` را در لیست/جزئیات نشان می‌دهد.

---

## جدول خلاصه APIها به ترتیب فلو

### پنل کاربر

| # | مرحله | متد | مسیر |
|---|--------|-----|------|
| 1 | ثبت‌نام | `POST` | `/auth/register/` |
| 2 | تایید ثبت‌نام | `POST` | `/auth/register/verify/` |
| 3 | پروفایل | `GET` | `/auth/me/` |
| 4 | ثبت انشعاب | `POST` | `/branches/` |
| 5 | پیگیری انشعاب | `GET` | `/branches/{uuid}/` |
| 6 | ثبت نیروگاه | `POST` | `/plants/` |
| 7 | پیگیری نیروگاه | `GET` | `/plants/{uuid}/` |
| 8 | لیست پلن‌ها | `GET` | `/catalog/plans/` |
| 9 | آمار قرارداد | `GET` | `/contracts/stats/` |
| 10 | ساخت draft | `POST` | `/contracts/` |
| 11 | جزئیات قرارداد | `GET` | `/contracts/{uuid}/` |
| 12 | آپلود مدارک (×۳) | `POST` | `/files/` |
| 13 | امضا | `POST` | `/contracts/{uuid}/sign/` |
| 14 | لیست فایل‌ها | `GET` | `/contracts/{uuid}/files/` |
| 15 | دانلود/پیش‌نمایش | `GET` | `/contracts/{uuid}/files/{file_uuid}/` |
| 16 | درخواست تمدید | `POST` | `/contracts/{uuid}/renewal/` |
| — | لیست قراردادها | `GET` | `/contracts/?status=&q=` |

### پنل ادمین

| # | مرحله | متد | مسیر |
|---|--------|-----|------|
| A1 | صف انشعاب | `GET` | `/staff/branches/` |
| A2 | تایید/رد انشعاب | `POST` | `/staff/branches/{uuid}/review/` |
| A3 | صف نیروگاه | `GET` | `/staff/plants/` |
| A4 | تایید/رد نیروگاه | `POST` | `/staff/plants/{uuid}/review/` |
| A5 | صف بررسی قرارداد | `GET` | `/staff/contracts/` |
| A6 | پیش‌نمایش فایل | `GET` | `/contracts/{uuid}/files/{file_uuid}/` |
| A7 | تایید/رد قرارداد | `POST` | `/staff/contracts/{uuid}/review/` |
| A8 | صف تمدید | `GET` | `/staff/contracts/renewals/` |
| A9 | اعمال تمدید | `POST` | `/staff/contracts/{uuid}/renewal/` |

همه مسیرهای بالا زیر `/api/v1` هستند. endpointهای `/staff/...` نیاز به کاربر با `is_staff=true` دارند؛ در غیر این صورت `403`.

---

## History قرارداد

در پاسخ جزئیات قرارداد، آرایه `history` رویدادهای lifecycle را نگه می‌دارد:

| `event_type` | معنی |
|--------------|------|
| `signed` | امضای فروشنده |
| `approved` | تایید شرکت |
| `rejected` | رد شرکت |
| `renewal_requested` | درخواست تمدید |
| `renewed` | تمدید توسط شرکت |
| `expired` | انقضای سیستمی |

هر آیتم:

```json
{
  "uuid": "...",
  "event_type": "signed",
  "from_status": "draft",
  "to_status": "pending",
  "actor_uuid": "...",
  "details": {},
  "created_at": "..."
}
```

---

## چک‌لیست فرانت برای صفحه «ساخت و امضای قرارداد»

1. `GET /auth/me/` → هویت کامل است؟
2. `GET /plants/` → حداقل یک نیروگاه `active` با انشعاب `active`
3. `GET /catalog/plans/` → انتخاب پلن
4. `POST /contracts/` → گرفتن `uuid` draft
5. نمایش سند + محاسبه `terms_sha256`
6. سه آپلود به `/files/`
7. `POST /contracts/{uuid}/sign/`
8. نمایش وضعیت `pending` تا تصمیم ادمین
9. اگر `cancelled` → نمایش `review_note` و هدایت به ساخت draft جدید
10. اگر `active` و `is_near_expiry` → دکمه تمدید

---

## نکات مهم برای پیاده‌سازی UI

- کاربر نمی‌تواند خودش `status` انشعاب/نیروگاه/قرارداد را عوض کند؛ فقط از طریق فلوهای بالا و تصمیم ادمین جابه‌جا می‌شود.
- تغییر انشعاب یا نیروگاه بعد از ثبت، معمولاً دوباره آن‌ها را به `pending` برمی‌گرداند.
- رد قرارداد نسخه امضاشده را می‌بندد (`cancelled`)؛ اصلاح داده + draft جدید لازم است.
- `terms_sha256` را بک‌اند محاسبه نمی‌کند؛ فرانت مسئول digest سند نمایش‌داده‌شده است.
- پول و انرژی در API عدد هستند (`commitment_kwh`, `rate_toman_per_kwh`, `capacity_kwp`)، نه string.

---

## وضعیت پیاده‌سازی فرانت (نسبت به بک‌اند فعلی)

پیاده‌سازی شده با سیستم طراحی Solar Aurora:

- فاز ۰–۴: ثبت‌نام `path=sell`، انشعاب/نیروگاه در ویزارد قرارداد، پلن، ساخت draft، لیست/جزئیات
- فاز ۵: سند کلاینت `v1` + SHA-256 + آپلود امضا/کارت ملی/PDF + نشانی امضا؛ شماره شناسنامه از پروفایل (نه در body امضا)
- پروفایل: `PUT/PATCH /auth/me/` — حقیقی: `birth_certificate_number` / `date_of_birth`؛ حقوقی: `representative_*`
- ادمین: صف بررسی انشعاب/نیروگاه/قرارداد + صف تمدید (`GET/POST staff/contracts/.../renewal`)

هنوز به APIهای سند وابسته‌اند و تا موجود بودن بک‌اند صدا زده نمی‌شوند:

- `GET /contracts/stats/` و فیلتر سروری `status`/`q`
- تمدید سمت کاربر (`POST /contracts/{uuid}/renewal/`)
- `GET /contracts/{uuid}/files/`
)
