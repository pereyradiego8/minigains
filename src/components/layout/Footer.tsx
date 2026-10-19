import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/categories";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-plum text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <p className="font-display text-3xl">Mini<em className="italic">Gains</em></p>
          </div>
          <p className="mt-5 max-w-sm font-display text-2xl leading-snug opacity-90">
            Pequeños gestos de cocina casera, para sumar a tu día.
          </p>
        </div>
        <nav aria-label="Categorías" className="md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Tienda</p>
          <ul className="mt-4 space-y-1 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to="/productos" search={{ categoria: c.id }} className="inline-flex min-h-9 items-center opacity-90 hover:opacity-100 hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Información" className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">MiniGains</p>
          <ul className="mt-4 space-y-1 text-sm">
            {([
              ["/nosotros", "Nosotros"],
              ["/como-comprar", "Cómo comprar"],
              ["/preguntas-frecuentes", "Preguntas frecuentes"],
              ["/recetas", "Blog y recetas"],
              ["/contacto", "Contacto"],
              ["/carrito", "Carrito"],
            ] as const).map(([to, l]) => (
              <li key={to}>
                <Link to={to} className="inline-flex min-h-9 items-center opacity-90 hover:opacity-100 hover:underline">{l}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-cream/15">
        <p className="container-page py-6 text-xs opacity-75">
          © {new Date().getFullYear()} MiniGains · Los precios publicados son de referencia y se confirman antes de cada pedido.
        </p>
      </div>
    </footer>
  );
}