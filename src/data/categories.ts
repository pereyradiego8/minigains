import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  { id: "granolas-barras", name: "Granolas y barras energéticas", short: "Granolas y barras", description: "Granola casera con frutos secos y miel, y barras crocantes para llevar.", delivery: "fisico" },
  { id: "dulces-saludables", name: "Dulces saludables", short: "Dulces", description: "Muffins, budines, cookies, brownies y alfajores de elaboración artesanal.", delivery: "fisico" },
  { id: "panes-crackers-tartas", name: "Panes, crackers y tartas", short: "Panes y salados", description: "Pan de molde, crackers de garbanzo y tapas para tartas.", delivery: "fisico" },
  { id: "combos", name: "Combos", short: "Combos", description: "Selecciones armadas para desayunos y meriendas de la semana.", delivery: "fisico" },
  { id: "cumpleanos", name: "Boxes de cumpleaños", short: "Cumpleaños", description: "Tortas para celebrar con una opción más saludable.", delivery: "fisico" },
  { id: "ebooks-retos", name: "Ebooks y retos", short: "Ebooks", description: "Contenido digital. Próximamente.", delivery: "digital" },
  { id: "planes-entrenamiento", name: "Planes de entrenamiento", short: "Planes", description: "Planes digitales. Próximamente.", delivery: "digital" },
];

export const getCategory = (id: string): Category | undefined => CATEGORIES.find((c) => c.id === id);
export const isCategoryId = (id: string): id is CategoryId => CATEGORIES.some((c) => c.id === id);