import { describe, expect, it } from "vitest";
import { addLine, computeTotals, parseStoredCart, serializeCart, setLineQty, MAX_QTY } from "@/lib/cart-math";
import { getAllProducts, getProduct, queryProducts } from "@/data/catalog";

describe("catálogo", () => {
  it("tiene los 33 slugs únicos del repo", () => {
    const s = getAllProducts().map((p) => p.slug);
    expect(s.length).toBe(33);
    expect(new Set(s).size).toBe(33);
  });
  it("conserva precio snapshot de granola 500g", () => {
    expect(getProduct("granola-sin-tacc-500g")?.referencePrice).toBe(12890);
  });
  it("busca sin acentos", () => {
    expect(queryProducts({ q: "budin" }).length).toBeGreaterThanOrEqual(2);
  });
});

describe("carrito", () => {
  it("suma subtotal por cantidad", () => {
    let l = addLine([], "a", 2);
    l = addLine(l, "b");
    expect(computeTotals(l, (s) => (s === "a" ? 1000 : 500)).subtotal).toBe(2500);
  });
  it("no suma productos sin precio", () => {
    const t = computeTotals([{ slug: "x", qty: 3 }], () => null);
    expect(t.subtotal).toBe(0);
    expect(t.unpriced).toBe(1);
  });
  it("limita cantidad máxima y elimina con 0", () => {
    expect(addLine([], "a", 99)[0].qty).toBe(MAX_QTY);
    expect(setLineQty([{ slug: "a", qty: 1 }], "a", 0)).toEqual([]);
  });
  it("descarta storage de otra versión", () => {
    expect(parseStoredCart(JSON.stringify({ v: 0, lines: [{ slug: "a", qty: 1 }] }), () => true)).toEqual([]);
    expect(parseStoredCart(serializeCart([{ slug: "a", qty: 2 }]), () => true)).toEqual([{ slug: "a", qty: 2 }]);
  });
});