/** Presupuesto por archivo/total de recursos para detectar regresiones de peso.
 * Son tamaños de archivos comprimidos, NO métricas Lighthouse ni transferencia real.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { exit } from "node:process";

const root = ".output/public/assets";
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() ? [path] : [];
  });
}

const files = walk(root).filter((path) => [".js", ".css"].includes(extname(path)));
if (!files.length) {
  console.error("No hay bundles de cliente en " + root);
  exit(1);
}
const sizes = files.map((path) => ({
  path,
  kind: extname(path),
  gzip: gzipSync(readFileSync(path)).byteLength,
}));
const js = sizes.filter((f) => f.kind === ".js");
const css = sizes.filter((f) => f.kind === ".css");
const largestJs = Math.max(0, ...js.map((x) => x.gzip));
const largestCss = Math.max(0, ...css.map((x) => x.gzip));
const totalJs = js.reduce((sum, x) => sum + x.gzip, 0);
const kb = (n) => (n / 1024).toFixed(1);
console.log(`Bundles: ${files.length} | JS total: ${kb(totalJs)} KiB gzip | JS mayor: ${kb(largestJs)} KiB | CSS mayor: ${kb(largestCss)} KiB`);

// Umbrales basados en la compilación inicial de MiniGains.
// No representan el peso exacto descargado en una página individual.
if (largestJs > 155 * 1024 || totalJs > 235 * 1024 || largestCss > 24 * 1024) {
  console.error("Presupuesto de recursos excedido. Revisar imports y assets.");
  exit(1);
}
