<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI/UX Design Standards

These rules apply to **all** frontend work in this repository. Follow them before writing or restyling UI.

### Product visual language — Modern Financial Operations

Admin and financial surfaces should feel like a high-end financial operations product:

- Clean neutral backgrounds and professional white surfaces
- Strong typography hierarchy; tabular numerals for money and IDs
- Barghini orange (`--sun-*` / primary accent) for primary actions
- Emerald for successful / positive financial states
- Red for destructive / irreversible operations
- Subtle blue and neutral tones for supporting metadata
- Controlled shadows and consistent control heights
- Information-dense layouts appropriate to the task

Avoid washed-out backgrounds, decorative gradients, glow effects, oversized rounded cards, tiny text, and non-functional hero art on operational pages.

### 1. No cosmetic redesign

Never treat adding gradients, shadows, borders, rounded corners, or colors to existing components as a complete redesign.

When asked to redesign a page, evaluate and improve:

- Information architecture
- Layout composition
- Visual hierarchy
- Information density
- Component selection
- Interaction patterns
- Accessibility
- Responsive behavior

A redesign must improve actual user experience, not only appearance.

### 2. No generic dashboard design

Do not repeatedly ship the same generic patterns:

- Identical statistic cards on every page
- Excessive rounded cards
- Unnecessary decorative gradients
- Random colored icon backgrounds
- Repetitive layouts
- Excessive whitespace
- Unnecessary glassmorphism
- Borders around every element

Every page must use a layout appropriate to its purpose. Operational desks (wallets, reviews, inventory) prefer dense tables and inspectors over marketing heroes.

### 3. Design system consistency

Reuse existing tokens and shared UI. Source of truth:

| Layer | Path |
| --- | --- |
| Tokens | `src/styles/tokens.css` |
| Tailwind map | `src/app/globals.css` |
| Components | `src/components/ui/*` |

Do not invent one-off hex values, radii, or type sizes when a token/component already exists. Prefer extending shared components over copies.

## Design System — Barghini (Solar Aurora / Modern Financial Operations)

This is the mandatory component and token contract for frontend work. Admin and financial UIs follow the denser operational reading of these tokens; marketing may use richer gradients within the same palette.

### A. Colors

**Primitives (do not use raw in feature CSS unless extending the brand scale):**

| Family | Role | Tokens |
| --- | --- | --- |
| Sun | Brand orange / primary CTA | `--sun-50` … `--sun-900`, `--sun-text` |
| Energy | Success / positive money | `--energy-50` … `--energy-900` |
| Volt | Supporting accent / focus | `--volt-50` … `--volt-900` |
| Ink | Neutrals | `--ink-0` … `--ink-950` |

**Semantic surfaces (always prefer these in UI):**

| Token | Use |
| --- | --- |
| `--background` | Page canvas |
| `--foreground` / `--foreground-muted` | Body / secondary text |
| `--card` / `--surface` / `--surface-2` | Panels, nested surfaces |
| `--border` | Dividers, control borders |
| `--ring` | Focus ring |
| `--primary` / `--primary-foreground` | Brand action (maps to sun) |
| `--emerald` / `--mint` | Success, active wallet, inflow |
| `--danger` / `--danger-foreground` | Destructive actions / errors |
| `--info` / `--info-foreground` | Neutral informational callouts |
| `--solar` | Brand highlight without full CTA gradient |

**Status pills** — use `StatusPill` + status tokens only:

| Tone | Meaning |
| --- | --- |
| `approved` / `active` | Active, success |
| `pending` | Frozen / waiting |
| `rejected` / `expired` | Failed / disabled / danger |
| `draft` / `closed` | Neutral inactive |

**Financial meaning (admin ops):**

| Intent | Color cue | Also require |
| --- | --- | --- |
| Primary / deposit | Sun / `Button variant="primary"` | Clear Persian label |
| Success / inflow | Emerald | Label or icon |
| Warning / freeze | Pending sun tones | ConfirmDialog `variant="warning"` |
| Destructive / disable / reverse | Danger | ConfirmDialog `variant="danger"` + copy |

**Do not:** invent random icon background colors; use washed-out custom greys; rely on color alone for meaning.

### B. Typography

Font: Vazirmatn via `--font-sans` (never Inter / Roboto / Arial / system as primary).

