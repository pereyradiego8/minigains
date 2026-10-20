import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCopy, Send, Share2 } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { CartLines, PriceNotice } from "@/components/cart/CartLines";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";
import { formatARS } from "@/lib/format";
import { orderSummary, whatsAppLink } from "@/lib/store-contact";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/carrito")({
  head: () => pageMeta({ title: "Carrito", description: "Revisá tu selección de productos MiniGains.", path: "/carrito", noindex: true }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, units, unpriced, clear } = useCart();
  const [feedback, setFeedback] = useState("");
  const summary = orderSummary(lines);
  const whatsappUrl = whatsAppLink(summary);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setFeedback("¡Pedido copiado! Pegalo en el chat que prefieras.");
    } catch {
      setFeedback("El navegador no permitió copiar automáticamente. Seleccioná y copiá el resumen de abajo.");
    }
  };

  const share = async () => {
    if (typeof navigator.share !== "function") {
      await copy();
      return;
    }
    try {
      await navigator.share({ text: summary, title: "Consulta de pedido MiniGains" });
      setFeedback("Elegiste cómo compartirlo. La tienda todavía no recibió ni confirmó un pedido.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      await copy();
    }
  };

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
              <div className="flex items-baseline justify-between gap-4"><span>Subtotal de referencia</span><span className="font-display text-3xl">{formatARS(subtotal)}</span></div>
              {unpriced > 0 && <p className="text-xs text-muted-foreground">{unpriced} producto(s) con precio a consultar.</p>}
              <PriceNotice />
              {whatsappUrl ? (
                <Button size="lg" className="w-full" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Send className="h-4 w-4" /> Consultar por WhatsApp</a>
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={share}><Share2 className="h-4 w-4" /> Compartir consulta de pedido</Button>
              )}
              <Button size="lg" variant="outline" className="w-full" onClick={copy}><ClipboardCopy className="h-4 w-4" /> Copiar resumen</Button>
              <p className="text-xs leading-relaxed text-muted-foreground">Todavía no se realiza ninguna compra ni se envía un pedido a MiniGains desde esta web. Compartí la consulta y esperá confirmación de precios y disponibilidad.</p>
              {feedback && <p role="status" className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{feedback}</p>}
              <details className="rounded-xl border border-border p-3 text-sm">
                <summary className="cursor-pointer font-semibold">Ver texto del pedido</summary>
                <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-xs">{summary}</pre>
              </details>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
