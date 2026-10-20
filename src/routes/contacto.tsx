import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { InfoPage } from "@/components/layout/InfoPage";
import { officialWhatsApp } from "@/lib/store-contact";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contacto")({
  head: () => pageMeta({ title: "Contacto", description: "Consultas sobre productos y pedidos de MiniGains.", path: "/contacto", noindex: true }),
  component: Contact,
});

function Contact() {
  const number = officialWhatsApp();
  return (
    <InfoPage eyebrow="Contacto" title="Hablemos" lead="¿Querés consultar por productos, ingredientes o un pedido especial?">
      <div className="rounded-3xl bg-gradient-blush p-8">
        {number ? (
          <>
            <p className="font-display text-2xl">Escribinos por WhatsApp</p>
            <p className="mt-2 text-muted-foreground">Coordinamos precios vigentes, disponibilidad, envíos y formas de pago antes de confirmar tu compra.</p>
            <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
            </a>
          </>
        ) : (
          <>
            <p className="font-display text-2xl">Estamos habilitando nuestro contacto oficial</p>
            <p className="mt-2 text-muted-foreground">Para evitar dirigirte a un número incorrecto, todavía no publicamos un WhatsApp de MiniGains. Podés preparar y compartir tu consulta desde el carrito; la tienda no la recibe automáticamente.</p>
            <Link to="/carrito" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline">Ir a mi carrito <ArrowRight className="h-4 w-4" /></Link>
          </>
        )}
      </div>
    </InfoPage>
  );
}
