# UI/UX & Frontend Audit — Barqino

## 0. Meta

| Field | Value |
| --- | --- |
| Date | 2026-11-02 (UTC) |
| Commit | `181772e8769911b1ab1422934f4a5a7b51924706` (`181772e`) |
| Scope | **all** (public site, auth, customer panel, admin panel, `/design`) |
| Environment | Linux; Node v24.19.0 via nvm; frontend Next.js 16.4.3; `pnpm` from nvm |
| Working tree note | Dirty: `frontend/src/shared/theme/theme-toggle.tsx` modified (uncommitted) |

### Tools actually run

| Tool | Result |
| --- | --- |
| `eslint .` (frontend) | **18 errors, 2 warnings** (verbatim summary below) |
| `tsc --noEmit` | **Clean** (exit 0, no diagnostics) |
| `next build` | Compile + TS + 42/42 static pages **succeeded**; finalize failed with `Error: kill EACCES` (environment; not an app type error) |
| Contrast script | `/tmp/barghino-contrast.txt` — measured from `tokens.css` hex values |
| Static scans | Hardcoded colors, physical direction, arbitrary values, tiny text, type escapes, console/XSS patterns, Arabic ye/kaf, ZWNJ heuristics, Latin digits |
| Chrome headless screenshots | Partial — see §4 |
| axe-core | **Not verified** — CDN fetch `cdnjs.cloudflare.com` failed (`ENOTFOUND`) in audit environment |
| Lighthouse mobile | **Not run** — CLI not available; Playwright install blocked by npm proxy |

### ESLint (verbatim counts)

```
✖ 20 problems (18 errors, 2 warnings)
```

Error locations:

- `src/components/ui/alert.tsx:129` — setState in effect
- `src/features/admin/admin-dashboard.tsx:26` — setState in effect
- `src/features/admin/admin-plans.tsx:89` — setState in effect
- `src/features/admin/admin-plants.tsx:57` — setState in effect
- `src/features/admin/admin-reviews.tsx:63`, `:243` — setState in effect
- `src/features/contracts/site-intake-step.tsx:228`, `:263`, `:287` — setState in effect; **`:1081` Cannot access refs during render**
- `src/features/contracts/site-review-edit-drawer.tsx:100` — setState in effect
- `src/features/contracts/site-review-step.tsx:144`, `:180` — setState in effect
- `src/features/marketing/reveal.tsx:23` — setState in effect
- `src/features/panel/panel-shell.tsx:49` — setState in effect
- `src/shared/layout/site-header.tsx:302`, `:451` — setState in effect
- `src/shared/theme/theme-toggle.tsx:19` — setState in effect

Warnings: `contracts-list.tsx:15` unused `faNumber`; `panel-home.tsx:10` unused `getPlants`.

### Static scan counts (outside `tokens.css` unless noted)

| Scan | Count | Notes |
| --- | --- | --- |
| `#[0-9a-fA-F]{3,8}` | **122** lines | Heaviest: `workspace-shell.css` (41), `admin-vibrant.css` (25), `contracts.css` (14), auth CSS |
| `rgba?(`/`hsla?(` | **73** | Mostly auth + workspace glass |
| Physical direction classes | **1** actionable | `object-left` in `home-hero.tsx:125` (`text-align: start` comment match ignored) |
| Arbitrary/`!important`/`style={{` | **29** | Includes reduced-motion `!important` (OK) + real inline styles |
| `text-xs` | **4** | Listed in TYP findings |
| Type escapes (`!` non-null) | **1** | `otp-input.tsx:66` |
| `dangerouslySetInnerHTML` | **1** | `theme-script.tsx` (theme boot; expected) |
| `target="_blank"` | **0** in `src/` | — |
| Arabic `ي`/`ك` in UI copy | **0** live strings | Only normalizers in search/journal |
| `می ` + space (ZWNJ heuristic) | **27** hits | Many false positives (`کمی`, `نمونه`); real misses listed under CPY |

### What could NOT be verified and why

- Full viewport×theme matrix (360–1536 × light/dark × all routes): Chrome CDP timed out / crashed after a few captures; npm Playwright browser download failed (proxy `FETCH_ERROR`).
- axe-core / Lighthouse scores: no axe CDN, no lighthouse binary.
- Panel/admin authenticated UI screenshots: require session; `RequireSession` redirects to `/login?next=…` — not exercised with credentials.
- Loading/empty/error visual states in browser: not reachable without API fixtures / network mocking.
- Glass-over-aurora contrast for muted text over photographic auth background: token glass-on-solid measured; photo backdrop is Suspected (see COL-010).
- iOS Safari input zoom / backdrop-filter / 3D flip: no device lab.

---

## 1. خلاصه اجرایی

