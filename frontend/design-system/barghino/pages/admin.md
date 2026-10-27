# Admin foundation

Approved direction: graphite, emerald and solar gold, adapted from the Rasam
reference study. The reference was inspected but its source, data, and assets
are not dependencies of the production interface.

## Ownership and scope

`features/admin/admin-shell.tsx` owns the admin frame; customer panel continues
using the existing WorkspaceShell. All admin stylesheet selectors are scoped to
`.admin-shell`. Never change public or customer-panel tokens to style admin UI.

Dark is the admin default. Persist its preference in `barghino-admin-theme`;
customer panel retains `barghino-theme`. Read the initial cookie on the server
and keep the theme local to the frame; never toggle the HTML element's theme.

## Tokens

- Canvas: `#10181D`; sidebar: `#121D23`; surfaces: `#18252C` / `#1C2B32`.
- Dividers: `#2B3A41`; foreground: `#F0F4F1`.
- Emerald status/navigation: `#42D3A4`; solar primary actions: `#F1BD6C`.
- Supporting text: `#A4B8B9`; secondary metadata: `#8BA1A4`.
- Light theme: neutral `#F1F4F2`, white surfaces, green ink and darker gold.
- Vazirmatn throughout; titles 27px, interface 12–13px, metadata 10–11px.

## Frame and pages

Right sidebar, 224px at wide desktop, flat 69px toolbar and 33px content insets.
At tablet/mobile use the native-dialog navigation drawer with keyboard focus,
Escape, focus restoration and background scroll locking.

Overview uses the approved original solar illustration, live plan counts and
first four plans from authenticated catalog requests, plus existing guide count.
Never ship example KPI values or mock plans. Failures and empty states are distinct.

Plans use four compact cards on wide desktop, three on medium and one on phones.
Keep rate, commitment and active status visible. Show two benefits by default;
longer conditions are expandable. Provide search, active/inactive filters and a
card/table switch. Search/filters apply to the fetched page and say so when paginated.

Create/edit and confirmation dialogs are centered, theme-aware, scrollable and
use real API requests. All payload fields remain available, including savings,
benefits, recommendation, activation and sort order. Benefits are stored as a
list of nonempty strings; decimal strings preserve rate/commitment precision.

Installation and equipment navigation stays locked; direct URLs show a locked
section with a link to plans. Journal and profile remain available with the same
foundation. Profile and account identity continue to use verified `/auth/me/` data.

## 2026-10-27 vibrant product rollout

The product MASTER.md and `admin-vibrant.css` supersede the earlier graphite/gold palette in this document. Admin now shares electric blue actions, navy surfaces, emerald success states, amber recommendations and coral destructive actions with the rest of Barghino. Solar cover cards follow the supplied Persian sales-plan reference. Both themes and all existing API behavior remain supported.
