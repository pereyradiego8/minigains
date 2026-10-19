const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export const formatARS = (n: number | null): string => (n == null ? "Consultar" : ars.format(n));

/** Solo permite URLs https (o rutas internas) — bloquea javascript:, data:, etc. */
export function safeHref(url: string): string | null {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "mailto:" ? u.href : null;
  } catch {
    return null;
  }
}