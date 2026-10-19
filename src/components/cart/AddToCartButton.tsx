import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";

/**
 * Feedback en el propio botón: no tapa el catálogo ni impide seguir agregando.
 * Un segundo clic reinicia el temporizador en lugar de perder la confirmación.
 */
export function AddToCartButton({
  slug, name, quantity = 1, variant = "icon",
}: {
  slug: string;
  name: string;
  quantity?: number;
  variant?: "icon" | "full";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const handleAdd = () => {
    add(slug, quantity);
    setAdded(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setAdded(false);
      timer.current = null;
    }, 1500);
  };

  const bubble = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[calc(100%+0.65rem)] right-0 z-20 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-200 motion-reduce:transition-none ${added ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
    >
      <Check className="h-3.5 w-3.5" /> Agregado al carrito
    </span>
  );

  if (variant === "full") {
    return (
      <div className="relative min-w-44 flex-1">
        {bubble}
        <Button type="button" size="lg" onClick={handleAdd} className="w-full">
          {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {added ? "¡Agregado!" : "Agregar al carrito"}
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
        {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
