import { useState } from "react";
import { cn } from "@/lib/utils";

const sized = (url: string, w: number) => url.replace(/-\d+-0(\.\w+)$/, `-${w}-0$1`);

interface Props {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Imagen de producto con srcset del CDN original y fallback editorial propio si falla. */
export function ProductImage({ src, alt, className, sizes = "(min-width:1024px) 25vw, 50vw", priority }: Props) {
  const [failed, setFailed] = useState(!src);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) {
    return (
      <div role="img" aria-label={`${alt} — imagen no disponible`} className={cn("relative grid place-items-center bg-gradient-blush", className)}>
        <svg viewBox="0 0 64 64" className="h-1/4 w-1/4 text-primary/40" aria-hidden="true">
          <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 38c4-10 20-10 24 0M24 28h.01M40 28h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <span className="absolute bottom-3 font-display text-sm italic text-muted-foreground">MiniGains</span>
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-muted", !loaded && "animate-pulse", className)}>
      <img
        src={sized(src, 640)}
        srcSet={`${sized(src, 320)} 320w, ${sized(src, 480)} 480w, ${sized(src, 640)} 640w, ${sized(src, 1024)} 1024w`}
        sizes={sizes}
        alt={alt}
        width={640}
        height={640}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover transition-[opacity,transform] duration-700", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}