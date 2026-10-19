import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { CATEGORIES } from "@/data/categories";
import { useCart } from "@/hooks/cart";
import { Logo } from "./Logo";

const NAV = [
  { to: "/productos", label: "Tienda" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/recetas", label: "Recetas" },
  { to: "/como-comprar", label: "Cómo comprar" },
  { to: "/contacto", label: "Contacto" },
] as const;

function SearchBox({ onDone, id }: { onDone?: () => void; id: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/productos", search: q.trim() ? { q: q.trim().slice(0, 60) } : {} });
    onDone?.();
  };
  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={q}
        maxLength={60}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar granola, muffins…"
        className="h-11 w-full rounded-full border border-input bg-card/70 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </form>
  );
}

export function Header() {
  const { units, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <p className="container-page py-2 text-center text-xs tracking-wide">
          Elaboración artesanal · Opciones sin TACC · Pedidos coordinados por mensaje
        </p>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-[4.5rem]">
          <Sheet open={menu} onOpenChange={setMenu}>
            <SheetTrigger asChild>
              <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent lg:hidden" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-background">
              <SheetTitle className="font-display text-2xl">Menú</SheetTitle>
              <SheetDescription className="sr-only">Navegación principal y categorías</SheetDescription>
              <div className="mt-6"><SearchBox id="search-mobile" onDone={() => setMenu(false)} /></div>
              <nav aria-label="Principal móvil" className="mt-6 flex flex-col">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="flex min-h-12 items-center border-b border-border/60 font-display text-xl" activeProps={{ className: "text-primary" }}>
                    {n.label}
                  </Link>
                ))}
                <Link to="/preguntas-frecuentes" onClick={() => setMenu(false)} className="flex min-h-12 items-center border-b border-border/60 font-display text-xl">Preguntas frecuentes</Link>
              </nav>
              <p className="eyebrow mt-8">Categorías</p>
              <ul className="mt-3 flex flex-col">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <Link to="/productos" search={{ categoria: c.id }} onClick={() => setMenu(false)} className="flex min-h-11 items-center text-sm hover:text-primary">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>

          <Logo />

          <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent" activeProps={{ className: "text-primary" }}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden w-64 md:block xl:w-80"><SearchBox id="search-desktop" /></div>

          <button
            onClick={() => setOpen(true)}
            className="relative ml-auto grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover md:ml-0"
            aria-label={`Abrir carrito, ${units} ${units === 1 ? "unidad" : "unidades"}`}
          >
            <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
            {units > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blush px-1 text-[0.65rem] font-bold text-plum">
                {units}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
}

export { X };