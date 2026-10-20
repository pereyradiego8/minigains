import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { CATEGORIES } from "@/data/categories";
import { getByCategory, getFeatured } from "@/data/catalog";
import { pageMeta } from "@/lib/seo";
import { FAQ_SHORT, FaqList } from "@/components/FaqList";

export const Route = createFileRoute("/")({
  head: () => pageMeta({ title: "Cocina saludable artesanal", description: "Granolas, muffins, budines, panes sin TACC y combos caseros. Pedidos coordinados con precios de referencia.", path: "/" }),
  component: Home,
});

const PILLARS = [
  ["Hecho en pequeñas tandas", "Cada producto se elabora de forma artesanal, con recetas propias."],
  ["Ingredientes reconocibles", "Frutos secos, avena, harina de almendras, frutas y semillas: los ves en la lista."],
  ["Opciones sin TACC", "Varias recetas están indicadas sin TACC en su ficha."],
  ["Pedido sin vueltas", "Armás tu carrito y coordinamos precio final, entrega y pago con vos."],
];

function Home() {
  const featured = getFeatured();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#F5EBDD] via-[#F7E9DF] to-[#E8CAD1]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-36 h-[27rem] w-[27rem] rounded-full bg-[#D7A0AD]/25 blur-3xl" />
          <div className="absolute -bottom-56 right-1/4 h-[30rem] w-[30rem] rounded-full bg-[#FFFFFF]/35 blur-3xl" />
          <div className="absolute right-[3%] top-1/2 hidden aspect-square w-[min(43vw,34rem)] -translate-y-1/2 rotate-[-12deg] rounded-full border border-[#722F43]/15 bg-[#F5EBDD]/45 p-[9%] shadow-[0_24px_90px_-50px_rgba(73,52,58,0.35)] lg:block">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[#722F43]/20 bg-[#D7A0AD]/25 text-center">
              <span className="font-display text-[clamp(5rem,9vw,9rem)] italic leading-none text-[#722F43]/45">M</span>
              <span className="mt-2 font-display text-2xl italic text-[#49343A]/75">Hecho a mano</span>
              <span className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#722F43]/70">MiniGains</span>
            </div>
          </div>
        </div>
        <div className="container-page relative flex flex-col justify-start pt-8 pb-14 sm:pt-12 sm:pb-16 lg:min-h-[clamp(32rem,82vh,52rem)] lg:justify-center lg:py-20">
          <p className="eyebrow fade-up">Cocina saludable · Hecho a mano</p>
          <h1 className="text-display fade-up mt-5 max-w-3xl">Pequeñas cosas ricas que <em className="italic text-primary">suman</em>.</h1>
          <p className="fade-up mt-6 max-w-md text-lg text-muted-foreground">Granolas, muffins, budines y panes artesanales para tus desayunos, meriendas y celebraciones.</p>
          <div className="fade-up mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/productos">Explorar productos <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/como-comprar">Cómo comprar</Link></Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="cat-h">
        <div className="flex items-end justify-between gap-6">
          <h2 id="cat-h" className="text-h2 max-w-lg">Elegí por momento del día</h2>
          <Link to="/productos" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">Ver todo</Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
          {CATEGORIES.filter((c) => c.delivery === "fisico").map((c, i) => {
            const p = getByCategory(c.id)[0];
            return (
              <li key={c.id} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-1" : ""}>
                <Link to="/productos" search={{ categoria: c.id }} className="group block">
                  <ProductImage src={p?.images[0]} alt="" sizes="(min-width:1024px) 20vw, 50vw" className={`${i === 0 ? "aspect-[16/10] lg:aspect-[3/4]" : "aspect-[3/4]"} rounded-2xl [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105`} />
                  <p className="mt-3 font-display text-lg leading-tight group-hover:text-primary">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{getByCategory(c.id).length} productos</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-card py-20" aria-labelledby="dest-h">
        <div className="container-page">
          <p className="eyebrow">Destacados</p>
          <h2 id="dest-h" className="text-h2 mt-3">Los clásicos de la casa</h2>
          <div className="mt-10"><ProductGrid products={featured} /></div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-24 lg:grid-cols-12" aria-labelledby="fil-h">
        <div className="lg:col-span-5">
          <p className="eyebrow">Nuestra filosofía</p>
          <h2 id="fil-h" className="text-h2 mt-3">Comer rico y simple, <em className="italic text-primary">todos los días</em>.</h2>
          <p className="mt-6 text-muted-foreground">Creemos en los pequeños avances: una merienda mejor pensada, un desayuno que te acompañe antes de entrenar. Sin promesas mágicas, con recetas caseras.</p>
          <Link to="/nosotros" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">Conocé MiniGains <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:col-span-7">
          {PILLARS.map(([t, d], i) => (
            <li key={t} className="bg-background p-7">
              <span className="font-display text-sm italic text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page grid gap-10 lg:grid-cols-2" aria-labelledby="faq-h">
        <div>
          <h2 id="faq-h" className="text-h2">Preguntas frecuentes</h2>
          <Link to="/preguntas-frecuentes" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary hover:underline">Ver todas</Link>
        </div>
        <FaqList items={FAQ_SHORT} />
      </section>

      <section className="container-page mt-24">
        <div className="rounded-3xl bg-gradient-blush px-6 py-14 text-center sm:px-12">
          <h2 className="text-h2">¿Querés armar un pedido especial?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Para cumpleaños, cantidades grandes o consultas sobre ingredientes, escribinos.</p>
          <Button asChild size="lg" className="mt-8"><Link to="/contacto">Ir a contacto</Link></Button>
        </div>
      </section>
    </>
  );
}