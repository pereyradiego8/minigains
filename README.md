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

### Cloudflare Workers: desplegado desde GitHub

- **URL de prueba:** https://minigains.8pereyradiego8.workers.dev
- **Worker:** `minigains`
- **Repositorio conectado:** `pereyradiego8/minigains`, rama `main`
- **Build command:** `bun run build`
- **Deploy command:** `bunx wrangler deploy`
- **Primer build desde Cloudflare:** confirmado exitoso el 19 de octubre de 2026.
- **Auto-build:** habilitado en Workers Builds para nuevas actualizaciones de `main`.

El primer despliegue reemplazó al Worker temporal por la aplicación real. La portada se comprobó desde Browser Rendering de Cloudflare; las otras rutas se deben seguir verificando en un navegador público, con especial atención al carrito y recursos remotos.

Hasta configurar dominio definitivo y verificar precios y stock, **este es un despliegue de prueba**. `VITE_SITE_URL` permanece sin valor; las páginas incluyen `noindex` y el sitemap no publica una URL canónica. Al asignar el dominio comercial HTTPS, establecer esta variable en las variables de **build** de Cloudflare y reconstruir.

Los precios siguen siendo históricos y el carrito no procesa pagos. No conectar ni habilitar una pasarela sin backend comercial seguro.
