import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contacto")({
  head: () => pageMeta({ title: "Contacto", description: "Cómo contactar a MiniGains para pedidos y consultas.", path: "/contacto", noindex: true }),
  component: () => (
    <InfoPage eyebrow="Contacto" title="Hablemos" lead="Estamos terminando de configurar los canales oficiales de MiniGains.">
      <div className="rounded-3xl bg-gradient-blush p-8">
        <p className="font-display text-2xl">Canales en configuración</p>
        <p className="mt-2 text-muted-foreground">Aún no publicamos un correo ni un formulario verificado, por eso esta página no envía mensajes. Pronto vas a encontrar acá el canal oficial para pedidos.</p>
      </div>
    </InfoPage>
  ),
});