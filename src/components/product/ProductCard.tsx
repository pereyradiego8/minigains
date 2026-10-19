import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/data/types";
import { getCategory } from "@/data/categories";
import { formatARS } from "@/lib/format";
import { useCart } from "@/hooks/cart";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <article className="group relative flex flex-col">
      <Link
        to="/productos/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden rounded-2xl"
        aria-label={product.name}
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/5] rounded-2xl transition-transform duration-700 group-hover:scale-[1.03] [&_img]:group-hover:scale-[1.04]"
        />
      </Link>
      {product.glutenFree && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-primary backdrop-blur">
          Sin TACC
        </span>
      )}
      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {getCategory(product.category)?.short}
        </p>
        <h3 className="font-display text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] leading-snug">
          <Link to="/productos/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-sm font-semibold sm:text-base">
            {formatARS(product.referencePrice)}
            <span className="sr-only"> (precio de referencia)</span>
          </p>
          <button
            type="button"
            onClick={() => add(product.slug)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}