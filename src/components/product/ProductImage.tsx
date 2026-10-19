import { useState } from "react";
import { cn } from "@/lib/utils";

const SIZE_SUFFIX = /-\d+-0(\.[a-z0-9]+)$/i;
/** Conservado para un futuro CDN con variantes verificadas; no se usa sin confirmarlas. */
export const productImageVariant = (url: string, width: number) =>
  url.replace(SIZE_SUFFIX, `-${width}-0$1`);

interface Props {
  src?: string | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Las imágenes se cargan desde su URL original: nunca inventar tamaños que puedan devolver 404. */
export function ProductImage({
  src, alt, className, sizes = "(min-width:1024px) 25vw, 50vw", priority = false,
}: Props) {
  const [status, setStatus] = useState<{ url: string; state: "loaded" | "failed" } | null>(null);
  const loaded = !!src && status?.url === src && status.state === "loaded";
  const failed = !src || (status?.url === src && status.state === "failed");

  if (failed) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt ? `${alt} — fotografía no disponible` : undefined}
        className={cn("relative isolate grid place-items-center overflow-hidden bg-gradient-blush", className)}
      >
        <div aria-hidden="true" className="absolute -right-1/4 -top-1/4 h-2/3 w-2/3 rounded-full border border-primary/10 bg-blush/20" />
        <div aria-hidden="true" className="absolute -bottom-1/3 -left-1/4 h-3/4 w-3/4 rounded-full border border-primary/10 bg-card/30" />
        <div aria-hidden="true" className="relative flex flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="font-display text-5xl italic leading-none text-primary/45">M</span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-primary/65">MiniGains</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", !loaded && "animate-pulse", className)}>
      <img
        src={src}
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
