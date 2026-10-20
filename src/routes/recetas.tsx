import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { pageMeta } from "@/lib/seo";

const IDEAS = [
  {
    title: "Vasito de yogur, fruta y granola",
    description: "Una merienda sencilla para preparar en pocos minutos.",
    ingredients: ["Yogur natural a elección", "Fruta fresca lavada y cortada", "Granola MiniGains a gusto"],
    steps: "Poné yogur en un vaso, agregá la fruta y terminá con granola justo antes de comer para mantener su textura.",
  },
  {
    title: "Tostadas dulces para desayunar",
    description: "Una manera distinta de disfrutar un pan artesanal.",
    ingredients: ["Pan de molde", "Queso untable o yogur espeso", "Rodajas de banana o fruta de estación"],
    steps: "Tostá el pan, untalo y completá con fruta fresca. Servilo enseguida.",
  },
  {
    title: "Fruta con crocante de granola",
    description: "Un postre de pocos ingredientes y sin pasos complicados.",
    ingredients: ["Fruta de estación", "Granola a gusto", "Opcional: yogur"],
    steps: "Cortá la fruta en un bowl y sumá la granola antes de servir. Si te gusta una textura cremosa, agregá yogur.",
  },
] as const;

export const Route = createFileRoute("/recetas")({
  head: () => pageMeta({ title: "Ideas y recetas", description: "Ideas sencillas para disfrutar granola, frutas y productos artesanales MiniGains.", path: "/recetas" }),
  component: Recipes,
});

function Recipes() {
  return (
    <InfoPage eyebrow="Ideas de la cocina" title="Ideas ricas y sencillas" lead="Tres formas fáciles de combinar lo que te gusta. Adaptá cada propuesta a tus preferencias y necesidades alimentarias.">
      <div className="grid gap-5 sm:grid-cols-2">
        {IDEAS.map((idea, index) => (
          <article key={idea.title} className="rounded-3xl bg-card p-6">
            <span className="eyebrow">Idea 0{index + 1}</span>
            <h2 className="mt-3 font-display text-2xl">{idea.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{idea.description}</p>
            <h3 className="mt-6 text-sm font-semibold">Para prepararlo</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{idea.ingredients.map(item => <li key={item}>{item}</li>)}</ul>
            <h3 className="mt-5 text-sm font-semibold">Paso a paso</h3>
            <p className="mt-2 text-sm text-muted-foreground">{idea.steps}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">Los ingredientes pueden contener alérgenos: revisá siempre la información de los productos que elijas.</p>
      <Link to="/productos" className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary underline">Explorar productos</Link>
    </InfoPage>
  );
}
