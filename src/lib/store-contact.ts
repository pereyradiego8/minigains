import { formatARS } from "@/lib/format";

interface OrderItem {
  qty: number;
  product: { name: string; referencePrice: number | null; currentPrice?: number | null };
}

/** Una URL de WhatsApp solo se genera después de configurar y validar el número oficial. */
export function officialWhatsApp(value: unknown = import.meta.env["VITE_WHATSAPP_NUMBER"]): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\s()+.-]/g, "");
  return /^[1-9][0-9]{7,14}$/.test(cleaned) ? cleaned : null;
}

export function whatsAppLink(message: string, number: unknown = import.meta.env["VITE_WHATSAPP_NUMBER"]): string | null {
  const destination = officialWhatsApp(number);
  return destination ? `https://wa.me/${destination}?text=${encodeURIComponent(message)}` : null;
}

export function orderSummary(lines: readonly OrderItem[]): string {
  const list = lines.map(({ qty, product }) => {
    const value = product.currentPrice ?? product.referencePrice;
    const label = product.currentPrice != null ? "precio informado" : "referencia histórica";
    return `• ${qty} × ${product.name}${value == null ? " (precio a consultar)" : ` — ${label}: ${formatARS(value * qty)}`}`;
  });
  return [
    "Hola, quiero consultar por este pedido de MiniGains:",
    "",
    ...list,
    "",
    "Los precios son informativos y se confirman antes de la compra.",
    "¿Podrían confirmarme precios actuales, disponibilidad y opciones de entrega?",
    "",
    "Este mensaje no confirma ni paga un pedido.",
  ].join("\n");
}
