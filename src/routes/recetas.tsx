import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/recetas")({
  head: () => pageMeta({ title: "Blog y recetas", description: "Ideas y recetas de MiniGains. Próximamente.", path: "/recetas", noindex: true }),
  component: () => (
    <InfoPage eyebrow="Blog" title="Blog y recetas" lead="Estamos preparando las primeras recetas.">
      <p>Mientras tanto, una idea de la casa: la granola va muy bien con yogur y frutas, o como snack antes de entrenar.</p>
      <Link to="/productos" search={{ categoria: "granolas-barras" }} className="inline-flex min-h-11 items-center font-semibold text-primary underline">Ver granolas</Link>
    </InfoPage>
  ),
});