امتیاز کلی **۴۸/۱۰۰**. سیستم توکن Solar Aurora و ریشهٔ RTL/`lang="fa"` و فونت وزیرمتن درست پایه‌گذاری شده، اما **دکمهٔ اصلی در تم روشن کنتراست AA را می‌شکند**، وضعیت‌های approved/active در لایت زیر ۳.۰ هستند، **شاخهٔ رنگی آبی قدیمی** هنوز در CSS پنل/ادمین زنده است (۱۲۲ هگز خارج از توکن)، اسکیپ‌لینک روی لاگین/ثبت‌نام به `#content` می‌خورد که وجود ندارد، و ESLint با ۱۸ خطا از جمله دسترسی به ref هنگام رندر روی مسیر قرارداد، قرمز است. صادقانه بودن کپی عموماً خوب است ولی «درباره ما» و مجلهٔ ادمین ادعاهای ساختگی دارند.

۱۰ بدترین: **COL-001, COL-002, A11-001, THM-001, ENG-001, CPY-001, CPY-002, BRW-001, UXF-001, CMP-001**.

---

## 2. Instructions for the AI that will fix this

- Read this whole file first. Work **batch by batch** (section 7), never everything at once.
- Do not change business logic, API contracts, or copy meaning unless a finding says so; follow all PROJECT RULES in the audit brief; tokens only; no new dependencies.
- For each finding: apply the exact fix, verify against its acceptance criteria, then tick its checkbox. Don't expand scope; if a fix is ambiguous or needs a product decision, don't guess: list the question under "Blocked" in your final message.
- After each batch run lint, tsc and build; they must pass. End each batch with a short changelog (IDs fixed, files touched, anything skipped and why).
- If a fix would regress something in "Do not touch" (section 8), stop and report.

---

## 3. Scorecard

| Cat | Score | Justification |
| --- | ---: | --- |
| A Color & theme | 3/10 | Primary CTA white-on-sun fails AA; status chips fail; 122 hex bypasses + blue workspace fork |
| B Typography | 6/10 | Vazirmatn + fa-IR OK; `text-xs`, caption 13px, `text-sm` inputs, kWh bare |
| C Spacing & layout | 6/10 | Token radii/space exist; arbitrary `max-w-[9rem]`, z-\[1\], mixed card radii |
| D Responsive | 5/10 | Mobile home/login look composed in shots; matrix incomplete; OTP/pills &lt;44px |
| E RTL | 7/10 | Root RTL solid; `object-left`; auth back arrow not mirrored; marketing arrows correctly `-scale-x-100` |
| F UX flows | 5/10 | Locked «به‌زودی» mostly OK; missing route loading/error; filter page-scoped; plant dead-end |
| G Forms | 5/10 | Design-system Input labeled; auth FaceField sr-only + placeholder |
| H Alerts | 6/10 | Alert system exists; permanent profile Alert; formError inconsistently announced |
| I Copy | 5/10 | Home honesty strong; About settlement claim; journal invented audit |
| J Motion | 5/10 | Tokens 160–250ms; flip 750ms, theme 500ms, auth enter 500ms |
| K Accessibility | 4/10 | Skip broken on auth; AA fails on primary/status; menu Escape missing |
| L Components | 4/10 | Dual Button (`components/ui` vs `shared/ui`); orphan admin/contracts CSS |
| M Engineering | 3/10 | 18 lint errors; ref-during-render; unused imports; no route error boundaries |
| N Performance & SEO | 5/10 | Local Vazirmatn good; missing page descriptions; no robots/sitemap; Lighthouse N/A |
| O Cross-browser | 4/10 | text-sm inputs → iOS zoom risk; auth 3D/backdrop Suspected Safari |

**Overall: 48/100**

---

## 4. Coverage matrix

Legend: ✓ checked (screenshot or code-proven) · ○ code-only · ✗ not checked · — N/A · R auth redirect

| Route | m/light | m/dark | d/light | d/dark | loading | empty | error | success |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | ✓ 360/390 | ✗ | ✗ | ✗ | ○ none | — | ○ none | — |
| `/login` | ✓ 360/390 | ✗ | ✗ | ✗ | ○ Suspense text | — | ○ form | ○ OTP |
| `/register` | ✗ | ✗ | ✗ | ✗ | ○ | — | ○ | ○ |
| `/services` | ✓ 390 | ✗ | ✗ | ✗ | ○ | — | ○ | — |
| `/learn` `/blog` `/contact` `/about` `/support` `/privacy` `/terms` | ○ | ✗ | ✗ | ✗ | ○ none | ○ | ○ | contact ✓ Alert |
| `/design` | ○ | ✗ | ✗ | ✗ | — | — | prod 404 | — |
| `/panel/*` | R | R | R | R | ○ client Skeleton some | ○ | ○ | ○ |
| `/admin/*` | R | R | R | R | ○ | ○ | ○ | ○ |
| Locked panel/admin pages | ○ code | ○ | ○ | ○ | — | LockedFeature | — | — |

Screenshots on disk: `docs/ui-audit/screenshots/home_light_360.png`, `home_light_390.png`, `login_light_360.png`, `login_light_390.png`, `services_light_390.png`.

---

## 5. Systemic issues

