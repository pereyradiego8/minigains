import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ_ALL: [string, string][] = [
  ["¿Los precios publicados son finales?", "No. Son precios de referencia tomados de un relevamiento previo. El valor final se confirma antes de cada pedido."],
  ["¿Cómo hago un pedido?", "Agregá productos al carrito, compartí la consulta o copiá su resumen. Mientras configuramos el WhatsApp oficial, el sitio no recibe pedidos automáticamente y no realiza cobros."],
  ["¿Tienen opciones sin TACC?", "Sí, algunos productos están indicados como sin TACC en su ficha. Si tenés celiaquía o alergias, consultanos antes de pedir sobre el proceso de elaboración."],
  ["¿Hacen envíos?", "Las zonas y costos de entrega se coordinan al confirmar el pedido."],
  ["¿Cómo se conservan los productos?", "Al ser artesanales y sin conservantes agregados en varias recetas, te indicamos la conservación al entregar."],
  ["¿Venden productos digitales?", "Ebooks, retos y planes de entrenamiento están en preparación. Cuando estén disponibles se entregarán de forma digital."],
];
export const FAQ_SHORT = FAQ_ALL.slice(0, 4);

export function FaqList({ items }: { items: [string, string][] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map(([q, a], i) => (
        <AccordionItem key={q} value={`f${i}`}>
          <AccordionTrigger className="min-h-14 text-left font-display text-lg hover:no-underline">{q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}