| Role | Token / class | Size | Notes |
| --- | --- | --- | --- |
| Display | `--text-display` / marketing only | 2.75rem | Landing heroes only |
| H1 | `text-h1` | 2.25rem | Rare in admin |
| H2 | `text-h2` | 1.75rem | Page titles in shell |
| H3 | `text-h3` | 1.375rem | Admin page titles (`AdminPage`) |
| H4 | `text-h4` | 1.125rem | Dialog titles, panel titles |
| Body | `text-body` / default | 1rem / lh 1.8 | Forms, descriptions |
| Caption | `text-caption` | 0.8125rem | Meta, table secondary, hints |
| Nav | `--text-nav` | 0.9375rem | Sidebar / chrome |

**Rules:**

- Money and IDs: tabular nums + `dir="ltr"` / `<bdi>`; weight `--font-weight-number` (700) for amounts
- Prefer short IDs in lists; full UUID as secondary caption
- Do not use tiny text below caption for critical content
- Admin density: H3 page title → H4 section → body → caption meta

### C. Spacing, radius, shadow, control size

**Spacing scale** (`--space-*`):

| Token | Value | Typical use |
| --- | --- | --- |
| `--space-1` | 0.25rem | Tight icon gaps |
| `--space-2` | 0.5rem | Chip / button inner gaps |
| `--space-3` | 0.75rem | Compact stack |
| `--space-4` | 1rem | Default section padding |
| `--space-5` | 1.25rem | Dialog header/footer pad |
| `--space-6` | 1.5rem | Panel padding |
| `--space-8` | 2rem | Page section gaps |
| `--space-10`+ | ≥2.5rem | Marketing only |

Admin operational pages: prefer `--space-3` … `--space-6`. Avoid marketing-scale `--space-16` / `--space-20` between every block.

**Radius:**

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 10px | Small chips, nested facts |
| `--radius-md` / `--radius-input` | 14px | Inputs, admin boards, filters |
| `--radius-lg` / `--radius-card` | 20px | Large cards (sparingly in admin) |
| `--radius-xl` / `--radius-dialog` | 28px | Dialogs |
| `--radius-pill` | 9999px | Status pills only — not every card |

Admin preference: `--radius-md` for boards/tables; avoid stacking `--radius-3xl` cards.

**Shadows:**

| Token | Use |
| --- | --- |
| `--shadow-soft` | Default card / secondary button |
| `--shadow-lifted` / `--shadow-dialog` | Modals |
| `--shadow-sun` | Primary CTA glow only |
| `--shadow-input` | Inputs |

Do not stack multiple glows on operational tables.

**Control height:** interactive controls minimum **44px** (`min-h-11`). Dense tables may use compact row padding but click targets stay ≥44px where actionable.

### D. Buttons

Use `Button` / `ButtonLink` from `@/components/ui` only.

| Variant | When |
| --- | --- |
| `primary` | Main affirmative action (deposit, submit, create) |
| `secondary` | Alternate actions (withdraw, adjust, refresh) |
| `ghost` | Tertiary / cancel / low emphasis |
| `danger` | Destructive submit (disable, reverse, delete) |

| Size | When |
| --- | --- |
| `sm` | Toolbars, table-adjacent, inspector |
| `md` | Default forms / dialogs |
| `lg` | Marketing CTAs only |
| `icon` | Icon-only with accessible name |

**Rules:** one primary per view/dialog; Cancel = `ghost`; loading via `loading` prop (prevents double submit); never custom-color a one-off button when a variant fits.

### E. Inputs & forms

Use `Input`, `Textarea`, `Select`, `FieldFrame`.

- Label always visible (not placeholder-only)
- Required fields marked; errors via `error` prop + `Alert tone="danger"` for form-level failures
- Amount fields may be visually emphasized (larger type) but still use `Input`
- LTR for phone, UUID, money entry values
- Form stack gap ≈ `--space-3` / `--space-4`

### F. Dialogs & modals

| Pattern | Component | Use |
| --- | --- | --- |
| Centered CRUD / short action | `Modal` | Deposit, withdraw, adjust, edit, refund |
| Confirm destructive / warning | `ConfirmDialog` | Freeze, unfreeze, disable, delete |
| Complex contextual workflow | `Drawer` | Only when side context is required |

**Modal structure:**

