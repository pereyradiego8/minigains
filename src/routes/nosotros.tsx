import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/nosotros")({
  head: () => pageMeta({ title: "Nosotros", description: "MiniGains: cocina saludable artesanal, en pequeñas tandas y con ingredientes reconocibles.", path: "/nosotros" }),
  component: () => (
    <InfoPage eyebrow="Nosotros" title="Pequeños avances, hechos a mano" lead="MiniGains nace de una idea simple: que comer rico y cuidarse no tenga que ser complicado.">
      <p>Elaboramos granolas, muffins, budines, cookies, panes y crackers de forma artesanal, con recetas propias y una lista de ingredientes que se puede leer.</p>
      <h2>Qué nos importa</h2>
      <p>Las tandas chicas, el sabor casero y la transparencia: publicamos los ingredientes de cada producto y confirmamos precios y disponibilidad antes de cada pedido.</p>
    </InfoPage>
  ),
});