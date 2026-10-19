import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/cart";
import { formatARS } from "@/lib/format";
import { MAX_QTY } from "@/lib/cart-math";
import { ProductImage } from "@/components/product/ProductImage";
import { cn } from "@/lib/utils";

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-input" role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Restar uno">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Sumar uno">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CartLines({ compact }: { compact?: boolean }) {
  const { lines, setQty, remove, setOpen } = useCart();
  return (
    <ul className="divide-y divide-border">
      {lines.map(({ product, qty }) => (
        <li key={product.slug} className="flex gap-4 py-4">
          <Link to="/productos/$slug" params={{ slug: product.slug }} onClick={() => setOpen(false)} className="shrink-0">
            <ProductImage src={product.images[0]} alt={product.name} sizes="96px" className={cn("rounded-xl", compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28")} />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex justify-between gap-3">
              <Link to="/productos/$slug" params={{ slug: product.slug }} onClick={() => setOpen(false)} className="font-display text-lg leading-tight hover:text-primary">
                {product.name}
              </Link>
              <p className="shrink-0 text-sm font-semibold">
                {product.referencePrice != null ? formatARS(product.referencePrice * qty) : "Consultar"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <QtyStepper value={qty} onChange={(n) => setQty(product.slug, n)} label={product.name} />
              <button type="button" onClick={() => remove(product.slug)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-accent hover:text-destructive" aria-label={`Eliminar ${product.name}`}>
                <Trash2 className="h-4 w-4" /> <span className={compact ? "sr-only" : ""}>Eliminar</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PriceNotice() {
  return (
    <p className="rounded-xl bg-accent px-3 py-2 text-xs leading-relaxed text-accent-foreground">
      Precios de referencia: el valor final, la disponibilidad y el envío se confirman antes de concretar cualquier pedido. No se realizan cobros en este sitio.
    </p>
  );
}