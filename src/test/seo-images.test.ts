import { afterEach, describe, expect, it, vi } from "vitest";
import { canonicalUrl, pageMeta, publicSiteOrigin } from "@/lib/seo";
import { productImageVariant } from "@/components/product/ProductImage";

afterEach(() => vi.unstubAllEnvs());

describe("SEO seguro", () => {
  it("acepta solo origen HTTPS sin ruta, credenciales ni fragmentos", () => {
    expect(publicSiteOrigin("https://minigains.example/")).toBe("https://minigains.example");
    for (const u of ["http://test.com", "https://test.com/extra", "https://foo:pass@test.com", "javascript:alert(1)", "//evil.com"]) {
      expect(publicSiteOrigin(u)).toBeUndefined();
    }
  });

  it("genera URLs absolutas del dominio configurado y rechaza rutas peligrosas", () => {
    expect(canonicalUrl("/productos/granola", "https://minigains.example")).toBe("https://minigains.example/productos/granola");
    expect(canonicalUrl("//example.com", "https://minigains.example")).toBeUndefined();
  });

  it("mantiene fuera del índice las previews sin dominio y evita canónicas relativas", () => {
    vi.stubEnv("VITE_SITE_URL", "");
    const data = pageMeta({ title: "Tienda", description: "Productos", path: "/productos" });
    expect(data.links).toEqual([]);
    expect(data.meta.some((m) => m.name === "robots" && m.content === "noindex, follow")).toBe(true);
  });

  it("usa la URL canónica configurada", () => {
    vi.stubEnv("VITE_SITE_URL", "https://minigains.example");
    const data = pageMeta({ title: "Tienda", description: "Productos", path: "/productos" });
    expect(data.links).toContainEqual({ rel: "canonical", href: "https://minigains.example/productos" });
  });
});

describe("imágenes de catálogo", () => {
  it("ajusta resolución solamente cuando hay un sufijo de tamaños soportado", () => {
    expect(productImageVariant("https://cdn.example.com/a-640-0.webp", 320))
      .toBe("https://cdn.example.com/a-320-0.webp");
    expect(productImageVariant("https://cdn.example.com/original.jpg", 320))
      .toBe("https://cdn.example.com/original.jpg");
  });
});
