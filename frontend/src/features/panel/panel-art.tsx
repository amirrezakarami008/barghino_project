"use client";

import Image, { type ImageProps } from "next/image";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/shared/theme";
import { cn } from "@/shared/lib/cn";

const emptySubscribe = () => () => {};

type PanelArtProps = Omit<ImageProps, "src" | "alt"> & {
  /** Path under /images/panel without extension, e.g. "hero-solar" or "stat-plants" */
  name: string;
  alt?: string;
};

/**
 * Theme-aware panel illustration: uses `*-dark.jpg` when resolved theme is dark.
 * Falls back to the light asset until mounted to avoid hydration mismatch.
 */
export function PanelArt({ name, alt = "", className, ...props }: PanelArtProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const src = dark ? `/images/panel/${name}-dark.jpg` : `/images/panel/${name}.jpg`;

  return (
    <Image
      src={src}
      alt={alt}
      className={cn("panel-art", dark && "panel-art--dark", className)}
      {...props}
    />
  );
}
