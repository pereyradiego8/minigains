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

La configuración Vite actual usa el adaptador de Lovable/Nitro. La migración a Cloudflare Workers requiere un paso separado de configuración, despliegue y comprobación de compatibilidad. No existe publicación automática configurada desde este repositorio.
