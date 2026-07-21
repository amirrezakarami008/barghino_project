import { MediaImage } from "@/components/ui/MediaImage";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageBannerProps {
  image: string;
  alt: string;
  children: ReactNode;
  overlay?: "dark" | "gradient" | "gradient-rtl";
  height?: string;
  priority?: boolean;
}

export function PageBanner({
  image,
  alt,
  children,
  overlay = "gradient-rtl",
  height = "min-h-[220px] sm:min-h-[280px] lg:min-h-[340px]",
  priority,
}: PageBannerProps) {
  return (
    <section className={cn("relative flex items-center overflow-hidden bg-surface-950", height)}>
      <MediaImage
        src={image}
        alt={alt}
        overlay={overlay}
        priority={priority}
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-mesh-dark bg-grid-dark opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-950/80 to-transparent" />
      <Container className="relative py-8 sm:py-10 lg:py-14">{children}</Container>
    </section>
  );
}
