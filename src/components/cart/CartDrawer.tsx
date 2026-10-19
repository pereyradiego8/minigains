import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";
import { formatARS } from "@/lib/format";
import { CartLines, PriceNotice } from "./CartLines";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, units, unpriced } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-2xl">Tu carrito</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {units} {units === 1 ? "unidad" : "unidades"}
          </SheetDescription>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-blush">
              <ShoppingBag className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <p className="font-display text-2xl">Todavía está vacío</p>
            <p className="text-sm text-muted-foreground">Sumá una granola o unos muffins para empezar.</p>
            <Button asChild onClick={() => setOpen(false)}><Link to="/productos">Explorar productos</Link></Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4"><CartLines compact /></div>
            <div className="space-y-3 border-t border-border bg-card px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Subtotal de referencia</span>
                <span className="font-display text-2xl">{formatARS(subtotal)}</span>
              </div>
              {unpriced > 0 && <p className="text-xs text-muted-foreground">{unpriced} producto(s) a consultar no suman al subtotal.</p>}
              <PriceNotice />
              <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                <Link to="/carrito">Ver carrito y solicitar pedido</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}