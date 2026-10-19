export interface CartLine {
  slug: string;
  qty: number;
}

export const MAX_QTY = 20;
export const CART_STORAGE_KEY = "minigains.cart.v1";

export const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(Number.isFinite(n) ? n : 1)));

export function addLine(lines: CartLine[], slug: string, qty = 1): CartLine[] {
  const found = lines.find((l) => l.slug === slug);
  if (found) return lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(l.qty + qty) } : l));
  return [...lines, { slug, qty: clampQty(qty) }];
}

export const setLineQty = (lines: CartLine[], slug: string, qty: number): CartLine[] =>
  qty <= 0 ? lines.filter((l) => l.slug !== slug) : lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(qty) } : l));

export const removeLine = (lines: CartLine[], slug: string) => lines.filter((l) => l.slug !== slug);

/** Subtotal de referencia. Productos sin precio ("Consultar") no suman y se reportan aparte. */
export function computeTotals(lines: CartLine[], priceOf: (slug: string) => number | null | undefined) {
  let subtotal = 0;
  let units = 0;
  let unpriced = 0;
  for (const l of lines) {
    const p = priceOf(l.slug);
    units += l.qty;
    if (typeof p === "number") subtotal += p * l.qty;
    else unpriced += 1;
  }
  return { subtotal, units, unpriced };
}

/** Lee el carrito versionado y descarta datos inválidos. */
export function parseStoredCart(raw: string | null, isValidSlug: (s: string) => boolean): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || (data as { v?: unknown }).v !== 1) return [];
    const lines = (data as { lines?: unknown }).lines;
    if (!Array.isArray(lines)) return [];
    return lines
      .filter((l): l is CartLine => !!l && typeof l.slug === "string" && typeof l.qty === "number" && isValidSlug(l.slug))
      .map((l) => ({ slug: l.slug, qty: clampQty(l.qty) }));
  } catch {
    return [];
  }
}

export const serializeCart = (lines: CartLine[]) => JSON.stringify({ v: 1, lines });