1. **Token bypass / dual palette (THM-001, THM-002, COL-003…)** — Feature CSS redefines `--primary` as blue (`#4263f7` / `#1762db`) and hardcodes hex. Fix once in shell/admin/contracts CSS; clears dozens of COL hits.
2. **Primary foreground strategy (COL-001)** — `--primary-foreground: #ffffff` on light sun-600/gradients fails AA. Decide ink-on-sun for light primary actions globally.
3. **Status semantic greens too light (COL-002)** — `--status-approved-fg` / `--status-active-fg` `#0e9f9a` on mint washes ≈3.0:1. Darken fg or darken bg once in tokens.
4. **No App Router `loading.tsx`/`error.tsx` (UXF-001)** — Affects every segment under `(public)`, `panel`, `admin`.
5. **Dual Button + orphan shells (CMP-001, ENG-002)** — `shared/ui/button` (solid primary, fails contrast) vs `components/ui/button` (grad-sun); `WorkspaceShell` blue CSS still in tree for non-user kinds.
6. **React Compiler lint debt (ENG-001)** — setState-in-effect pattern across shells/admin/contracts; one ref-during-render Blocker on intake.

---

## 6. Findings

### COL-001 · Critical · Color
- Where: `src/components/ui/button.tsx:11-12` (`bg-grad-sun text-primary-foreground`); also `shared/ui/button.tsx:6` (`bg-primary text-primary-foreground`); empty-state icon `empty-state.tsx:30`; routes `/`, `/services`, auth CTA uses separate `--auth-cta-foreground` (OK)
- Observed: Light `--primary-foreground` `#ffffff` on `--sun-600` `#ff7a18` = **2.61:1**; on `#ffb800` = **1.73:1**; on `#ff3d77` = **3.39:1**. All &lt; 4.5:1. Dark mode primary-fg on sun-400 = **11.30:1** PASS. Screenshot: `docs/ui-audit/screenshots/home_light_390.png` primary CTA.
- Why it matters: Every primary action in light mode fails WCAG 1.4.3 on the critical path (sell / login continue / submit).
- Fix: In `tokens.css` `:root`, set `--primary-foreground: var(--ink-900)` (or `#0b1020`). Update `Button` primary to `text-primary-foreground` (already) — ink on grad-sun mid/end: ink on `#ff7a18` **7.26:1**, on `#ffb800` **10.92:1**, on `#ff3d77` **5.58:1**. Keep dark `--primary-foreground: #070b1a`. Align `shared/ui/button` or delete it (CMP-001).
- Acceptance: Measured contrast of primary button label vs gradient stops ≥ 4.5:1 light+dark; visual check on `/` and `/login`.
- Effort: S · Depends on: —
- [x] Done

### COL-002 · Critical · Color
- Where: `src/styles/tokens.css:87-101` status approved/active; consumers `badge.tsx`, `status-pill.tsx`, `stat-card.tsx`, home hero sample status
- Observed: Light approved fg/bg `#0e9f9a` / `#e6faf2` = **3.00:1**; active `#0e9f9a` / `#e3faf8` = **2.99:1**. FAIL AA for normal text. Dark variants PASS (≥9:1).
- Why it matters: Contract/plant status is decision-critical; color+text both fail if text is unreadable.
- Fix: Darken fg to ≥ `#0b766e` (re-measure) or use `--energy-800` / `--ink-700` on washes; keep borders.
- Acceptance: status-approved and status-active fg/bg ≥ 4.5:1 in light.
- Effort: S · Depends on: —
- [x] Done

### COL-003 · Critical · Color / Theme
- Where: `src/components/ui/button.tsx` primary + accent usage; accent-fg white on `--volt-500` `#7c5cff` = **4.35:1** (large-only)
- Observed: `--accent-foreground: #ffffff` on `#7c5cff` is **4.35:1** — fails normal text AA (needs 4.5).
- Why it matters: Links/accent chips using white-on-volt fail for small text.
- Fix: Use `#ffffff` only for large/bold ≥18px, or darken volt fill to `#5b21b6` / use ink on volt-200 wash for small text.
- Acceptance: Any `text-accent-foreground` on `bg-accent` at body size ≥ 4.5:1.
- Effort: S · Depends on: —
- [x] Done

### A11-001 · Critical · Accessibility
- Where: `src/app/layout.tsx:35-40` skip link `href="#content"`; `src/features/auth/components/auth-shell.tsx` (no `id="content"`); unused `auth-stage.tsx:36` has id
- Observed: Public/panel shells expose `#content`. Live AuthShell does not. Skip “رفتن به محتوا” is a no-op on `/login` `/register`.
- Why it matters: Breaks WCAG 2.4.1 bypass block on auth critical path.
- Fix: Add `id="content" tabIndex={-1}` to `auth-shell__card-col` or flip-card wrapper; ensure focus moves on activate.
- Acceptance: Keyboard: Tab to skip → Enter → focus inside auth card on `/login` and `/register`.
- Effort: S · Depends on: —
- [x] Done

