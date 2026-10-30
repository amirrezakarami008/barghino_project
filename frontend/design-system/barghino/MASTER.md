# Barghino product design system — Solar Aurora

Updated 2026-10-30. Vivid solar-energy direction: sun (primary), energy (secondary), volt (accent) on cool ink neutrals. Applies to public pages, authentication, user workspace and admin.

## Foundation

| Role | Token | Value |
| --- | --- | --- |
| Brand primary | `--sun-500` | #FF9F1C (scale #FFF4DB → #7A3E00) |
| Accessible primary action | `--primary` | `--sun-600` light / `--sun-400` dark |
| Secondary | `--energy-500` | #12B886 |
| Accent / links | `--volt-500` | #6D5EF5 |
| Canvas | `--background` | #F7F8FC light / #0A0F1E dark |
| Ink | `--foreground` | cool slate with AA muted text |

Vazirmatn is self-hosted via `next/font/local` (no Google Fonts). Persian RTL is declared at the document root. Type scale: display / h1–h4 / body / caption with taller Persian line-heights. Radii: sm 10, md 14, lg 20, xl 28, pill. Glass only on layered surfaces over colorful backgrounds; data-dense areas stay solid.

## Sources

- `src/styles/tokens.css` — CSS variables (`:root` + `.dark`)
- `src/app/globals.css` — Tailwind v4 `@theme` map, glass utilities, base
- `tailwind.config.ts` — mirrored theme bridge (keep in sync with `@theme`)
- `/design` — living style guide (dev-only; `notFound` in production)
- `ThemeProvider` + `ThemeToggle` + boot script — class-on-`<html>`, no flash

Legacy aliases (`--electric`, `--gradient-action`, `--solar`, …) map onto Solar Aurora so existing product CSS keeps resolving while screens are redesigned.
