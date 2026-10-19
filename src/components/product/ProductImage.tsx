import { useState } from "react";
import { cn } from "@/lib/utils";

const SIZE_SUFFIX = /-\d+-0(\.[a-z0-9]+)$/i;
export const productImageVariant = (url: string, width: number) =>
  url.replace(SIZE_SUFFIX, `-${width}-0$1`);

interface Props {
  src?: string | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** srcset solo para URLs que admiten variantes; nunca construir URLs de dominios arbitrarios. */
export function ProductImage({
  src, alt, className, sizes = "(min-width:1024px) 25vw, 50vw", priority = false,
}: Props) {
  const [status, setStatus] = useState<{ url: string; state: "loaded" | "failed" } | null>(null);
  const loaded = !!src && status?.url === src && status.state === "loaded";
  const failed = !src || (!!src && status?.url === src && status.state === "failed");

  if (!src || failed) {
    return (
      <div role={alt ? "img" : undefined} aria-label={alt ? `${alt} — imagen no disponible` : undefined}
        className={cn("relative grid place-items-center bg-gradient-blush", className)}>
        <svg viewBox="0 0 64 64" className="h-1/4 w-1/4 text-primary/40" aria-hidden="true">
          <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 38c4-10 20-10 24 0M24 28h.01M40 28h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <span aria-hidden="true" className="absolute bottom-3 font-display text-sm italic text-muted-foreground">MiniGains</span>
      </div>
    );
  }
  // Las imágenes proceden de un catálogo validado y de un CDN HTTPS permitido.
  const canResize = SIZE_SUFFIX.test(src);
  const url = canResize ? productImageVariant(src, 640) : src;
  const srcSet = canResize
    ? [320, 480, 640, 1024].map((w) => `${productImageVariant(src, w)} ${w}w`).join(", ")
    : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-muted", !loaded && "animate-pulse", className)}>
      <img
        src={url}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={640}
        height={640}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus({ url: src, state: "loaded" })}
        onError={() => setStatus({ url: src, state: "failed" })}
        className={cn("h-full w-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
