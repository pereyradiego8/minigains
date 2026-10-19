/** Presupuesto preventivo para recursos cliente (gzip de archivos, no RUM). */
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { exit } from "node:process";

const candidates = [".output/public/assets", "dist/client/assets", "dist/assets"];
const root = candidates.find((candidate) => existsSync(candidate));
if (!root) {
  console.error("No se encuentra el directorio de assets en " + candidates.join(", "));
  exit(1);
}
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((item) => {
    const path = join(folder, item.name);
    if (item.isDirectory()) return walk(path);
    return item.isFile() ? [path] : [];
  });
}

const files = walk(root).filter((file) => [".js", ".css"].includes(extname(file)));
if (files.length === 0) {
  console.error("El build no generó bundles web en " + root);
  exit(1);
}
const sizes = files.map((file) => ({
  file, ext: extname(file), gzip: gzipSync(readFileSync(file)).byteLength,
}));
const js = sizes.filter((f) => f.ext === ".js");
const css = sizes.filter((f) => f.ext === ".css");
const largestJs = Math.max(0, ...js.map((f) => f.gzip));
const largestCss = Math.max(0, ...css.map((f) => f.gzip));
const totalJs = js.reduce((sum, f) => sum + f.gzip, 0);
const kb = (n) => (n / 1024).toFixed(1);
console.log(`Assets ${root}: JS total ${kb(totalJs)} KiB gzip; JS mayor ${kb(largestJs)} KiB; CSS mayor ${kb(largestCss)} KiB`);

if (largestJs > 155 * 1024 || totalJs > 235 * 1024 || largestCss > 24 * 1024) {
  console.error("Presupuesto de recursos web excedido.");
  exit(1);
}
