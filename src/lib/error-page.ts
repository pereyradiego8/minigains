/** Página de error autocontenida, sin scripts inline ni datos internos. */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="utf-8" />
    <title>No se pudo cargar · MiniGains</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 16px/1.6 system-ui, sans-serif; background: #F5EBDD; color: #49343A; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
      main { max-width: 32rem; width: 100%; text-align: center; }
      h1 { font-size: 1.5rem; }
      a { display: inline-block; margin: .4rem; padding: .7rem 1rem; border-radius: .7rem; text-decoration: none; background: #722F43; color: #fff; }
      a + a { background: transparent; color: #722F43; border: 1px solid #722F43; }
      a:focus-visible { outline: 3px solid #49343A; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <h1>No pudimos cargar esta página</h1>
      <p>Ocurrió un error temporal. Podés volver a intentar o regresar al inicio.</p>
      <a href="">Reintentar</a>
      <a href="/">Volver al inicio</a>
    </main>
  </body>
</html>`;
}