### THM-001 · Critical · Theme
- Where: `src/shared/layout/workspace-shell.css:10-62`, `:508-527`; imported by `workspace-shell.tsx` (still used when `WorkspaceFrame` kind ≠ `user`)
- Observed: Overrides Solar Aurora with blue slate: `--primary:#4263f7`, `--background:#eef2fa`, dark `--primary:#a9bdff`, plus panel-canvas `--primary:#1762db`. Violates tokens-only rule.
- Why it matters: Admin-via-legacy path and any non-user workspace renders a different brand; conflicts with marketing/panel AppShell.
- Fix: Delete semantic hex overrides; bind to `var(--background)` / `var(--primary)` / glass tokens from `tokens.css`. Remove Kufi `@font-face` (TYP-002).
- Acceptance: No hex semantic colors in `workspace-shell.css`; computed `--primary` matches tokens light/dark.
- Effort: L · Depends on: —
- [x] Done

### ENG-001 · Blocker · Engineering
- Where: `src/features/contracts/site-intake-step.tsx:1081` — ESLint: **Cannot access refs during render**; plus 17 setState-in-effect errors (see Meta)
- Observed: Lint fails CI-quality gate with 18 errors. Ref-during-render on contract create intake (core revenue flow).
- Why it matters: Unreliable render; blocks clean lint; intake is a Blocker path.
- Fix: Move ref read into event/effect; replace sync setState-in-effect with derived state / keyed reset / `queueMicrotask` only where external sync required. Clear unused imports.
- Acceptance: `pnpm lint` and `tsc --noEmit` clean; intake still saves draft.
- Effort: L · Depends on: —
- [x] Done

### CPY-001 · Critical · Copy
- Where: `src/app/(public)/about/page.tsx:16-17` — «تسویه سریع‌تر از مسیر طولانی دولتی، حداکثر دو ماه.»
- Observed: Absolute settlement timeline without «نمونه» / contract caveat. FAQ correctly hedges the same claim (`faq-list.tsx`).
- Why it matters: Honesty rule: no invented timelines presented as product fact.
- Fix: Align with FAQ: e.g. «نمونهٔ محصول حداکثر دو ماه را نشان می‌دهد؛ سررسید در قرارداد شماست.»
- Acceptance: About page cannot be read as a guaranteed SLA.
- Effort: S · Depends on: —
- [x] Done

### CPY-002 · Critical · Copy
- Where: `src/features/admin/admin-journal.tsx:44`, `:54` — status always «منتشرشده · فقط‌خواندنی»; audit always «آخرین اقدام: انتشار در مجلهٔ عمومی سایت»
- Observed: Fabricated audit/timeline UI with no «نمونه» label.
- Why it matters: Staff trust corrupted; looks like real CMS events.
- Fix: Remove audit column or label «نمونه · بدون رویداد واقعی»; status only from real fields.
- Acceptance: No invented «آخرین اقدام» string in UI.
- Effort: S · Depends on: —
- [x] Done

### BRW-001 · Critical · Cross-browser
- Where: `src/components/ui/input.tsx:5-6` — `text-sm` on `<input>` (Tailwind `text-sm` = 0.875rem = **14px** at 16px root)
- Observed: iOS Safari zooms focused inputs when font-size &lt; 16px.
- Why it matters: Panel/admin/contact forms jump-zoom; breaks mobile UX.
- Fix: Change control class to `text-base` (1rem) or `text-[max(1rem,var(--text-body))]`.
- Acceptance: Computed input font-size ≥ 16px; no focus zoom on iOS Safari (manual).
- Effort: S · Depends on: —
- [x] Done

### UXF-001 · Major · UX / states
- Where: `src/app/(public)/**`, `src/app/panel/**`, `src/app/admin/**` — **zero** `loading.tsx` / `error.tsx` (only root `not-found.tsx`)
- Observed: Product rule requires loading/empty/error/success per screen. Soft-nav can flash blank.
- Fix: Add segment `loading.tsx` (Skeleton) + `error.tsx` (Persian retry) under `(public)`, `panel`, `admin`.
- Acceptance: Soft navigation shows skeleton; thrown error shows retry UI.
- Effort: M · Depends on: —
- [ ] Done

### CMP-001 · Major · Components
- Where: `src/components/ui/button.tsx` vs `src/shared/ui/button.tsx`; imports from shared in `signature-pad.tsx`, `contract-signature.tsx`, `plant-registration-form.tsx`, `require-session.tsx`, `not-found.tsx`, `workspace-page.tsx`
- Observed: Two Button APIs; shared uses `bg-primary` (fails COL-001) and lacks loading/icon API of design-system button.
- Why it matters: Inconsistent CTAs; contrast bug duplicated.
- Fix: Migrate all imports to `@/components/ui`; delete `shared/ui/button.tsx` (or re-export only).
- Acceptance: Single Button implementation; `rg 'shared/ui/button' src` = 0.
- Effort: M · Depends on: COL-001
- [ ] Done

### THM-002 · Major · Theme
- Where: `admin-vibrant.css`, `admin-plans.css`, `admin-plants.css`, `admin-reviews.css`, `contracts.css` — hardcoded `#1762db`, `#c62f48`, `#2878ff…`, `#7041df`, etc. Live AdminShell uses `admin.css` + AppShell; these files are largely orphaned but still in repo.
- Observed: 122 hex hits; parallel theme forks.
- Fix: Delete unused CSS or remap every color to tokens; do not leave `.admin-shell` hex if selectors can still match.
- Acceptance: `rg '#[0-9a-fA-F]{3,8}' src --glob '!**/tokens.css'` only allows SVG/mask exceptions documented in report.
- Effort: L · Depends on: THM-001
- [ ] Done

