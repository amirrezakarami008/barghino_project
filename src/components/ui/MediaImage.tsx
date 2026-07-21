import { cn } from "@/lib/utils";
import Image from "next/image";

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  overlay?: "none" | "dark" | "gradient" | "gradient-rtl";
}

const overlayStyles = {
  none: "",
  dark: "bg-slate-950/55",
  gradient: "bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20",
  "gradient-rtl": "bg-gradient-to-l from-slate-950/95 via-slate-950/70 to-slate-950/30",
};

export function MediaImage({
  src,
  alt,
  className,
  imageClassName,
  fill = true,
  width,
  height,
  priority,
  sizes = "100vw",
  overlay = "none",
}: MediaImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover transition-transform duration-700", imageClassName)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={cn("object-cover transition-transform duration-700", imageClassName)}
        />
      )}
      {overlay !== "none" && (
        <div className={cn("pointer-events-none absolute inset-0", overlayStyles[overlay])} />
      )}
    </div>
  );
}

interface ImageCardProps {
  src: string;
  alt: string;
  height?: string;
  overlay?: MediaImageProps["overlay"];
  children?: React.ReactNode;
  className?: string;
}

export function ImageCard({
  src,
  alt,
  height = "h-52",
  overlay = "gradient",
  children,
  className,
}: ImageCardProps) {
  return (
    <div className={cn("group relative overflow-hidden", height, className)}>
      <MediaImage
        src={src}
        alt={alt}
        overlay={overlay}
        imageClassName="group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      {children}
    </div>
  );
}

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

const avatarSizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md",
        avatarSizes[size],
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes="64px" />
    </div>
  );
}
