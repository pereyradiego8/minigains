import { describe, expect, it } from "vitest";
import { officialWhatsApp, orderSummary, whatsAppLink } from "@/lib/store-contact";
import { getAllProducts } from "@/data/catalog";
import { CATEGORIES } from "@/data/categories";

describe("contacto comercial real sin falsos envíos", () => {
  it("solo acepta un número oficial de WhatsApp válido", () => {
    expect(officialWhatsApp(" +54 9 11 1234-5678 ")).toBe("5491112345678");
    expect(officialWhatsApp("x")).toBeNull();
    expect(officialWhatsApp(undefined)).toBeNull();
    expect(whatsAppLink("Hola", "invalid")).toBeNull();
    expect(whatsAppLink("Hola MiniGains", "+54 9 11 1234-5678"))
      .toBe("https://wa.me/5491112345678?text=Hola%20MiniGains");
  });

  it("el texto de consulta identifica cantidades y no afirma haber realizado una compra", () => {
    const summary = orderSummary([{
      qty: 2, product: { name: "Granola", referencePrice: 4200 },
    }]);
    expect(summary).toContain("2 × Granola");
    expect(summary).toContain("referencia histórica");
    expect(summary).toContain("no confirma ni paga");
    expect(summary).toContain("disponibilidad");
  });

  it("todos los productos sin precio vigente continúan en consulta", () => {
    const products = getAllProducts();
    expect(products.length).toBe(33);
    expect(products.every(p => p.availability === "consultar" && p.currentPrice == null)).toBe(true);
    expect(CATEGORIES.filter(c=>c.delivery === "fisico")).toHaveLength(5);
  });
});
