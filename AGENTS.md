## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Notas del proyecto (hackl4bs.com)

- Sitio estático con casi cero JavaScript (solo el cierre del menú móvil en
  Header.astro y el ocultado de eventos pasados en Events.astro). Antes de
  añadir otro `<script>`
  o una integración de framework, valora si se puede hacer con HTML/CSS.
- Nada de recursos de terceros (fuentes, CDN, analíticas): todo se sirve
  desde el propio dominio. El CSP (`security.csp`) lo refuerza.
- **Los `.apk` de wtfuck viven en la RAÍZ del docroot del servidor, no en este
  repo ni en `/projects/`.** El servidor de wtfuck anuncia esa URL a las apps
  instaladas para auto-actualizarse; moverlos rompe las actualizaciones.
  `public/projects/wtfuck/index.html` enlaza al APK con ruta absoluta (`/wtfuck-*.apk`).
  Se regenera con `npm run descarga -- <index.html de publicar-apk.sh>`.
- El despliegue extrae `dist/` sobre el docroot sin borrar lo que ya hay
  (por los `.apk`). Ver README.
- Resaltado de código con Prism, no Shiki: Shiki usa estilos inline que el CSP bloquea.
