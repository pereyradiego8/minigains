export type CategoryId =
  | "granolas-barras"
  | "dulces-saludables"
  | "panes-crackers-tartas"
  | "combos"
  | "cumpleanos"
  | "ebooks-retos"
  | "planes-entrenamiento";

export type Delivery = "fisico" | "digital";

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  delivery: Delivery;
}

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  /** Snapshot del sitio anterior. NO es precio de venta final. null = "Consultar". */
  referencePrice: number | null;
  /** Precio vigente verificado, o null si no fue actualizado. */
  currentPrice?: number | null;
  /** Disponibilidad confirmada manualmente. */
  availability?: "consultar" | "disponible" | "agotado";
  images: string[];
  /** Texto plano extraído del mirror (sin HTML). */
  description: string;
  /** Familia de variantes (unidad / pack) — mismo valor agrupa slugs. */
  group: string | null;
  variantLabel: string | null;
  glutenFree: boolean;
}