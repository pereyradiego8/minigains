import { useEffect, useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart";

export function MercadoPagoCheckout() {
  const { lines } = useCart();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/mercadopago/config", { cache: "no-store" })
      .then(async (r) => r.ok ? r.json() as Promise<{ enabled?: boolean }> : { enabled: false })
      .then((r) => { if (alive) setEnabled(r.enabled === true); })
      .catch(() => { if (alive) setEnabled(false); });
    return () => { alive = false; };
  }, []);

  if (!enabled || lines.length === 0) return null;
  const payable = lines.every(({ product }) =>
    product.availability === "disponible" &&
    typeof product.currentPrice === "number" &&
    Number.isSafeInteger(product.currentPrice) && product.currentPrice > 0,
  );

  const start = async () => {
    if (!payable || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ items: lines.map((line) => ({ slug: line.product.slug, qty: line.qty })) }),
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "No se pudo iniciar el pago.");
      const gateway = new URL(result.url);
      if (
        gateway.protocol !== "https:" ||
        !["mercadopago.com", "mercadopago.com.ar"].some((domain) =>
          gateway.hostname === domain || gateway.hostname.endsWith("." + domain))
      ) throw new Error("URL de pago no válida.");
      window.location.assign(gateway.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar el pago.");
      setLoading(false);
    }
  };

  return (
    <section aria-label="Pago seguro con Mercado Pago" className="space-y-3 rounded-2xl border border-primary/20 bg-background/50 p-4">
      <p className="text-sm font-semibold">Pago con Mercado Pago</p>
      <Button className="w-full" size="lg" disabled={!payable || loading} onClick={start}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Preparando pago..." : "Pagar con Mercado Pago"}
      </Button>
      {!payable && (
        <p className="text-xs text-muted-foreground">Para pagar online, todos los productos deben tener precio y disponibilidad confirmados. Podés consultar por WhatsApp.</p>
      )}
      <p className="text-xs text-muted-foreground">Los pagos se procesan en Mercado Pago. El envío o retiro debe estar acordado con MiniGains antes de completar el cobro.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
