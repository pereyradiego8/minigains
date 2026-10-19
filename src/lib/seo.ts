export function pageMeta(opts: { title: string; description: string; path: string; type?: string; noindex?: boolean; image?: string | undefined }) {
  const title = `${opts.title} · MiniGains`;
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: opts.path },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image) meta.push({ property: "og:image", content: opts.image }, { name: "twitter:image", content: opts.image });
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, follow" });
  return { meta, links: [{ rel: "canonical", href: opts.path }] };
}