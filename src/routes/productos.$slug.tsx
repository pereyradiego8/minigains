import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs } from "@/components/layout/PageIntro";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductGrid } from "@/components/product/ProductCard";
import { PriceNotice } from "@/components/cart/CartLines";
import { getProduct, getRelated, getVariants, excerpt } from "@/data/catalog";
import { getCategory } from "@/data/categories";
import { formatARS } from "@/lib/format";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/productos/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { slug: p.slug };
  },
  head: ({ loaderData }) => {
    const p = loaderData ? getProduct(loaderData.slug) : undefined;
    if (!p) return { meta: [{ title: "Producto no disponible · MiniGains" }, { name: "robots", content: "noindex" }] };
    const base = pageMeta({ title: p.name, description: excerpt(p.description, 155), path: `/productos/${p.slug}`, type: "product", image: p.images[0] });
    return {
      ...base,
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.images, description: excerpt(p.description, 300), brand: { "@type": "Brand", name: "MiniGains" } }) }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const p = getProduct(slug)!;
  const [img, setImg] = useState(0);
  const variants = getVariants(p);
  const cat = getCategory(p.category);

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: "Productos", to: "/productos" }, { label: p.name }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16" key={slug}>
        <div className="lg:col-span-7">
          <ProductImage key={p.images[img]} src={p.images[img]} alt={p.name} priority sizes="(min-width:1024px) 55vw, 100vw" className="aspect-square rounded-3xl" />
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Galería">
              {p.images.map((u, i) => (
                <button key={u} type="button" onClick={() => setImg(i)} aria-label={`Ver imagen ${i + 1}`} aria-pressed={i === img} className={cn("overflow-hidden rounded-xl border-2", i === img ? "border-primary" : "border-transparent")}>
                  <ProductImage src={u} alt="" sizes="96px" className="h-20 w-20" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-5 lg:pt-4">
          <p className="eyebrow">{cat?.name}</p>
          <h1 className="text-h1 mt-3">{p.name}</h1>
          <p className="mt-5 font-display text-3xl">{formatARS(p.referencePrice)}</p>
          <p className="text-xs text-muted-foreground">Precio de referencia · se confirma al coordinar</p>

          {variants.length > 1 && (
            <fieldset className="mt-8">
              <legend className="text-sm font-semibold">Presentación</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Link key={v.slug} to="/productos/$slug" params={{ slug: v.slug }} aria-current={v.slug === p.slug ? "page" : undefined}
                    className={cn("inline-flex min-h-11 items-center rounded-full border px-5 text-sm", v.slug === p.slug ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary/60")}>
                    {v.variantLabel} · {formatARS(v.referencePrice)}
                  </Link>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCartButton slug={p.slug} name={p.name} variant="full" />
          </div>
          <div className="mt-4"><PriceNotice /></div>

          <div className="mt-10 border-t border-border pt-8">
            <h2 className="text-xl">Descripción</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{p.description}</p>
          </div>
          <div className="mt-8 rounded-2xl bg-card p-5 text-sm">
            <h2 className="font-display text-lg">Información alimentaria</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Producto artesanal. Ingredientes según descripción del elaborador.</li>
              {p.glutenFree && <li>Indicado como sin TACC. Consultá por trazas si tenés celiaquía.</li>}
              <li>Ante alergias o condiciones de salud, consultá antes de consumir.</li>
              <li>Entrega física, coordinada al confirmar el pedido.</li>
            </ul>
          </div>
        </div>
      </div>
      {getRelated(p).length > 0 && (
        <section className="mt-24" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-h2">También te puede gustar</h2>
          <div className="mt-8"><ProductGrid products={getRelated(p)} /></div>
        </section>
      )}
    </div>
  );
}