### COL-004 · Major · Color
- Where: `auth-shell.css`, `auth-face.css`, `otp-input.css`, `auth-flip-card.css` — raw `#e94bd0`, `#a78bfa`, `#1a1040`, `#6d28d9`, rgb shadows
- Observed: Auth hardcodes aurora instead of `--grad-cta` / `--volt-*` / `--glass-auth-*`.
- Fix: Replace with existing auth glass tokens + `--grad-cta`; remove duplicate hex.
- Acceptance: Auth CSS hex limited to mask `#fff`/`#000` if needed.
- Effort: L · Depends on: —
- [ ] Done

### COL-005 · Major · Color
- Where: `signature-pad.tsx:33` `strokeStyle = "#10243a"`; `contracts.css` canvas `#fff`/`#a4bad3`
- Observed: Hardcoded ink; may fail on dark canvas contexts.
- Fix: `getComputedStyle(...).getPropertyValue('--foreground')` / `--ink-0` for fill already partially used.
- Acceptance: No raw `#10243a` in signature pad.
- Effort: S · Depends on: —
- [ ] Done

### TYP-001 · Major · Typography
- Where: `blog/page.tsx:20`, `workspace-page.tsx:49`, `login-screen.tsx:22-23` — `text-xs`
- Observed: Bypasses type scale (`text-caption` / tokens).
- Fix: Replace with `text-caption`.
- Acceptance: `rg 'text-xs' src/app src/features` = 0 (or only design preview if allowed).
- Effort: S · Depends on: —
- [ ] Done

### TYP-002 · Major · Typography
- Where: `workspace-shell.css` `@font-face "Workspace Kufi"`
- Observed: Non-Vazirmatn brand font in workspace chrome.
- Fix: Remove; use `var(--font-sans)`.
- Acceptance: No Workspace Kufi references.
- Effort: S · Depends on: THM-001
- [ ] Done

### TYP-003 · Major · Typography / bidi
- Where: `services/page.tsx:51` `تومان/kWh`; `design/components-preview.tsx` kWh interpolations
- Observed: Latin unit in Persian sentence without `dir="ltr"` / `<bdi>` (design-guide table does it correctly elsewhere).
- Fix: Prefer «کیلووات‌ساعت» or wrap `<bdi dir="ltr">kWh</bdi>`.
- Acceptance: No bare `kWh` adjacent to Persian without isolation in product routes.
- Effort: S · Depends on: —
- [ ] Done

### RTL-001 · Major · RTL
- Where: `home-hero.tsx:125` `object-left`
- Observed: Physical direction class.
- Fix: `object-start` or CSS `object-position: inline-start center`.
- Acceptance: `rg 'object-left|object-right' src` = 0.
- Effort: S · Depends on: —
- [ ] Done

### RTL-002 · Major · RTL
- Where: `auth-shell.tsx:88-90` back pill uses `Icon name="arrow"` path points toward x=6 (start-left in LTR); marketing CTAs use `-scale-x-100`
- Observed: Screenshot `login_light_390.png` — back chevron points left while label is «بازگشت به سایت» on the inline-end side; inconsistent with mirrored marketing arrows.
- Why it matters: Directional icon rule: flip icons that imply direction.
- Fix: Add `-scale-x-100` on auth back arrow (or logical icon variant) so chevron points toward “back” in RTL.
- Acceptance: Visual: back chevron points inline-end→start correctly for RTL back affordance; document expected direction in design notes.
- Effort: S · Depends on: —
- [ ] Done

### A11-002 · Major · Accessibility
- Where: `panel-shell.tsx` user menu `role="menu"` (~137–300)
- Observed: Opens without Escape dismiss, outside click, or focus return (code review).
- Fix: Escape + pointerdown-outside; restore focus to trigger; roving tabindex or close on Tab out.
- Acceptance: Esc/outside closes; focus returns to menu button.
- Effort: M · Depends on: —
- [ ] Done

### A11-003 · Major · Accessibility / touch
- Where: `auth-shell.css:185-188` `.auth-shell__pill { height: 2.5rem }` (40px); OTP `--otp-size` clamp from 32px (`otp-input.css`); ThemeToggle `showLabel` `h-10` (`theme-toggle.tsx:32`)
- Observed: Interactive targets &lt; 44px.
- Fix: `min-height/min-width: 2.75rem` (44px) on pills, OTP slots, labeled theme toggle.
- Acceptance: Measured ≥44×44 CSS px at 360 width.
- Effort: S · Depends on: —
- [ ] Done

### FRM-001 · Major · Forms
- Where: `login-form.tsx` / `register-form.tsx` `FaceField` — `label` class `sr-only`; placeholder carries name
- Observed: No persistent visible label when filled.
- Fix: Visible label above control (keep `htmlFor`); placeholder optional hint only.
- Acceptance: Every auth field shows visible label empty and filled.
- Effort: M · Depends on: —
- [ ] Done

