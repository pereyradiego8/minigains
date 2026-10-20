import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";
import { MAX_QTY } from "@/lib/cart-math";
import { getProduct } from "@/data/catalog";

/**
 * El botón "+" pasa a un contador interactivo que refleja el carrito REAL.
 * El estado vive en CartProvider, por lo que no se desincroniza entre tarjetas,
 * ficha, carrito lateral y almacenamiento local.
 */
export function AddToCartButton({
  slug, name, quantity = 1, variant = "icon",
}: {
  slug: string;
  name: string;
  quantity?: number;
  variant?: "icon" | "full";
}) {
  const { add, lines, setQty } = useCart();
  const inCart = lines.find((line) => line.slug === slug)?.qty ?? 0;
  const unavailable = getProduct(slug)?.availability === "agotado";
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const confirm = () => {
    setAdded(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setAdded(false);
      timer.current = null;
    }, 1500);
  };

  const handleAdd = () => {
    if (unavailable || inCart >= MAX_QTY) return;
    add(slug, Math.min(quantity, MAX_QTY - inCart));
    confirm();
  };

  const handleIncrease = () => {
    if (unavailable || inCart >= MAX_QTY) return;
    add(slug, 1);
    confirm();
  };

  const handleDecrease = () => {
    setQty(slug, inCart - 1);
    if (inCart === 1) setAdded(false);
  };

  const bubble = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[calc(100%+0.65rem)] right-0 z-20 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-200 motion-reduce:transition-none ${added ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
    >
      <Check className="h-3.5 w-3.5" /> Agregado al carrito
    </span>
  );

  if (inCart > 0) {
    return (
      <div className={variant === "full" ? "relative min-w-44 flex-1" : "relative w-full min-w-0"}>
        {bubble}
        <div
          role="group"
          aria-label={`Cantidad de ${name} en el carrito`}
          className="flex h-11 w-full items-center justify-between overflow-hidden rounded-full border border-primary/40 bg-card text-primary"
        >
          <button
            type="button"
            onClick={handleDecrease}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-offset-[-3px]"
            aria-label={`Restar una unidad de ${name}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="min-w-6 flex-1 text-center text-sm font-bold tabular-nums" aria-live="polite">
            {inCart}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={unavailable || inCart >= MAX_QTY}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent focus-visible:outline-offset-[-3px] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Agregar una unidad de ${name}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="relative min-w-44 flex-1">
        {bubble}
        <Button type="button" size="lg" onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4" aria-hidden="true" /> Agregar al carrito
        </Button>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      {bubble}
      <button
        type="button"
        onClick={handleAdd}
        className="grid h-11 w-11 place-items-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-offset-2"
        aria-label={`Agregar ${name} al carrito`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
