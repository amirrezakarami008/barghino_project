# Design System Master File

**Project:** Barghino  
**Updated:** 2026-10-24  
**Category:** Residential solar / household energy service

The UI UX Pro Max search recommended **Organic Biophilic** plus a trust-and-conversion landing pattern. That direction is kept. Two generator outputs are intentionally not used:

- The generated palette (`#059669` on black text, mint page background) loses to the approved reference: forest `#075B4D`, deep `#063F36`, emerald `#15966B`, solar `#55C878`, mint `#E8F5EE`, background `#FAFCFA`, ink `#12243A`. White text sits on the forest green, not on the brighter emerald.
- The generated fonts (Syncopate / Space Mono) do not cover Persian. The Arabic search returned Almarai, but the interface uses **Vazirmatn**, which is already loaded and has the weights this UI needs.

Motion stays subtle and CSS-only. Do not add GSAP. Honor `prefers-reduced-motion`. Sample prices and the homepage dashboard are labeled نمونه. Do not present them as a live meter reading.

## Color

| Role | Hex | Token |
|------|-----|-------|
| Primary / CTA | `#075B4D` | `--color-primary` |
| Primary hover / sidebar | `#063F36` | `--color-primary-hover`, `--color-sidebar` |
| Emerald emphasis | `#15966B` | `--color-emerald` |
| Solar accent | `#55C878` | `--color-solar` |
| Mint | `#E8F5EE` | `--color-mint` |
| Surface | `#F3F9F5` | `--color-surface` |
| Background | `#FAFCFA` | `--color-background` |
| Card | `#FFFFFF` | `--color-card` |
| Info wash | `#EAF3FF` | `--color-info` |
| Text | `#12243A` | `--color-foreground` |
| Secondary text | `#64748B` | `--color-muted-foreground` |
| Border | `#E2EAE5` | `--color-border` |
| Danger | `#B42318` | `--color-danger` |

Light theme only. The sidebar may be deep green. Do not ship a dark app shell.

## Type

- Family: Vazirmatn
- Headings: 700, line-height about 1.45
- Body: 400/500, line-height 1.8 to 2 for Persian
- Buttons: pill. Cards: 1.25rem. Inputs: 1rem.

## Layout

- Public pages: max width 72rem, RTL, header then content then footer
- User and admin: deep-green sidebar on the start edge, bright content
- Marketing hero: copy on the start side, photograph on the end side
- Comparison: Barghino column on mint

## Checklist

- SVG icons, not emoji
- Visible focus
- Contrast of body text at least 4.5:1
- Reduced motion
- 375, 768, 1024, 1440
- Client components only for menus, forms, and the open FAQ
