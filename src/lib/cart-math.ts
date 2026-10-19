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
  if (!raw || raw.length > 32_768) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || (data as { v?: unknown }).v !== 1) return [];
    const lines = (data as { lines?: unknown }).lines;
    if (!Array.isArray(lines)) return [];
    const items = new Map<string, CartLine>();
    for (const value of lines) {
      if (!value || typeof value !== "object") continue;
      const line = value as Partial<CartLine>;
      if (typeof line.slug !== "string" || !isValidSlug(line.slug)) continue;
      if (typeof line.qty !== "number" || !Number.isInteger(line.qty) || line.qty <= 0) continue;
      const existing = items.get(line.slug);
      if (existing) {
        existing.qty = clampQty(existing.qty + line.qty);
      } else if (items.size < 50) {
        items.set(line.slug, { slug: line.slug, qty: clampQty(line.qty) });
      }
    }
    return [...items.values()];
  } catch {
    return [];
  }
}

export const serializeCart = (lines: CartLine[]) => JSON.stringify({ v: 1, lines });