# Barghino product design system

Updated 2026-10-27. This vibrant renewable-energy direction supersedes the previous forest-green and graphite directions. Applies to public pages, authentication, user workspace and admin.

## Foundation

| Role | Token | Value |
| --- | --- | --- |
| Electric accent | `--electric` | #2878FF |
| Accessible primary text/action | `--primary` | #1762DB light / #86B6FF dark |
| Energy accent | `--energy` | #00C98D |
| Teal accent | `--teal` | #00B8B0 |
| Solar highlight | `--amber` | #FFAD0A |
| Analytics accent | `--violet` | #845BFF |
| Destructive accent | `--coral` | #FF5B6E |
| Accessible error text | `--danger` | #C62F48 light / #FF9CAD dark |
| Canvas | `--background` | #F5F8FC light / #0E1C2E dark |
| Ink | `--foreground` | #10243A light / #EDF5FF dark |

Vazirmatn remains the product font. Persian RTL is declared at the document root. Body uses comfortable Persian line spacing; headings 21–48px depending on context. Controls use 12px radii, cards 18px, larger editorial surfaces 20–32px. Existing Tailwind spacing supplies the 4px spacing scale.

Primary actions use the shared accessible blue–teal gradient; secondary elements remain quieter. Use emerald for successful/energy states, amber for featured offers, violet for analytics. Accent colors are not automatically suitable for small text on white: use semantic ink shades.

## Sources and adapters

- `src/app/globals.css`: semantic palette and Tailwind bindings, focus and reduced motion.
- `src/shared/ui/product-design.css`: buttons, forms, public surfaces, workspace introductions, metric/empty/loading/profile presentation.
- `src/shared/layout/workspace-shell.css`: scoped user shell and dark mode adapter.
- `src/features/admin/admin-vibrant.css`: scoped admin presentation over its existing shell geometry; imported after admin.css.
- `Button`, `TextField`, `LoadingCards`, `WorkspacePage`, `MetricGrid`, `PageIntro`, and `StepList` are shared presentation building blocks.

Admin and user theme cookies remain independent. Public/auth surfaces keep the light product canvas. No theme attributes are written onto the public document while navigating workspaces.

## Sales plans

Three cards at normal desktop widths, four on very wide screens, two on tablet and one on mobile. Existing solar asset supplies the clipped cover image. Base identity is blue, standard/recommended is amber, ویژه is emerald. No extra financial claims are invented. Rates, commitments, benefits, recommended/active states, API pagination and CRUD remain driven by the existing backend integration. Conditions use native details/summary. Featured state uses a badge and border, not color alone.

## Interaction and verification

Native dialogs preserve focus, Escape and background scroll locking. Skeletons have one live status announcement and hidden decorative placeholders. Motion uses 160/240ms durations and respects reduced motion. Decorative solar covers do not replace meaningful text.

Verified with TypeScript, project ESLint and production build. Isolated browser tests cover real frontend CRUD requests intercepted at the network boundary, empty/error/retry states, auth shell persistence, modal focus/centering, mobile navigation and theme persistence. Route review covers public, authentication, admin and panel surfaces; representative pages checked at 375, 430, 768, 1280 and 1440px without horizontal overflow. Screenshots use isolated sample account/plan responses; production continues to use real API data.

Existing unfinished business features remain unfinished; this redesign does not add fake notifications, analytics, recovery endpoints or editable settings.
