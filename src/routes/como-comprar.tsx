import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { pageMeta } from "@/lib/seo";

const STEPS = [
  ["Elegí", "Recorré el catálogo y sumá productos al carrito."],
  ["Solicitá", "En el carrito tocá “Solicitar pedido” y copiá el resumen."],
  ["Coordinamos", "Por el canal de contacto confirmamos precio final, disponibilidad, entrega y forma de pago."],
];

export const Route = createFileRoute("/como-comprar")({
  head: () => pageMeta({ title: "Cómo comprar", description: "Cómo hacer un pedido en MiniGains: elegí, solicitá y coordinamos.", path: "/como-comprar" }),
  component: () => (
    <InfoPage eyebrow="Ayuda" title="Cómo comprar" lead="Todavía no cobramos online: cada pedido se confirma de forma directa.">
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="rounded-2xl bg-card p-6"><span className="font-display italic text-primary">0{i + 1}</span><p className="mt-2 font-display text-xl">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">Nunca te vamos a pedir datos de tarjeta ni contraseñas a través de este sitio.</p>
    </InfoPage>
  ),
});