### FRM-002 · Major · Forms
- Where: `login-form.tsx` / `register-form.tsx` top-level `formError` as `<p className="auth-face__error">` (field errors use `role="alert"`)
- Observed: API failures not consistently announced.
- Fix: Wrap `formError` in `Alert` or `role="alert"`.
- Acceptance: SR announces submit failures.
- Effort: S · Depends on: —
- [ ] Done

### UXF-002 · Major · UX
- Where: `home-two-paths.tsx:51` badge «در حال تکمیل»; `auth-shell.tsx:19` «مسیر در حال تکمیل»; `support/page.tsx:12` ticket prose; `site-footer.tsx:73-78` trust badge `aria-label` only «به‌زودی»
- Observed: Unfinished features not using locked «به‌زودی» pattern consistently.
- Fix: Use `LockedFeature` / visible «به‌زودی»+lock for install path CTA, support tickets, trust badge.
- Acceptance: Sighted users see به‌زودی without inspecting a11y tree.
- Effort: M · Depends on: —
- [ ] Done

### UXF-003 · Major · UX
- Where: `contracts-list.tsx` status filter client-side on current page results only
- Observed: Empty «موردی با این فیلتر نیست» can be false negative for other pages.
- Fix: Pass status to API; reset page on filter change.
- Acceptance: Filter matches server totals.
- Effort: M · Depends on: —
- [ ] Done

### UXF-004 · Major · UX
- Where: `plant-workspace.tsx` — with plants present, cards lack edit/resubmit CTA
- Observed: Dead end after list renders.
- Fix: Per-card primary action to contract/new or edit with copy for pending/rejected.
- Acceptance: Every plant card has a clear next step.
- Effort: S · Depends on: —
- [ ] Done

### UXF-005 · Major · UX
- Where: `profile-details.tsx:96-98` permanent info Alert; approval status can flash «ثبت نشده» before fetch settles
- Observed: Alert fatigue rule; missing loading honesty.
- Fix: Static helper text instead of always-on Alert; loading state for approval pill.
- Acceptance: No always-on Alert; no false «ثبت نشده» before fetch completes.
- Effort: S · Depends on: —
- [ ] Done

### MOT-001 · Major · Motion
- Where: `auth-flip-card.tsx` `FLIP_MS = 0.75`; `auth-shell.tsx` enter `duration: 0.5`; `theme-toggle.tsx` `duration-500`; OTP CSS up to 450ms
- Observed: Outside 150–300ms product budget (reduced-motion partially handled for flip).
- Fix: Cap chrome transitions to `--motion-*` (≤250ms). Document flip exception in MASTER **or** shorten flip to ≤300ms.
- Acceptance: Non-exception transitions use token durations only.
- Effort: M · Depends on: product decision on flip
- [ ] Done

### ENG-002 · Major · Engineering
- Where: Inline `style=` in `auth-flip-card.tsx`, `otp-input.tsx`, `register-form.tsx`, `home-two-paths.tsx`, `home-trust.tsx`, `site-dossier.tsx`, `alert.tsx`, `toast.tsx`
- Observed: Violates no-inline-styles rule (motion values partially justifiable).
- Fix: Prefer CSS variables via `data-*` / class; document Framer motion-value exception list in design-system note.
- Acceptance: No ad-hoc `style={{` for layout/color outside approved motion bindings.
- Effort: M · Depends on: —
- [ ] Done

### ENG-003 · Major · Engineering
- Where: No `src/app/robots.ts` / `sitemap.ts`; several pages title-only metadata (`about`, `privacy`, `terms`, `support`, `blog`, …)
- Observed: SEO gaps; `/design` correctly `robots: { index: false }`.
- Fix: Add `robots.ts` + `sitemap.ts`; add Persian `description` on every public page.
- Acceptance: Each public page exports non-empty description; sitemap lists public URLs.
- Effort: M · Depends on: —
- [ ] Done

### CPY-003 · Major · Copy / orthography
- Where: `home-hero.tsx`, `sample.ts`, `faq-list.tsx`, `auth-shell.tsx` — «قابل مشاهده» / «قابل پیگیری» without ZWNJ
- Observed: Should be «قابل‌مشاهده» / «قابل‌پیگیری».
- Fix: Insert U+200C.
- Acceptance: Grep for those spaced forms returns 0 in UI strings.
- Effort: S · Depends on: —
- [ ] Done

### COL-006 · Major · Color · Suspected
- Where: Auth `.auth-shell__legal` uses `--glass-auth-foreground-muted` (`#55607a`) over photographic hero (`login_light_390.png`)
- Observed: On solid fallback AA passes (~6:1 on white). Over bright sky photo, contrast may dip. Not pixel-measured.
- Why it matters: Legal links are required reading.
- Fix: Scrim behind legal text or force solid chip background; re-measure on screenshot.
- Acceptance: Contrast ≥ 4.5:1 on actual auth photo light+dark.
- Effort: S · Depends on: —
- [ ] Done

