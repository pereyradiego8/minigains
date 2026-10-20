import { describe, expect, it } from "vitest";
import { applySecurityHeaders } from "@/lib/security-headers";

describe("security headers de respuestas SSR", () => {
  it("mantiene el cuerpo, status y las cabeceras previas", async () => {
    const res = applySecurityHeaders(
      new Request("https://minigains.example/"),
      new Response("hola", { status: 200, headers: { "Content-Type": "text/plain" } }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("hola");
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
  });

  it("no establece HSTS en HTTP y evita cachear los errores", () => {
    const res = applySecurityHeaders(
      new Request("http://localhost:3000/"),
      new Response("error", { status: 500 }),
    );
    expect(res.headers.has("Strict-Transport-Security")).toBe(false);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
