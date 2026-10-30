/**
 * Tailwind theme bridge for Solar Aurora tokens.
 * Runtime CSS variables live in src/styles/tokens.css.
 * Tailwind v4 also consumes the matching @theme map in globals.css —
 * keep both in sync when adding tokens.
 */
import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        card: "var(--card)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          foreground: "var(--foreground-muted)",
        },
        mint: "var(--mint)",
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        solar: "var(--solar)",
        emerald: "var(--emerald)",
        "sun-text": "var(--sun-text)",
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          muted: "var(--sidebar-muted)",
        },
        sun: {
          50: "var(--sun-50)",
          100: "var(--sun-100)",
          200: "var(--sun-200)",
          300: "var(--sun-300)",
          400: "var(--sun-400)",
          500: "var(--sun-500)",
          600: "var(--sun-600)",
          700: "var(--sun-700)",
          800: "var(--sun-800)",
          900: "var(--sun-900)",
        },
        energy: {
          50: "var(--energy-50)",
          100: "var(--energy-100)",
          200: "var(--energy-200)",
          300: "var(--energy-300)",
          400: "var(--energy-400)",
          500: "var(--energy-500)",
          600: "var(--energy-600)",
          700: "var(--energy-700)",
          800: "var(--energy-800)",
          900: "var(--energy-900)",
        },
        volt: {
          50: "var(--volt-50)",
          100: "var(--volt-100)",
          200: "var(--volt-200)",
          300: "var(--volt-300)",
          400: "var(--volt-400)",
          500: "var(--volt-500)",
          600: "var(--volt-600)",
          700: "var(--volt-700)",
          800: "var(--volt-800)",
          900: "var(--volt-900)",
        },
        ink: {
          0: "var(--ink-0)",
          25: "var(--ink-25)",
          50: "var(--ink-50)",
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          800: "var(--ink-800)",
          900: "var(--ink-900)",
          950: "var(--ink-950)",
        },
        status: {
          pending: {
            DEFAULT: "var(--status-pending-fg)",
            bg: "var(--status-pending-bg)",
            border: "var(--status-pending-border)",
          },
          approved: {
            DEFAULT: "var(--status-approved-fg)",
            bg: "var(--status-approved-bg)",
            border: "var(--status-approved-border)",
          },
          rejected: {
            DEFAULT: "var(--status-rejected-fg)",
            bg: "var(--status-rejected-bg)",
            border: "var(--status-rejected-border)",
          },
          draft: {
            DEFAULT: "var(--status-draft-fg)",
            bg: "var(--status-draft-bg)",
            border: "var(--status-draft-border)",
          },
          active: {
            DEFAULT: "var(--status-active-fg)",
            bg: "var(--status-active-bg)",
            border: "var(--status-active-border)",
          },
          closed: {
            DEFAULT: "var(--status-closed-fg)",
            bg: "var(--status-closed-bg)",
            border: "var(--status-closed-border)",
          },
          expired: {
            DEFAULT: "var(--status-expired-fg)",
            bg: "var(--status-expired-bg)",
            border: "var(--status-expired-border)",
          },
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
        card: "var(--radius-card)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lifted: "var(--shadow-lifted)",
        sun: "var(--shadow-sun)",
        energy: "var(--shadow-energy)",
        volt: "var(--shadow-volt)",
        "sun-glow": "var(--shadow-sun-glow)",
        "energy-glow": "var(--shadow-energy-glow)",
        glass: "var(--glass-shadow)",
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--leading-display)", fontWeight: "800" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--leading-h1)", fontWeight: "800" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--leading-h2)", fontWeight: "700" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--leading-h3)", fontWeight: "700" }],
        h4: ["var(--text-h4)", { lineHeight: "var(--leading-h4)", fontWeight: "600" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)", fontWeight: "400" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--leading-caption)", fontWeight: "500" }],
        nav: ["var(--text-nav)", { lineHeight: "var(--leading-nav)", fontWeight: "500" }],
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        standard: "var(--motion-standard)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      backgroundImage: {
        "grad-sun": "var(--grad-sun)",
        "grad-energy": "var(--grad-energy)",
        "grad-volt": "var(--grad-volt)",
        "grad-aurora": "var(--grad-aurora)",
        "grad-border": "var(--grad-border)",
        "grad-section": "var(--grad-section)",
      },
      maxWidth: {
        "7xl": "var(--container-max)",
      },
    },
  },
} satisfies Config;

export default config;
