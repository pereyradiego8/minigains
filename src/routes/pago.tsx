import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/format";

interface CheckResponse {
  status: string;
  amount: number;
  currency: string;
}
export const Route = createFileRoute("/pago")({
  validateSearch: (query: Record<string, unknown>) => ({
    pedido: typeof query["pedido"] === "string" && /^[0-9a-f-]{36}$/i.test(query["pedido"]) ? query["pedido"] : "",
  }),
  head: () => pageMeta({ title: "Estado de tu pago", description: "Revisá si Mercado Pago confirmó el pago de tu pedido.", path: "/pago", noindex: true }),
  component: PaymentResult,
});
function PaymentResult() {
  const { pedido } = Route.useSearch();
  const [status, setStatus] = useState<CheckResponse | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!pedido) return;
    let active = true;
    let attempt = 0;
    const check = async () => {
      try {
        const response = await fetch("/api/mercadopago/status?pedido=" + encodeURIComponent(pedido), { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo consultar el estado del pedido.");
        const data = await response.json() as CheckResponse;
        if (active) setStatus(data);
      } catch {
        if (active) setError("No podemos verificar el pago en este momento. Consultá con MiniGains antes de repetirlo.");
      }
    };
    void check();
    const timer = setInterval(() => {
      if (++attempt >= 36) { clearInterval(timer); return; }
      void check();
    }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [pedido]);

  const approved = status?.status === "approved";
  const reversed = status?.status === "refunded" || status?.status === "charged_back";
  const pending = status?.status === "pending" || status?.status === "awaiting_payment" || status?.status === "created";
  return (
    <>
      <PageIntro crumbs={[{ label: "Pago" }]} title="Estado de tu pago" />
      <div className="container-page max-w-2xl">
        <div className="space-y-5 rounded-3xl bg-card p-7 shadow-soft">
          {!pedido && <p>El enlace no incluye un identificador de pedido válido.</p>}
          {pedido && !status && !error && <p>Verificando la operación de Mercado Pago...</p>}
          {approved && <h1 className="font-display text-2xl text-primary">Pago aprobado y verificado</h1>}
          {pending && <h1 className="font-display text-2xl">Esperando confirmación de Mercado Pago</h1>}
          {reversed && <h1 className="font-display text-2xl">El pago fue revertido</h1>}
          {status && !approved && !pending && !reversed && <h1 className="font-display text-2xl">Pago no aprobado o cancelado</h1>}
          {status && <p>Importe registrado: <strong>{formatARS(status.amount)}</strong></p>}
          <p className="text-sm text-muted-foreground">
            El resultado se consulta al servidor y se confirma con Mercado Pago. Volver al sitio no significa que el pago esté aprobado.
            La entrega o retiro se coordina con MiniGains.
          </p>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/productos">Volver a la tienda</Link></Button>
            <Button asChild><Link to="/contacto">Contactar MiniGains</Link></Button>
          </div>
        </div>
      </div>
    </>
  );
}
