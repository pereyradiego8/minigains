import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { PackageOpen } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductGrid } from "@/components/product/ProductCard";
import { CATEGORIES, getCategory, isCategoryId } from "@/data/categories";
import { queryProducts, type SortKey } from "@/data/catalog";
import type { CategoryId } from "@/data/types";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

const SORTS: { v: SortKey; l: string }[] = [
  { v: "relevancia", l: "Destacados" },
  { v: "precio-asc", l: "Precio: menor a mayor" },
  { v: "precio-desc", l: "Precio: mayor a menor" },
  { v: "nombre", l: "Nombre A–Z" },
];

interface Search { q?: string | undefined; categoria?: CategoryId | undefined; orden?: SortKey | undefined }

export const Route = createFileRoute("/productos/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s['q'] === "string" && s['q'] ? s['q'].slice(0, 60) : undefined,
    categoria: typeof s['categoria'] === "string" && isCategoryId(s['categoria']) ? s['categoria'] : undefined,
    orden: SORTS.some((x) => x.v === s['orden']) ? (s['orden'] as SortKey) : undefined,
  }),
  head: () => pageMeta({ title: "Productos", description: "Catálogo completo: granolas, barras, muffins, budines, panes sin TACC, crackers, combos y tortas de cumpleaños.", path: "/productos" }),
  component: Catalog,
});

function Catalog() {
  const { q = "", categoria, orden = "relevancia" } = Route.useSearch();
  const navigate = useNavigate({ from: "/productos/" });
  const list = useMemo(() => queryProducts({ q, category: categoria, sort: orden }), [q, categoria, orden]);
  const cat = categoria ? getCategory(categoria) : undefined;
  const set = (s: Partial<Search>) => navigate({ search: (p) => ({ ...p, ...s }), replace: true, resetScroll: false });

  return (
    <>
      <PageIntro crumbs={[{ label: "Productos", to: cat ? "/productos" : undefined }, ...(cat ? [{ label: cat.short }] : [])]} eyebrow="Tienda" title={cat?.name ?? "Todos los productos"}>
        <p>{cat?.description ?? "Recetas artesanales para desayunos, meriendas y celebraciones. Precios de referencia, a confirmar en cada pedido."}</p>
      </PageIntro>
      <div className="container-page">
        <div className="sticky top-[7.75rem] z-30 md:top-16 -mx-[clamp(1rem,4vw,3rem)] mb-8 border-y border-border/70 bg-background/90 px-[clamp(1rem,4vw,3rem)] py-3 backdrop-blur lg:top-[4.5rem]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative lg:w-72">
              <span className="sr-only">Buscar en el catálogo</span>
              <input type="search" value={q} maxLength={60} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Buscar…" className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label="Filtrar por categoría">
              {[{ id: undefined, short: "Todo" }, ...CATEGORIES.filter((category) => category.delivery === "fisico")].map((c) => (
                <button key={c.short} type="button" aria-pressed={categoria === c.id} onClick={() => set({ categoria: c.id as CategoryId | undefined })}
                  className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors", categoria === c.id ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary/60")}>
                  {c.short}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm lg:ml-auto">
              <span className="text-muted-foreground">Ordenar</span>
              <select value={orden} onChange={(e) => set({ orden: e.target.value as SortKey })} className="h-11 rounded-full border border-input bg-card px-3 text-sm">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </label>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">{list.length} {list.length === 1 ? "producto" : "productos"}</p>
        {list.length ? <ProductGrid products={list} /> : (
          <div className="rounded-3xl bg-gradient-blush px-6 py-16 text-center">
            <PackageOpen className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl">{cat?.delivery === "digital" ? "Próximamente" : "No encontramos productos"}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{cat?.delivery === "digital" ? "Este contenido digital está en preparación y todavía no está a la venta." : "Probá con otra búsqueda o categoría."}</p>
            <Link to="/productos" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">Ver todo</Link>
          </div>
        )}
      </div>
    </>
  );
}