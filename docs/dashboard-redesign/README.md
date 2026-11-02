# Barghini Authenticated Dashboard — Architecture Analysis

**Status:** Premium redesign **implemented** (2026-11-02). Analysis below remains the architectural source of truth.  
**Scope:** Authenticated user panel (`/panel/*`), not admin or public marketing.

**Assets:** `frontend/public/images/panel/` (AI-generated 3D clay illustrations).  
**QA shots:** `docs/dashboard-redesign/screenshots/`.  
**Checks:** `tsc --noEmit` clean · `next build` clean · lint clean on touched panel files.

---

## 1. Technology Stack

| Layer | Actual stack |
| --- | --- |
| Framework | **Next.js `16.4.3`** (App Router, Turbopack) |
| UI | **React `19.3.1` / React DOM `19.3.1`** |
| Language | **TypeScript `^6`** |
| Styling | **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/turbopack`) + CSS variables in `tokens.css` + feature CSS (`panel-shell.css`) |
| Class helpers | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Theme | **`next-themes` `0.4.6`** (`ThemeProvider`, cookie/`localStorage` key `barghino-theme`) |
| Motion | **`framer-motion` `^12.43.0`** (installed; **not used in panel home/shell today**) |
| Icons | **No Lucide/Heroicons package** — custom SVG stroke set in `@/shared/ui/icon` (`IconName` union, inline path glyphs) |
| Fonts | **Vazirmatn** via `next/font/local` in root layout (`--font-vazirmatn`) |
| Package manager | **pnpm `11.22.0`**, Node `>=20.9` |
| RTL / locale | Root `lang="fa"` `dir="rtl"`; numbers via `faNumber` / `faDigits` |

There is **no** Material UI, shadcn CLI package, chart lib, or illustration package in `frontend/package.json`.

---

## 2. Relevant File Paths

### Entry / routing

- `frontend/src/app/panel/layout.tsx` — auth gate + workspace frame
- `frontend/src/app/panel/page.tsx` — dashboard home route
- Active routes: `contracts`, `contracts/new`, `contracts/[uuid]`, `plant`, `profile`
- Locked routes (render `WorkspaceLockedSection`): `production`, `invoices`, `payments`, `install`, `documents`, `notifications`, `support`, `settings`

### Shell / chrome

- `frontend/src/features/workspace/workspace-frame.tsx` — maps `kind="user"` → `PanelShell`
- `frontend/src/features/panel/panel-shell.tsx` — `AppShell` + `PanelShell` (sidebar, topbar, user menu, mobile tabs)
- `frontend/src/features/panel/panel-shell.css` — layout/responsive chrome
- `frontend/src/shared/layout/site-nav.ts` — `userNav`, `isNavActive`
- `frontend/src/shared/ui/logo.tsx`, `frontend/src/shared/ui/icon.tsx`
- `frontend/src/shared/theme/*` — provider, toggle, script, types

### Dashboard page

- `frontend/src/features/panel/panel-home.tsx` — greeting, next-action hero, stats, shortcuts, recent contracts

### Profile / locked

- `frontend/src/features/workspace/profile-details.tsx`
- `frontend/src/features/workspace/workspace-locked-section.tsx`
- `frontend/src/components/ui/locked-feature.tsx`

### Data / auth

- `frontend/src/features/auth/components/require-session.tsx` — `/auth/me/` gate
- `frontend/src/features/auth/session-provider.tsx`, `lib/session.ts`, `lib/api.ts`
- `frontend/src/features/contracts/contracts-api.ts`, `use-contract-resource.ts`, `status-map.ts`
- `frontend/src/features/plants/plants-api.ts`, `use-plant-inventory.ts`

### Design system

- `frontend/src/styles/tokens.css` — Solar Aurora tokens
- `frontend/src/app/globals.css`, `frontend/src/components/ui/*`, `frontend/src/components/ui/index.ts`

### Current visual baseline (repo)

- `docs/ui-audit/screenshots/batch1-verify/panel_light_1280.png` (and dark/360 variants)

---

## 3. Current Component Architecture

```
app/panel/layout.tsx
  └─ Suspense
       └─ RequireSession(area="user")  → verifies session via /auth/me/
            └─ PanelFrame (SSR cookie theme)
                 └─ WorkspaceFrame(kind="user")
                      └─ PanelShell / AppShell
                           ├─ aside.panel-sidebar (desktop ≥1024px)
                           ├─ header.panel-topbar (title + ThemeToggle + user menu)
                           ├─ main#content.panel-content → {children}
                           └─ nav.panel-bottom-tabs (mobile; first 4 primary links)

app/panel/page.tsx → PanelHome
  ├─ greeting from useAuth().profile
  ├─ nextAction(...) → Card variant="gradient-border" + ButtonLink
  ├─ 3× Stat links (contracts / plants / open drafts)
  ├─ Shortcuts Card
  └─ Recent contracts Card | EmptyState | Skeleton | Alert(error)
```

### Shell responsibilities (`AppShell`)

- Collapse sidebar (`data-collapsed`)
- Split nav: primary hrefs `/panel`, `/panel/contracts`, `/panel/plant`, `/panel/profile` vs secondary locked «به‌زودی»
- Close mobile user menu on pathname change
- User menu: profile, site home, sign-out
- Account label: personal vs legal from `profile.accountType`

### Dashboard logic (`PanelHome`) — all dynamic

- Contracts: `useContractResource` → `getContracts(1)`
- Plants/branches: `usePlantInventory(1,1)` → `getPlants` + `getBranches`
- `nextAction` priority: rejected plant/branch → pending review → draft contract → pending contract → empty → “all up to date”
- Stats from live counts; open-drafts filtered from current page results (hint: «در صفحهٔ فعلی فهرست»)
- Recent list: first 3 contracts + `StatusPill` via `contractStatusMeta`

### Shared UI used on home

`Alert`, `ButtonLink`, `Card`, `EmptyState`, `Skeleton`, `StatusPill`, `Icon`

### Admin note

`WorkspaceFrame(kind="admin")` uses legacy `WorkspaceShell`, not `PanelShell`. Redesigning the user dashboard should not assume admin shares the same CSS unless deliberately unified later.

---

## 4. Existing Functional Dependencies

| Concern | Source | Must preserve |
| --- | --- | --- |
| Auth | `RequireSession` + `barghino.session` + Bearer `apiRequest` | Unauthenticated → `/login?next=…`; 401 clears session |
| Profile display | `useAuth().profile` (`firstName`, `lastName`, `phone`, `accountType`, …) | Greeting + sidebar account + initials |
| Sign-out | `signOut` from session provider | User menu |
| Contracts API | `GET /contracts/?page=&page_size=` | Stats, recent list, next-action |
| Plants/Branches API | `GET /plants/`, `GET /branches/` | Plant count; pending/rejected next-action |
| Status mapping | `contractStatusMeta` | Labels/tones for pills |
| Nav config | `userNav` + `disabled: true` | Locked destinations still route to locked pages |
| Theme | `next-themes` class on `<html>` + `ThemeToggle` | Light/dark tokens |
| Skip link | Root layout `#content` | Panel `main#content` is the target |
| Honesty copy | No sample KPIs; empty/locked honesty | Do not invent production/income charts |
| RTL / FA numbers | `dir=rtl`, `faNumber` | Stat digits stay Persian |
| Responsive | Sidebar ≥1024; bottom tabs &lt;1024; safe-area padding | Touch targets ~44px |

### Loading / error today

- Skeletons for stats + recent list
- Danger `Alert` if either contracts or plants fail
- EmptyState when no contracts

### Not present

No notifications API, no dashboard charts, no illustration assets for stats — those must stay absent or explicitly «به‌زودی» unless backends exist.

---

## 5. Current Design System

**Brand:** Solar Aurora in `frontend/src/styles/tokens.css`

| Token family | Role |
| --- | --- |
| `--sun-*` | Primary CTAs / active nav wash / grad-sun |
| `--energy-*` | Secondary / mint status |
| `--volt-*` | Accent / ring / grad-volt |
| `--ink-*` | Neutrals |
| Status semantic | pending / approved / rejected / draft / active / … |
| Gradients | `--grad-sun`, `--grad-energy`, `--grad-volt`, `--grad-aurora`, `--grad-border` |
| Radius | sm 10 → xl 28, pill, card/control aliases |
| Shadow | soft, lifted, sun/energy/volt glows |
| Glass | `--glass-*` used by topbar/bottom tabs |
| Space | `--space-1`…`--space-28` |
| Type scale | display/h1–h4/body/caption/nav + Vazirmatn weights 400–800 |
| Motion tokens | 160–250ms, `--ease-out` |

### Panel chrome specifics

- Active nav: sun wash (`color-mix` with `--sun-500`)
- Topbar: sticky glass
- Bottom tabs: glass + safe-area
- Cards: `rounded-lg`, `shadow-soft`; hero uses `gradient-border` (`grad-border-shell`)

### Theme architecture

- Class strategy (`.dark` overrides in `tokens.css`)
- Cookie `barghino-theme` read in panel layout for SSR frame (user shell currently ignores `theme` prop for styling; class on `html` drives tokens)
- Toggle in topbar (`ThemeToggle`); morph sun/moon SVG, mount guard for hydration

---

## 6. Recommended Design Architecture

Preserve **data hooks, nav config, RequireSession, and route map**. Redesign as a **presentation layer** on `PanelShell` + `PanelHome` (+ tokens/CSS), not a new app shell.

### Sidebar

- Keep `userNav` / primary vs locked split and lock icon semantics.
- Elevate visual language: deeper aurora wash, clearer hierarchy, refined active indicator (e.g. sun gradient rail), optional collapsed icon rail already supported via `data-collapsed`.
- Do not unlock disabled items or invent badge counts for notifications.

### Header

- Keep page title from `current?.label`, theme toggle, user menu actions (profile / site / sign-out).
- Premium treatment: stronger glass, refined avatar (already `bg-grad-sun` initials), optional breadcrumb later — without new APIs.

### Dashboard hero

- Restyle existing `nextAction` card (still the only “hero”).
- Add atmospheric aurora / soft solar illustration as **decorative CSS or static SVG**, not fake metrics.
- Keep CTA wired to `action.href` / `action.cta`.

### Statistics cards

- Restyle the three existing `Stat` links; optional custom illustrations per metric (contracts / plants / drafts) as local SVG assets.
- Values still from `contractData.count`, `plantData.plants.count`, draft filter — never hardcoded.

### Quick actions / recent contracts

- Same four shortcuts; richer icon tiles and hover motion (`framer-motion` allowed; respect `prefers-reduced-motion`).
- Recent list: keep `StatusPill` + link to `/panel/contracts/[uuid]`; empty state stays honest.

### Empty / locked / profile

- Upgrade `EmptyState` / `LockedFeature` visuals; keep «به‌زودی» copy rules.
- Profile remains `ProfileDetails` + plant/branch approval derivation.

### Mobile

- Preserve bottom tabs (4 primary) and content bottom padding.
- Hero/stats stack; avoid horizontal overflow; form inputs elsewhere already ≥16px (BRW).

### Motion

- Introduce intentional enter/hover on shell + home only; durations ≤ token standard (~220ms) except documented exceptions.
- Panel currently has no framer usage — safe place to add without fighting marketing auth flip.

### Token approach

- Prefer extending Solar Aurora semantics over a parallel palette (avoids THM regressions).
- Any new decorative colors → tokens first.

---

## 7. Exact Files That Need Modification (when redesign starts)

### Must touch (user dashboard surface)

1. `frontend/src/features/panel/panel-shell.tsx`
2. `frontend/src/features/panel/panel-shell.css`
3. `frontend/src/features/panel/panel-home.tsx`
4. Possibly `frontend/src/styles/tokens.css` (new semantic/decorative tokens only)
5. Possibly `frontend/src/shared/ui/icon.tsx` (new glyphs if needed — still custom set)
6. Possibly `frontend/src/components/ui/card.tsx`, `empty-state.tsx`, `stat-card.tsx` (if home adopts shared variants instead of local `Stat`)

### Likely adjacent (same chrome, not inventing features)

- `frontend/src/shared/theme/theme-toggle.tsx` (visual polish only)
- `frontend/src/shared/ui/logo.tsx`
- `frontend/src/components/ui/status-pill.tsx` / `button.tsx` (if CTA/pill look must match)
- New optional assets under `frontend/public/images/panel/…` (illustrations)

### Usually leave logic alone

- `require-session.tsx`, `session-provider.tsx`, `contracts-api.ts`, `use-contract-resource.ts`, `use-plant-inventory.ts`, `site-nav.ts` (hrefs/disabled flags), `profile-details.tsx` business rules, locked page routes

### Out of scope unless product asks to unify

- `workspace-shell.tsx` / `workspace-shell.css` (admin/legacy)
- Marketing/auth shells

---

## 8. Potential Risks and Things That Must Not Break

| Risk | Why |
| --- | --- |
| Auth redirect / `/auth/me/` | Breaks all `/panel/*` |
| `nextAction` priority order | Wrong CTA = wrong user journey / honesty issues |
| Invented KPIs / charts | Violates product honesty; no production API |
| Unlocking `disabled` nav | Routes exist but are intentionally locked |
| Dual Button systems | Prefer `@/components/ui`; don’t revive contrast bugs on `shared/ui/button` |
| Hardcoded hex outside tokens | THM regressions (Batch 1 lesson) |
| Primary CTA contrast | Keep ink-on-`grad-sun` AA (≥4.5) |
| `#content` / skip link | Keep `main#content`; don’t paint ugly focus rings on large landmarks |
| RTL / `faNumber` | Layout/mirroring and Persian digits |
| Mobile bottom tabs + safe-area | Content can hide under tabs if padding removed |
| `WorkspaceFrame` user vs admin split | Don’t restyle admin via panel CSS accidentally |
| Session account fields | Initials/name/label depend on profile shape |
| Open-drafts “current page” semantics | Stat is page-scoped today; changing formula is product/API, not pure UI |
| `framer-motion` without reduced-motion | A11y regression |
| Cookie/theme SSR | Avoid flash / mismatched chrome |

---

## Next step

Attach the desired FinTech/Solar reference image (and confirm if current `panel_light_1280` is the “before” baseline). A follow-up can then map section-by-section (sidebar / hero / stats / empty) to concrete token and component changes—still without inventing APIs.
