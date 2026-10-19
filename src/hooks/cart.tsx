import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct } from "@/data/catalog";
import type { Product } from "@/data/types";
import {
  CART_STORAGE_KEY, addLine, computeTotals, parseStoredCart, removeLine, serializeCart, setLineQty, type CartLine,
} from "@/lib/cart-math";

interface CartCtx {
  lines: (CartLine & { product: Product })[];
  subtotal: number;
  units: number;
  unpriced: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  announcement: string;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      setRaw(parseStoredCart(localStorage.getItem(CART_STORAGE_KEY), (s) => !!getProduct(s)));
    } catch {
      // Navegadores con almacenamiento restringido deben mantener el carrito en memoria.
      setRaw([]);
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(raw));
    } catch {
      // Almacenamiento denegado o cuota llena: carrito en memoria sin romper la UI.
    }
  }, [raw, hydrated]);

  const add = useCallback((slug: string, qty = 1) => {
    if (!getProduct(slug)) return;
    setRaw((l) => addLine(l, slug, qty));
    setAnnouncement(`${getProduct(slug)?.name ?? "Producto"} agregado al carrito`);
    // Abrir el carrito es una decisión explícita del cliente (icono del encabezado).
  }, []);
  const setQty = useCallback((slug: string, qty: number) => setRaw((l) => setLineQty(l, slug, qty)), []);
  const remove = useCallback((slug: string) => {
    setRaw((l) => removeLine(l, slug));
    setAnnouncement(`${getProduct(slug)?.name ?? "Producto"} eliminado del carrito`);
  }, []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartCtx>(() => {
    const lines = raw.flatMap((l) => {
      const product = getProduct(l.slug);
      return product ? [{ ...l, product }] : [];
    });
    const t = computeTotals(raw, (s) => getProduct(s)?.referencePrice);
    return { lines, ...t, open, setOpen, add, setQty, remove, clear, announcement };
  }, [raw, open, add, setQty, remove, clear, announcement]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">{announcement}</div>
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}