1. Header — title (`text-h4`) + optional short description
2. Body — compact form; avoid unnecessary height
3. Footer — secondary (`ghost`) then primary/danger; sticky outside scroll when possible

**Specs:**

- Desktop: centered; max-width ≈ `max-w-lg` unless content proves wider
- Overlay: `ink-950/45` (existing Modal)
- Escape + backdrop close when not busy
- Busy: disable dismiss / show button `loading`
- Intent accent: optional 3px `border-block-start` (sun / danger / emerald / info) — never color alone

**ConfirmDialog variants:** `info` | `success` | `warning` | `danger`.

### G. Tables

Use `DataTable` for tabular admin data.

| Concern | Standard |
| --- | --- |
| Container | `border-border`, `bg-card`, `--radius-md` / soft shadow |
| Header | `bg-surface`, caption/semibold muted labels |
| Row | `border-t border-border`; hover `surface` |
| Selection | `selectedRowId` → sun-tint selected row |
| Mobile | Built-in card fallback (`md:hidden`) |
| Empty | `EmptyState` |
| Loading | `Skeleton` rows |
| Money column | LTR amount + caption currency |
| Status column | `StatusPill` |

Do not rebuild ad-hoc card lists when the data is tabular. Do not put raw UUID as the only visual primary — short id + caption full id.

### H. Status, empty, loading, error

| State | Component / pattern |
| --- | --- |
| Status | `StatusPill` / `Badge` |
| Empty | `EmptyState` with title + description + optional action |
| Loading | `Skeleton` matching final layout shape |
| Inline error | `Alert tone="danger"` |
| Toast feedback | `useToast` after successful ops |

### I. Admin layout density

Operational admin pages (wallets, reviews, inventory):

1. `AdminPage density="desk"` — title lives in shell topbar; page shows lede + actions
2. Compact metrics strip (`.admin-desk-metrics`) if needed — not four oversized identical cards
3. Filter toolbar (`.admin-desk-toolbar` / `.admin-desk-filters`)
4. Master–detail: `.admin-desk-board` + `.admin-desk-inspector` — or full-width table when no selection model
5. Operations: centered `Modal` + `.admin-op-modal*` accents; confirms via `ConfirmDialog`

**Reference sample (mandatory pattern to copy):**

| Piece | Path |
| --- | --- |
| Page | `src/features/admin/admin-wallets.tsx` |
| Desk primitives | `src/features/admin/admin-desk.css` |
| Financial Ops identity | `src/features/admin/admin-wallets.css` (`.fo-*`) |
| Page wrapper | `src/features/admin/admin-page.tsx` (`density="desk"`) |

New admin operational modules should reuse `admin-desk.css` for shared structure. Module-specific visual identity (like `.fo-*` on wallets) is allowed when it strengthens hierarchy without inventing new color tokens.

Prefer information density over decorative heroes, aurora washes inside every card, or duplicated titles.

### 4. RTL is a first-class requirement

Persian interfaces must be designed with RTL behavior in mind. Check:

- Text alignment and reading order
- Navigation and sidebar direction
- Icons that imply direction
- Form labels and input adornments
- Dialog positioning
- Table column alignment
- Pagination controls
- Dropdown / popover placement
- Numeric values, money, and UUIDs (`dir="ltr"` / `<bdi>` where needed)

Never assume `direction: rtl` alone produces a correct RTL experience.

### 5. Dialog and modal standards

Follow **Design System §F** for component choice, structure, and sizing.

Summary: centered `Modal` / `ConfirmDialog` for ordinary CRUD and short admin actions; `Drawer` only for genuine multi-section contextual workflows. Differentiate intent with copy, icons, and button/confirm variants — not color alone.

### 6. Visual quality requirements

Every redesigned page must have:

- Strong information hierarchy
- Clear primary actions
- Appropriate contrast (WCAG AA target for text)
- Consistent spacing
- Meaningful color usage
- Carefully selected typography
- Well-designed empty, loading, and error states
- Responsive layouts (≈375 / 768 / 1024 / 1440)

### 7. Visual verification is mandatory

Never declare a redesign complete because the code compiles.

When browser automation is available:

1. Run the application
2. Open the actual page
3. Inspect the desktop layout
4. Inspect a mobile viewport
5. Test dialogs and interactions
6. Identify visual defects
7. Fix the defects
8. Recheck the final result

Do not repeat previous design patterns after they have been identified as problematic.
