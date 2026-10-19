# MiniGains

Tienda web artesanal hecha con React, TypeScript, TanStack Start, Tailwind CSS y Bun.

## Desarrollo

Requiere Bun 1.4.3 o superior.

```bash
bun install --frozen-lockfile
bun run dev
```

Verificación local:

```bash
bunx tsc --noEmit
bun run lint
bun run test
bun run build
node scripts/check-bundle-budget.mjs
bun audit --audit-level=moderate
```

## SEO y previews

Copiar `.env.example` a `.env.local` y configurar `VITE_SITE_URL` con el **dominio HTTPS definitivo**, sin barra de ruta ni credenciales. Se inyecta en la compilación (es público, **no es un secreto**).

Sin un dominio válido configurado, las páginas que utilizan `pageMeta` llevan `noindex`, no generan URL canónica y el sitemap devuelve 404. Esto protege las previews de la indexación accidental.

`historico/` fue eliminado deliberadamente. No volver a publicarlo como recurso estático.

## Imágenes

El catálogo usa fotografías publicadas en el CDN original de Tiendanube. La app muestra un fallback visual si alguna URL deja de responder. Antes de pasar a producción conviene migrarlas a un almacenamiento autorizado bajo nuestro control y generar variantes reales en WebP/AVIF.

## Comercio

Los importes son **referencias históricas**, no precios ni inventario en vivo. El carrito es local y no realiza cobros ni envía pedidos. Verificar productos, precios y canales comerciales antes del lanzamiento.

## Integración

El proyecto emplea el adaptador oficial `@cloudflare/vite-plugin` junto a `wrangler.jsonc`. Conserva `src/server.ts` como entrada personalizada para cabeceras de seguridad SSR.

Para comprobar el build:
```bash
bun install --frozen-lockfile
bun run build
bun run deploy:check
```
Para publicar manualmente con sesión autorizada de Cloudflare:
```bash
bun run deploy
```
**La publicación desde GitHub requiere autorizar la Cloudflare GitHub App** en Workers & Pages → Worker MiniGains → Settings → Builds → Connect, si no existe la conexión. No agregues tokens de API en el repositorio.

### Activación de Workers Builds

La conexión Cloudflare ↔ GitHub para `pereyradiego8/minigains` ya fue autorizada y registrada. El Worker `minigains` existe, pero **no sirve todavía la aplicación real**. Se creó inicialmente sin ruta pública con una respuesta temporal HTTP 503 y `noindex`.

Falta completar una sola vez la autorización del token de Workers Builds desde el panel de Cloudflare, porque el acceso OAuth de esta integración no permite generar tokens API. En [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages), ingresar a `minigains` → **Settings → Builds → Connect** y seleccionar GitHub, repositorio `pereyradiego8/minigains`, rama `main`. Dejar:
- Directorio raíz: `/`
- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- Build token: **generar automáticamente en el panel** (no insertar en el repositorio)
- Variables de build: mantener `VITE_SITE_URL` sin configurar hasta disponer del dominio HTTPS definitivo

Guardar la integración y lanzar el primer build desde Cloudflare. Verificar en la URL entregada por Cloudflare que la homepage, el catálogo, el carrito, `sitemap.xml`, 404 y cabeceras de seguridad se comporten correctamente. La URL `*.workers.dev` se podrá habilitar entonces según lo que permita la cuenta.

La cuenta no tiene una zona de dominio personalizado. Mantener las previews `noindex` hasta configurar `VITE_SITE_URL` con dominio definitivo. El checkout no está implementado; no activar pagos hasta integrar un proveedor seguro.
