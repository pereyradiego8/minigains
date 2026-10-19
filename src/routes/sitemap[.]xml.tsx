import { createFileRoute } from "@tanstack/react-router";
import { getAllProducts } from "@/data/catalog";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        if (!canonicalUrl("/")) {
          return new Response("Sitemap no disponible sin un dominio público configurado.", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });
        }

        const paths = [
          "/", "/productos", "/nosotros", "/como-comprar", "/preguntas-frecuentes",
          ...getAllProducts().map((p) => `/productos/${encodeURIComponent(p.slug)}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${canonicalUrl(path)}</loc></url>`).join("")}</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
