import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { FAQ_ALL, FaqList } from "@/components/FaqList";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/preguntas-frecuentes")({
  head: () => pageMeta({ title: "Preguntas frecuentes", description: "Precios, pedidos, opciones sin TACC, envíos y productos digitales de MiniGains.", path: "/preguntas-frecuentes" }),
  component: () => (
    <InfoPage eyebrow="Ayuda" title="Preguntas frecuentes"><FaqList items={FAQ_ALL} /></InfoPage>
  ),
});