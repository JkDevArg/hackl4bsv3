// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync } from 'node:fs';
import { SITE_URL } from './src/site.config';

// Las paginas que viven tal cual en public/projects/<nombre>/index.html (como
// la de descarga de wtfuck) no las genera Astro, asi que el sitemap no las ve.
// Se buscan aqui para que entren solas al anadir una carpeta nueva.
const staticProjectPages = existsSync('public/projects')
  ? readdirSync('public/projects', { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(`public/projects/${d.name}/index.html`))
      .map((d) => `${SITE_URL}/projects/${d.name}/`)
  : [];

export default defineConfig({
  site: SITE_URL,
  // Cada pagina sale como carpeta/index.html y las URL acaban en "/": es lo
  // que nginx sirve sin configuracion extra y evita duplicados en Google.
  trailingSlash: 'always',
  build: { format: 'directory' },

  integrations: [sitemap({ customPages: staticProjectPages })],

  // Fuentes servidas desde el propio dominio (nada de Google Fonts): mismo
  // criterio que la pagina de descarga, ningun tercero se entera de la visita.
  // Astro genera tambien fallbacks con metricas ajustadas para que el texto no
  // salte cuando carga la fuente.
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Space Grotesk Variable',
      cssVariable: '--font-display',
      weights: ['300 700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
      options: { package: '@fontsource-variable/space-grotesk' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'JetBrains Mono Variable',
      cssVariable: '--font-mono',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
      options: { package: '@fontsource-variable/jetbrains-mono' },
    },
  ],

  // Content-Security-Policy con hashes de cada <style>/<script> que Astro
  // emite. Si alguien consigue inyectar HTML, el navegador no lo ejecuta.
  security: { csp: true },

  // Prism y no Shiki (el de serie): Shiki colorea el codigo con style="..."
  // en cada linea y el CSP de arriba lo bloquea. Prism usa clases, y los
  // colores estan en src/pages/projects/[id].astro.
  markdown: { syntaxHighlight: 'prism' },
});
