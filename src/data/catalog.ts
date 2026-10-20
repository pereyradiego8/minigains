/**
 * Capa de adaptación del catálogo. Hoy lee un snapshot estático tipado;
 * mañana puede reemplazarse por una API segura sin tocar los componentes.
 */
import { PRODUCTS_SNAPSHOT } from "./products.snapshot";
import offers from "./commerce-overrides.json";
import type { CategoryId, Product } from "./types";

export type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

const SAFE_IMG = /^https:\/\/acdn-us\.mitiendanube\.com\//;

type Offer = { currentPrice?: number | null; status?: "consultar" | "disponible" | "agotado"; visible?: boolean };
const OVERRIDES = offers as Record<string, Offer>;
function sanitize(p: Product): Product {
  const offer = OVERRIDES[p.slug];
  return {
    ...p,
    availability: offer?.status ?? "consultar",
    currentPrice: typeof offer?.currentPrice === "number" && Number.isSafeInteger(offer.currentPrice) && offer.currentPrice > 0 ? offer.currentPrice : null,
    name: p.name.replace(/[<>]/g, "").trim(),
    description: p.description.replace(/[<>]/g, "").trim(),
    images: p.images.filter((u) => SAFE_IMG.test(u)),
    referencePrice:
      typeof p.referencePrice === "number" && Number.isFinite(p.referencePrice) && p.referencePrice > 0
        ? p.referencePrice
        : null,
  };
}

const PRODUCTS: Product[] = PRODUCTS_SNAPSHOT.filter(p => OVERRIDES[p.slug]?.visible !== false).map(sanitize);
const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export const getAllProducts = (): Product[] => PRODUCTS;
export const getProduct = (slug: string): Product | undefined => BY_SLUG.get(slug);
export const getByCategory = (c: CategoryId): Product[] => PRODUCTS.filter((p) => p.category === c);

export const getVariants = (p: Product): Product[] =>
  p.group ? PRODUCTS.filter((x) => x.group === p.group) : [p];

export function getRelated(p: Product, n = 4): Product[] {
  return PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug && (!p.group || x.group !== p.group)).slice(0, n);
}

const FEATURED = [
  "granola-sin-tacc-500g",
  "muffin-de-zanahoria-1",
  "brownie-batata",
  "alfajor-almendras-1",
  "cracker-de-garbanzo-y-queso",
  "budin-banana-cacao-nueces",
  "pan-de-molde-sin-tacc",
  "combo-familiar-1kg-granola-1kg-pan-ir6vt",
];
export const getFeatured = (): Product[] => FEATURED.map((s) => BY_SLUG.get(s)).filter((p): p is Product => !!p);

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function queryProducts(opts: { q?: string; category?: CategoryId | null | undefined; sort?: SortKey }): Product[] {
  const q = norm(opts.q?.trim() ?? "");
  let list = PRODUCTS.filter(
    (p) => (!opts.category || p.category === opts.category) && (!q || norm(`${p.name} ${p.description}`).includes(q)),
  );
  const price = (p: Product) => p.referencePrice ?? Number.POSITIVE_INFINITY;
  switch (opts.sort) {
    case "precio-asc": list = [...list].sort((a, b) => price(a) - price(b)); break;
    case "precio-desc": list = [...list].sort((a, b) => (b.referencePrice ?? -1) - (a.referencePrice ?? -1)); break;
    case "nombre": list = [...list].sort((a, b) => a.name.localeCompare(b.name, "es")); break;
  }
  return list;
}

/** Recorta la descripción en oraciones para mostrar como resumen. */
export const excerpt = (text: string, max = 140) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max))}…`;