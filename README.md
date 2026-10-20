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

## Gestión comercial de productos

Los **33 productos importados** conservan precios de referencia del sitio anterior. No se presupone stock ni precio actual. Se puede gestionar cada artículo mediante `src/data/commerce-overrides.json` sin cambiar las fichas originales. Para actualizar los datos desde un entorno con Bun:

```bash
bun scripts/catalog-admin.mjs check
bun scripts/catalog-admin.mjs set granola-sin-tacc-500g --price 15000 --status disponible
bun scripts/catalog-admin.mjs set brownie-batata --status agotado
bun scripts/catalog-admin.mjs set brownie-batata --visible false
```

**Los ejemplos anteriores no son valores actuales**: nunca ejecutarlos sin verificar con quien vende. De forma predeterminada, los 33 productos siguen con estado `consultar`, sin precio vigente confirmado. Registrar los cambios en una rama y abrir un pull request; GitHub Actions valida la configuración y Cloudflare publica los cambios integrados en `main`. No hay un panel web de administración abierto: requiere autenticación y autorización antes de implementarlo.

## Pedidos y WhatsApp

El botón del carrito abre la función nativa de compartir del dispositivo (o copia el resumen como alternativa). Ninguna de estas acciones constituye el envío a MiniGains; la compra se confirma posteriormente.

Al disponer del **WhatsApp oficial de MiniGains**, configurá `VITE_WHATSAPP_NUMBER` solo en las variables de build de Cloudflare, con el código de país y sin prefijo `+`. Volvé a desplegar. El sitio genera entonces enlaces `wa.me` con el pedido y contactos directos. Este dato no es secreto, pero **no usar contactos de otros negocios**.

El dominio comercial `VITE_SITE_URL` y las fotografías alojadas en recursos propios siguen pendientes. No migrar imágenes de terceros a R2 sin permiso de uso; crear un bucket puede implicar cargos. Hasta entonces se mantienen las URL originales y su tratamiento de errores.