### SEO-001 · Major · SEO
- Where: Pages with title-only metadata (list): `about`, `privacy`, `terms`, `support`, `blog`, most panel/admin titles without description
- Fix: Same as ENG-003 descriptions for public; panel can stay title-only if `noindex` via robots for `/panel` `/admin`.
- Acceptance: Public routes have descriptions; authenticated routes disallowed in robots.
- Effort: S · Depends on: ENG-003
- [ ] Done

### SPC-001 · Minor · Spacing
- Where: `panel-shell.tsx:240` `max-w-[9rem]`; `timeline.tsx` `start-[0.55rem]`; `data-table.tsx` `min-w-[36rem]`
- Observed: Arbitrary values outside spacing scale.
- Fix: Map to space tokens / named utilities.
- Acceptance: No new arbitrary spacing in touched files.
- Effort: S · Depends on: —
- [ ] Done

### LAY-001 · Minor · Layout
- Where: `site-header.tsx` `z-[1]`
- Observed: Arbitrary z-index.
- Fix: Use layered token or standard `z-10`.
- Effort: S · Depends on: —
- [ ] Done

### ALR-001 · Minor · Alerts
- Where: `panel-home.tsx` always-on honesty caption under greeting
- Fix: Keep one caption near stats only.
- Effort: S · Depends on: —
- [ ] Done

### UXF-006 · Minor · UX
- Where: `install/page.tsx` redirects to `/services` without `#install`
- Fix: `redirect("/services#install")` if Next supports hash; else client replace.
- Effort: S · Depends on: —
- [ ] Done

### UXF-007 · Minor · UX
- Where: `/panel/settings` locked but absent from nav
- Fix: Add locked nav item or redirect to profile.
- Effort: S · Depends on: —
- [ ] Done

### UXF-008 · Minor · UX
- Where: `admin-dashboard.tsx` queue stats all link `/admin/reviews` without tab
- Fix: Deep-link `?tab=` read by AdminReviews.
- Effort: S · Depends on: —
- [ ] Done

### MOT-002 · Minor · Motion
- Where: `theme-toggle.tsx` icon morph `duration-500`
- Fix: `duration-standard` / `duration-fast`.
- Effort: S · Depends on: MOT-001
- [ ] Done

### ENG-004 · Nit · Engineering
- Where: `theme-script.tsx` `dangerouslySetInnerHTML` for boot script
- Observed: Acceptable pattern; keep minimal and CSP-reviewed.
- Fix: None required unless CSP hardening requested.
- Effort: — · Depends on: —
- [ ] Done

### PRF-001 · Nit · Performance · Suspected
- Where: Auth multiple full-bleed `next/image` variants (desktop/mobile × light/dark)
- Observed: Priority on four images; LCP impact not measured (no Lighthouse).
- Fix: After Lighthouse, keep one priority LCP image per viewport.
- Effort: M · Depends on: measurement
- [ ] Done

---

## 7. Fix batches

### Batch 1 — Blockers + Criticals
Findings: `ENG-001`, `COL-001`, `COL-002`, `COL-003`, `A11-001`, `THM-001`, `CPY-001`, `CPY-002`, `BRW-001`

Paste-ready prompt:

> Read docs/ui-audit/README.md fully. Execute Batch 1 only, following section 2. Findings: ENG-001, COL-001, COL-002, COL-003, A11-001, THM-001, CPY-001, CPY-002, BRW-001. Verify acceptance criteria, run lint/tsc/build, tick checkboxes, and finish with the changelog.

### Batch 2 — Tokens, color, typography, spacing
Findings: `THM-002`, `COL-004`, `COL-005`, `COL-006`, `TYP-001`, `TYP-002`, `TYP-003`, `RTL-001`, `RTL-002`, `SPC-001`, `LAY-001`

Paste-ready prompt:

> Read docs/ui-audit/README.md fully. Execute Batch 2 only, following section 2. Findings: THM-002, COL-004, COL-005, COL-006, TYP-001, TYP-002, TYP-003, RTL-001, RTL-002, SPC-001, LAY-001. Verify acceptance criteria, run lint/tsc/build, tick checkboxes, and finish with the changelog.

### Batch 3 — Forms, alerts, states, UX flows
Findings: `UXF-001`, `UXF-002`, `UXF-003`, `UXF-004`, `UXF-005`, `UXF-006`, `UXF-007`, `UXF-008`, `FRM-001`, `FRM-002`, `ALR-001`, `A11-002`, `A11-003`, `CPY-003`

Paste-ready prompt:

> Read docs/ui-audit/README.md fully. Execute Batch 3 only, following section 2. Findings: UXF-001, UXF-002, UXF-003, UXF-004, UXF-005, UXF-006, UXF-007, UXF-008, FRM-001, FRM-002, ALR-001, A11-002, A11-003, CPY-003. Verify acceptance criteria, run lint/tsc/build, tick checkboxes, and finish with the changelog.

### Batch 4 — Components + motion + interaction
Findings: `CMP-001`, `MOT-001`, `MOT-002`, `ENG-002`

Paste-ready prompt:

