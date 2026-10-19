import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export interface Crumb { label: string; to?: string; params?: Record<string, string> }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link to="/" className="hover:text-primary">Inicio</Link></li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {c.to ? <Link to={c.to} params={c.params} className="hover:text-primary">{c.label}</Link> : <span aria-current="page" className="text-foreground">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageIntro({ eyebrow, title, children, crumbs }: { eyebrow?: string; title: ReactNode; children?: ReactNode; crumbs: Crumb[] }) {
  return (
    <section className="container-page pb-10 pt-8 sm:pt-12">
      <Breadcrumbs items={crumbs} />
      {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
      <h1 className="text-h1 mt-3 max-w-4xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-[1.05rem] text-muted-foreground">{children}</div>}
    </section>
  );
}