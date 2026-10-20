/**
 * Cabeceras defensivas aplicadas sobre las respuestas SSR.
 * La CSP se configurará tras validar los scripts de hidratación de TanStack Start.
 */
export function applySecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // CSP limitada a protecciones compatibles con el SSR e hidratación actuales.
  // No añadir script-src restrictiva sin validar primero TanStack Start en navegador.
  headers.set("Content-Security-Policy", "base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  if (response.status >= 500) {
    headers.set("Cache-Control", "no-store");
  }
  // Copiar headers y stream sin consumir el body original.
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
