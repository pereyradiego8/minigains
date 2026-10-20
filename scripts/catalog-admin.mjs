#!/usr/bin/env bun
/**
 * Administración desde GitHub: cada edición modifica un archivo versionado.
 * Uso:
 * bun scripts/catalog-admin.mjs check
 * bun scripts/catalog-admin.mjs set <slug> --price 15000 --status disponible
 * bun scripts/catalog-admin.mjs set <slug> --status agotado
 * bun scripts/catalog-admin.mjs set <slug> --visible false
 * bun scripts/catalog-admin.mjs set <slug> --price null
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PRODUCTS_SNAPSHOT } from "../src/data/products.snapshot.ts";

const filepath = fileURLToPath(new URL("../src/data/commerce-overrides.json", import.meta.url));
const slugs = new Set(PRODUCTS_SNAPSHOT.map(x => x.slug));
const statuses = new Set(["consultar", "disponible", "agotado"]);
const data = JSON.parse(readFileSync(filepath, "utf8"));

function check() {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("Formato de catálogo inválido");
  for (const [slug, value] of Object.entries(data)) {
    if (!slugs.has(slug)) throw Error("Producto no reconocido: " + slug);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Configuración inválida: " + slug);
    for (const key of Object.keys(value)) {
      if (!["currentPrice", "status", "visible"].includes(key)) throw Error("Campo no permitido: "+key);
    }
    if ("currentPrice" in value && value.currentPrice !== null && (!Number.isSafeInteger(value.currentPrice) || value.currentPrice <= 0))
      throw Error("Precio inválido para "+slug);
    if ("status" in value && !statuses.has(value.status)) throw Error("Estado inválido para "+slug);
    if ("visible" in value && typeof value.visible !== "boolean") throw Error("Visibilidad inválida para "+slug);
  }
}

try {
  check();
  const [command, slug, ...args] = process.argv.slice(2);
  if (command === "check") {
    console.log(`Catálogo válido: ${slugs.size} productos; ${Object.keys(data).length} registros editados`);
  } else if (command === "set" && slugs.has(slug)) {
    if (args.length < 2 || args.length % 2 !== 0) throw Error("Uso: set <slug> --price <ARS|null> --status <disponible|agotado|consultar> --visible <true|false>");
    const entry = { ...data[slug] };
    for (let i = 0; i < args.length; i += 2) {
      const [key, value] = [args[i], args[i + 1]];
      if (key === "--price") {
        if (value === "null") entry.currentPrice = null;
        else if (/^[0-9]+$/.test(value)) entry.currentPrice = Number(value);
        else throw Error("Precio debe ser un entero positivo o null");
      } else if (key === "--status") entry.status = value;
      else if (key === "--visible" && ["true", "false"].includes(value)) entry.visible = value === "true";
      else throw Error("Parámetro desconocido: "+key);
    }
    data[slug] = entry;
    check();
    writeFileSync(filepath, JSON.stringify(Object.fromEntries(Object.entries(data).sort(([a],[b])=>a.localeCompare(b))), null, 2) + "\n");
    console.log("Registro actualizado:", slug, JSON.stringify(entry));
  } else {
    throw Error("Uso: bun scripts/catalog-admin.mjs check | set <slug> [--price ...] [--status ...] [--visible ...]");
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
