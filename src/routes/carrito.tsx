import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { CartLines, PriceNotice } from "@/components/cart/CartLines";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";
import { formatARS } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/carrito")({
  head: () => pageMeta({ title: "Carrito", description: "Revisá tu selección de productos MiniGains.", path: "/carrito", noindex: true }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, units, unpriced, clear } = useCart();
  const [req, setReq] = useState(false);
  const summary = lines.map((l) => `• ${l.qty} x ${l.product.name}`).join("\n");

  return (
    <>
      <PageIntro crumbs={[{ label: "Carrito" }]} title="Tu carrito" />
      <div className="container-page">
        {lines.length === 0 ? (
          <div className="rounded-3xl bg-gradient-blush px-6 py-16 text-center">
            <p className="font-display text-2xl">Tu carrito está vacío</p>
            <Button asChild className="mt-6"><Link to="/productos">Explorar productos</Link></Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7"><CartLines /><button onClick={clear} className="mt-4 min-h-11 text-sm text-muted-foreground underline">Vaciar carrito</button></div>
            <aside className="h-fit space-y-4 rounded-3xl bg-card p-6 shadow-soft lg:sticky lg:top-24 lg:col-span-5" aria-label="Resumen">
              <div className="flex justify-between text-sm"><span>Unidades</span><span>{units}</span></div>
              <div className="flex items-baseline justify-between"><span>Subtotal de referencia</span><span className="font-display text-3xl">{formatARS(subtotal)}</span></div>
              {unpriced > 0 && <p className="text-xs text-muted-foreground">{unpriced} producto(s) con precio a consultar.</p>}
              <PriceNotice />
              <Button size="lg" className="w-full" onClick={() => setReq(true)}>Solicitar pedido</Button>
              {req && (
                <div className="rounded-2xl border border-primary/30 p-4 text-sm" role="status">
                  <p className="font-semibold">El pedido todavía no fue enviado.</p>
                  <p className="mt-1 text-muted-foreground">Por ahora los pedidos se coordinan de forma directa. Copiá este resumen y compartilo por el canal de contacto; te confirmaremos precio final, disponibilidad y entrega.</p>
                  <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-muted p-3 font-sans text-xs">{summary}</pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(summary)}>Copiar resumen</Button>
                    <Button size="sm" asChild variant="link"><Link to="/contacto">Ver contacto</Link></Button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}