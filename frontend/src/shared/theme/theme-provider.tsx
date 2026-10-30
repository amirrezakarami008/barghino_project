"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useCallback, useMemo, type ReactNode } from "react";
import { THEME_STORAGE_KEY, type ResolvedTheme, type Theme } from "./theme-types";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: ResolvedTheme;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme(): ThemeContextValue {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const setAppTheme = useCallback(
    (next: Theme) => {
      setTheme(next);
    },
    [setTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return useMemo(
    () => ({
      theme: (theme === "light" || theme === "dark" || theme === "system" ? theme : "system") as Theme,
      setTheme: setAppTheme,
      toggleTheme,
      resolvedTheme: (resolvedTheme === "dark" ? "dark" : "light") as ResolvedTheme,
    }),
    [theme, setAppTheme, toggleTheme, resolvedTheme],
  );
}