> Read docs/ui-audit/README.md fully. Execute Batch 4 only, following section 2. Findings: CMP-001, MOT-001, MOT-002, ENG-002. Verify acceptance criteria, run lint/tsc/build, tick checkboxes, and finish with the changelog.

### Batch 5 — Frontend quality, performance, SEO, cross-browser
Findings: `ENG-003`, `SEO-001`, `PRF-001`, `ENG-004`

Paste-ready prompt:

> Read docs/ui-audit/README.md fully. Execute Batch 5 only, following section 2. Findings: ENG-003, SEO-001, PRF-001, ENG-004. Verify acceptance criteria, run lint/tsc/build, tick checkboxes, and finish with the changelog.

---

## 8. Do-not-touch

- Root `lang="fa" dir="rtl"` + Vazirmatn `next/font/local` in `layout.tsx`.
- Skip-link pattern itself (fix target only — do not remove).
- `formatFa` / `fa-IR` with `٬` (`shared/lib/fa.ts`) — already correct.
- Home honesty: sample badges «نمونه», disclaimer «بدون وعدۀ درآمد تضمینی», FAQ hedges.
- `LockedFeature` + panel locked routes «به‌زودی» pattern.
- Design-system `Button` min-h-11 / focus-visible ring (after COL-001 fg fix).
- Auth flip: `inert`, live region, reduced-motion crossfade path.
- Glass utilities with solid fallback in `globals.css`.
- `/design` production `notFound` + `robots: noindex`.
- Theme boot script preventing flash (`ThemeScript`).

---

## 9. Unverified & open questions

| Item | How to verify |
| --- | --- |
| axe serious/critical = 0 | Run axe-core on `/`, `/login`, `/services`, `/panel` (authed), `/admin` at 390px |
| Lighthouse LCP/CLS/INP | Mobile Lighthouse on key routes after build |
| Full dark + desktop screenshot matrix | Re-run Chrome CDP with stable Chrome; avoid parallel kill |
| COL-006 legal on photo | Eyedropper mid-glyph vs local background; fix if &lt;4.5 |
| Auth 3D flip Safari | iOS Safari + `prefers-reduced-motion` |
| Panel/admin visual parity | Login as user/admin; capture shells |
| MOT-001 flip duration | Product: keep 750ms cinematic exception or force ≤300ms? |
| WorkspaceShell retention | Is non-user `WorkspaceFrame` kind still shipped? If dead, delete shell entirely |
| Income-promise validation on admin plan “ارزش” field | Product policy? |

---

## 10. Re-audit gates

- [x] `pnpm lint` clean (0 errors)
- [x] `tsc --noEmit` clean
- [x] `next build` clean (no EACCES in CI)
- [ ] axe serious/critical = 0 on key routes
- [x] All text AA ≥ 4.5:1 (incl. primary CTA, status pills)
- [ ] CLS &lt; 0.1, LCP &lt; 2.5s, INP &lt; 200ms mobile on `/`, `/login`, `/services`
- [ ] Zero hardcoded brand/status colors outside `tokens.css` (mask/SVG exceptions listed)
- [ ] Zero physical-direction utility classes
- [ ] Every screen has loading + empty + error + success (or locked) states

---

## Appendix A — Contrast table (measured)

Light (selected):

| Pair | Ratio | AA |
| --- | ---: | --- |
| fg / background | 18.02 | PASS |
| muted / background | 5.98 | PASS |
| white / primary `#ff7a18` | 2.61 | FAIL |
| white / `#ffb800` | 1.73 | FAIL |
| accent white / `#7c5cff` | 4.35 | FAIL normal |
| status-approved | 3.00 | FAIL |
| status-active | 2.99 | FAIL |
| auth-cta ink / `#ff8a3d` | 8.07 | PASS |
| glass muted ink-600 / glass-bg | 9.27 | PASS |

Dark: primary/status/glass pairs measured ≥ 6:1 (PASS) — see `/tmp/barghino-contrast.txt`.

## Appendix B — Routes inventory

Public: `/`, `/services`, `/sell`→services, `/install`→services, `/learn`, `/faq`→learn, `/blog`, `/blog/[slug]`, `/contact`, `/about`, `/support`, `/privacy`, `/terms`.

Auth: `/login`, `/register`.

Panel: `/panel`, `/panel/contracts`, `/panel/contracts/new`, `/panel/contracts/[uuid]`, `/panel/plant`, `/panel/profile`, locked: production, invoices, payments, install, documents, notifications, support, settings.

Admin: `/admin`, `/admin/plans`, `/admin/plants`, `/admin/reviews`, `/admin/journal`, `/admin/profile`, locked: `/admin/equipment`.

Other: `/design` (dev), `not-found`.

## Appendix C — Components (`src/components/ui`)

alert*, badge, button, card, confirm-dialog, data-table, dialog-surface, drawer, empty-state, field-frame, info-popover, input, locked-feature, modal, plan-card, select, skeleton, stat-card, status-pill, stepper, tabs, textarea, timeline, toast, types. Usages concentrated via `@/components/ui` barrel (~36 files). Parallel `shared/ui/button` still imported in 7 files.
