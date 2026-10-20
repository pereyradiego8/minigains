import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductImage } from "@/components/product/ProductImage";
import { CATEGORIES } from "@/data/categories";
import { getByCategory, getFeatured, getAllProducts } from "@/data/catalog";

const validUrl = "https://acdn-us.mitiendanube.com/stores/test/ejemplo-640-0.webp";

describe("imágenes de MiniGains", () => {
  it("se muestran desde el HTML SSR sin esperar hidratación ni onLoad", () => {
    const html = renderToString(<ProductImage src={validUrl} alt="Granola" />);
    expect(html).toContain('src="');
    expect(html).toContain("ejemplo-640-0.webp");
    expect(html).not.toContain("opacity-0");
    expect(html).not.toContain("animate-pulse");
  });

  it("muestra identidad visual cuando no hay imagen o falla la URL", () => {
    const { rerender } = render(<ProductImage src={validUrl} alt="Granola" />);
    fireEvent.error(screen.getByRole("img", { name: "Granola" }));
    expect(screen.getByRole("img", { name: /Granola — fotografía no disponible/ })).toBeTruthy();
    expect(screen.getByText("MiniGains")).toBeTruthy();
    rerender(<ProductImage src={validUrl + "?nuevo=1"} alt="Granola" />);
    expect(screen.getByRole("img", { name: "Granola" }).getAttribute("src")).toContain("nuevo=1");
  });

  it("las cinco categorías físicas tienen foto de producto", () => {
    const physical = CATEGORIES.filter((c) => c.delivery === "fisico");
    expect(physical).toHaveLength(5);
    for (const category of physical) {
      const products = getByCategory(category.id);
      expect(products.length).toBeGreaterThan(0);
      expect(products.some((p) => p.images[0]?.startsWith("https://"))).toBe(true);
    }
  });

  it("todas las fotos del catálogo tienen URL HTTPS validada", () => {
    expect(getFeatured().length).toBeGreaterThan(0);
    for (const p of getAllProducts()) {
      for (const url of p.images) {
        expect(url).toMatch(/^https:\/\/acdn-us\.mitiendanube\.com\//);
      }
    }
  });
});
