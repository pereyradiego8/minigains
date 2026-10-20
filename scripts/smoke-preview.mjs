/** Verificación HTTP local de la compilación Cloudflare Workers (sin desplegar). */
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

const host = "127.0.0.1";
const port = 4173;
const base = `http://${host}:${port}`;
const proc = spawn("bun", ["x", "vite", "preview", "--host", host, "--port", String(port), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: false,
});
let diagnostic = "";
for (const stream of [proc.stdout, proc.stderr]) {
  stream.on("data", (chunk) => { diagnostic = (diagnostic + String(chunk)).slice(-12000); });
}
let ok = false;
try {
  for (let attempt = 0; attempt < 35; attempt++) {
    if (proc.exitCode !== null) throw new Error("El servidor de preview terminó inesperadamente. " + diagnostic);
    try {
      const res = await fetch(base + "/", { signal: AbortSignal.timeout(3000) });
      const body = await res.text();
      if (!res.ok) throw new Error(`Homepage HTTP ${res.status}: ${body.slice(0,350)}`);
      if (!body.includes("MiniGains")) throw new Error("El HTML no contiene la marca MiniGains");
      if (res.headers.get("x-content-type-options") !== "nosniff") throw new Error("Falta X-Content-Type-Options");
      const unknown = await fetch(base + "/ruta-que-no-existe-12345", { signal: AbortSignal.timeout(3000) });
      if (unknown.status !== 404) throw new Error(`404 incorrecto: ${unknown.status}`);
      const expectedPages = [
        ["/productos", "Todos los productos"],
        ["/productos/granola-sin-tacc-500g", "Granola"],
        ["/nosotros", "MiniGains"],
        ["/como-comprar", "Cómo comprar"],
        ["/contacto", "Contacto"],
        ["/recetas", "Recetas"],
        ["/preguntas-frecuentes", "Preguntas"],
        ["/carrito", "Carrito"],
      ];
      for (const [path, expected] of expectedPages) {
        const page = await fetch(base + path, { signal: AbortSignal.timeout(5000) });
        const html = await page.text();
        if (!page.ok || !html.includes(expected)) {
          throw new Error(`Ruta ${path} no disponible: HTTP ${page.status}`);
        }
      }
      const categoryImages = [...body.matchAll(/<img\\b[^>]*>/g)].slice(0, 5).map((x) => x[0]);
      if (categoryImages.length !== 5 || categoryImages.some((tag) => tag.includes("opacity-0"))) {
        throw new Error("Las imágenes de categorías no deben quedar ocultas en el SSR.");
      }
      const favicon = await fetch(base + "/favicon.svg", { signal: AbortSignal.timeout(5000) });
      if (!favicon.ok || !(await favicon.text()).includes("<svg")) throw new Error("Favicon no disponible");
      console.log("HTTP smoke aprobado: inicio, categorías visibles, 8 rutas, favicon, cabeceras y 404.");
      ok = true;
      break;
    } catch (error) {
      if (attempt === 34) throw error;
      await pause(450);
    }
  }
} catch (error) {
  console.error("Falló smoke test HTTP local:", error);
  console.error(diagnostic);
} finally {
  proc.kill("SIGTERM");
}
if (!ok) process.exitCode = 1;
