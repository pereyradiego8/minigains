/**
 * URL pública de la tienda. No usar valores basados en el Host HTTP recibido:
 * podrían generar enlaces canónicos manipulados o indexar una preview.
 */
export function publicSiteOrigin(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function canonicalUrl(
  path: string,
  configuredUrl: unknown = import.meta.env["VITE_SITE_URL"],
): string | undefined {
  const origin = publicSiteOrigin(configuredUrl);
  if (!origin || !path.startsWith("/") || path.startsWith("//") || path.includes("?") || path.includes("#")) return undefined;
  return new URL(path, origin).href;
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  type?: string;
  noindex?: boolean;
  image?: string | undefined;
}) {
  const title = `${opts.title} · MiniGains`;
  const canonical = canonicalUrl(opts.path);
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: opts.description },
  ];
  if (canonical) meta.push({ property: "og:url", content: canonical });
  if (opts.image) meta.push({ property: "og:image", content: opts.image }, { name: "twitter:image", content: opts.image });
  // Una preview sin dominio oficial no debe contaminar el índice de Google.
  if (opts.noindex || !canonical) meta.push({ name: "robots", content: "noindex, follow" });
  return { meta, links: canonical ? [{ rel: "canonical", href: canonical }] : [] };
}
