/** Verificación HTTP local de la compilación Cloudflare Workers (sin desplegar). */
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

const host = "127.0.0.1";
const port = 4173;
const base = `http://${host}:${port}`;
const proc = spawn("bun", ["run", "preview", "--", "--host", host, "--port", String(port), "--strictPort"], {
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
      console.log("HTTP smoke aprobado: homepage SSR, cabeceras y respuesta 404.");
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
