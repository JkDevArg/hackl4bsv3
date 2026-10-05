# hackl4bs.com

Sitio de Hackl4bs hecho con [Astro](https://docs.astro.build). Se compila a HTML
estático: lo único que se sube al servidor es la carpeta `dist/`.

- **Casi cero JavaScript**: el menú móvil usa `popover`, y las animaciones y
  transiciones entre páginas son solo CSS. Solo hay dos scripts inline
  pequeños: uno en `Header.astro` cierra el menú al tocar un enlace de la
  misma página (`/#eventos`), y otro en `Events.astro` oculta los eventos que
  ya pasaron.
- **Nada de terceros**: fuentes, imágenes e iconos se sirven desde el propio
  dominio. Sin analíticas ni CDN, con el mismo criterio que la página de descarga.
- **SEO**: title/description por página, canonical, Open Graph, datos
  estructurados (JSON-LD), `sitemap-index.xml` y `robots.txt` generados solos.
- **CSP** con hashes en cada página (`security.csp` en `astro.config.mjs`).

## Uso diario

```bash
npm install          # la primera vez
npm run dev          # http://localhost:4321, con recarga en vivo
npm run build        # genera dist/
npm run preview      # sirve dist/ tal cual quedará en el servidor
```

Requiere Node 22.12 o superior.

## Dónde está cada cosa

```
src/
  site.config.ts          nombre, URL, descripción, menú y redes  ← empieza aquí
  content/projects/*.md   un archivo por proyecto
  content/events/*.md     un archivo por evento (sección "Próximos eventos")
  pages/
    index.astro           portada (hero + destacados + secciones)
    projects/index.astro  /projects/ — listado de todos los proyectos
    projects/[id].astro   página de detalle para proyectos sin `href`
    404.astro
  components/
    Section.astro         envoltorio para secciones nuevas
    ProjectCard.astro     tarjeta de proyecto
    Hero.astro, Header.astro, Footer.astro, Logo.astro, SEO.astro
  styles/global.css       colores, tipografía, botones, fondo
public/
  projects/wtfuck/index.html   página de descarga de wtfuck (se sirve tal cual)
  og.jpg, favicon.ico, icon-*.png, site.webmanifest
brand/hackl4bs.png        logo original
scripts/
  brand-assets.mjs        regenera iconos e imagen para redes desde el logo
  importar-descarga.mjs   trae la página que genera publicar-apk.sh
  capturas.mjs            portada automática: captura de la página del proyecto
```

## Añadir un proyecto

Crea `src/content/projects/<nombre>.md` (copia `ejemplo.md`):

```yaml
---
title: Nombre
summary: Una o dos frases (máx. 180 caracteres). Sale en la tarjeta y en Google.
category: Herramienta
status: activo            # activo | beta | en desarrollo | archivado
tags: [Python, CLI]
date: 2026-10-01
href: /projects/nombre/   # opcional, ver abajo
cta: Ver proyecto         # texto del enlace en la tarjeta
repo: https://github.com/...
featured: true            # sale en la portada (máx. 3)
order: 2                  # menor = primero
---
Texto en Markdown (solo se usa si NO hay href).
```

Hay dos tipos de proyecto:

- **Con `href`**: la tarjeta lleva a esa URL. Puede ser una página HTML propia
  en `public/projects/<nombre>/index.html`, como la de wtfuck, o un enlace externo.
  Las páginas de `public/projects/` entran solas al sitemap.
- **Sin `href`**: Astro genera `/projects/<nombre>/` con el texto del `.md`.

`draft: true` lo muestra solo en `npm run dev`.

### Portada

- **Imagen propia:** ponla junto al `.md` y añade `cover: ./mi-imagen.webp`
  (como LaSecta). La tarjeta la recorta a 16:9 al compilar.
- **Sin imagen:** corre `npm run capturas`. Toma una captura de la página del
  proyecto (su `href`) con Chrome o Edge en modo invisible, la guarda como
  `<id>-captura.webp` y añade el `cover` al `.md`. Las portadas puestas a mano
  no se tocan nunca.
- **Refrescar capturas** (el CTF cambia cada semana):
  ```bash
  npm run capturas -- --todas     # todas las capturas automáticas
  npm run capturas -- ctf         # solo una
  ```

Si tienes `npm run dev` abierto mientras corre el script, reinícialo para que
vea las portadas nuevas.

## Añadir un evento

Crea `src/content/events/AAAA-MM-DD-nombre.md` (la fecha delante los ordena):

```yaml
---
title: Nombre del evento 2026
summary: Una o dos frases (máx. 200 caracteres).
date: 2026-10-31
startTime: "09:00"        # 24 h, hora de Lima, SIEMPRE entre comillas
endTime: "18:00"          # opcional
hoursNote: Todo el día    # opcional, se añade al horario
venue: UTEC
address: Jr. Medrano Silva 165
district: Barranco
url: https://web-del-evento.com/
participation: [Village oficial, Charla]   # "village" sale resaltado
talks:                                     # opcional, una o varias
  - title: "Título de la charla"
    speaker: Joaquin Centurion
    speakerRole: Co-Founder de Hackl4bs
    time: "16:35"         # sin time/room sale "Horario y sala por confirmar"
    room: Garage
---
```

Luego `npm run capturas` le pone como portada una captura de la web del evento.

**Los eventos pasados se ocultan solos**, en dos capas:

1. Al compilar, los eventos con fecha anterior a hoy no entran al HTML.
2. En el navegador de cada visitante, un script pequeño compara la fecha de
   cada evento con la de hoy en hora de Lima y oculta los pasados. Así un
   evento deja de verse el día siguiente a su fecha **aunque no vuelvas a
   compilar ni subir**. La etiqueta "Próximo" pasa al siguiente evento, y si
   ya no queda ninguno aparece "no hay eventos anunciados".

No hace falta borrar los `.md` de eventos pasados. Cada evento lleva también
datos estructurados `Event` para Google (fecha, lugar y ponente).

## Añadir una comunidad aliada

La sección muestra solo logos, sobre recuadros claros.

1. Prepara el logo (recorta márgenes y lo reduce):
   ```bash
   npm run aliado -- ruta/al/logo.png nombre-comunidad
   ```
   Si el logo es blanco o tiene texto blanco (como CSH o C Cúbico), añade una
   placa oscura para que se vea sobre el recuadro claro:
   ```bash
   npm run aliado -- ruta/al/logo.png nombre-comunidad --placa=#000000
   ```
2. En `src/data/allies.ts`, importa `src/assets/allies/nombre-comunidad.png` y
   añade `{ name: 'Nombre real', logo: ... }`. El nombre no se ve, pero lo
   leen los lectores de pantalla y Google, y aparece al pasar el ratón.

## Añadir una sección

En cualquier página:

```astro
---
import Section from '../components/Section.astro';
---
<Section id="charlas" eyebrow="Charlas" title="Lo que he presentado" intro="Opcional.">
  ...contenido...
</Section>
```

Para que aparezca en el menú, añádela a `NAV` en `src/site.config.ts`
(`{ label: 'Charlas', href: '/#charlas' }`). La clase `reveal` en cualquier
elemento lo hace aparecer al hacer scroll.

## wtfuck: el APK se queda en la RAÍZ

> **No muevas los `.apk` a `/projects/`.** El servidor de wtfuck anuncia
> `WTFUCK_APK_URL=https://hackl4bs.com/wtfuck-AAAAMMDD.apk` y las apps ya
> instaladas se actualizan desde esa URL. Si el archivo cambia de sitio, el
> auto-update se rompe para todos sin ningún error visible.

Lo único que se mueve es la página: de `/` pasa a `/projects/wtfuck/`, y su botón
apunta a `/wtfuck-AAAAMMDD.apk` (absoluto, en la raíz).

### Publicar una versión nueva de wtfuck

1. En el repo de wtfuck, como siempre: `bash despliegue/publicar-apk.sh`.
2. Sube **solo el APK** a la raíz del docroot, como antes. **No subas su
   `index.html` a la raíz**: ahora la portada es la de este sitio y la
   pisarías. Las instrucciones que imprime el script todavía mueven los dos
   archivos. Conviene corregir esa línea en `publicar-apk.sh`.
3. Aquí, trae la página nueva (corrige sola el enlace del APK):
   ```bash
   npm run descarga -- ../wtfuck/despliegue/descarga/index.html
   ```
4. Opcional: actualiza `date` en `src/content/projects/wtfuck.md`.
5. `npm run build` y despliega (abajo).
6. Las variables `WTFUCK_APK_*` del servidor, como siempre. La URL sigue en la raíz.

## Desplegar (VPS con CloudPanel + nginx)

Desde Git Bash:

```bash
npm run build
tar -C dist -czf web.tar.gz .
scp web.tar.gz TU-USUARIO@TU-VPS:/tmp/
```

En el VPS:

```bash
cd /home/hackl4bs/htdocs/hackl4bs.com
sudo rm -rf _astro                 # assets viejos (nombres con hash); los .apk no están ahí
sudo tar --no-same-owner -xzf /tmp/web.tar.gz -C .
sudo chown -R hackl4bs:hackl4bs .  # el usuario del sitio en CloudPanel; ajústalo si es otro
rm /tmp/web.tar.gz
```

`tar -x` sobrescribe lo que trae y **no borra lo demás**, así que los `.apk` de
la raíz se conservan. No uses `rsync --delete` ni vacíes la carpeta antes.

### Ajuste de nginx (una sola vez)

En CloudPanel → el sitio → **Vhost**, dentro del bloque `server` que sirve el
443, añade:

```nginx
error_page 404 /404.html;
```

Sin esto, una URL inexistente muestra la página 404 genérica de nginx en vez
de la del sitio.

La plantilla por defecto de CloudPanel suele cachear ya CSS, fuentes e
imágenes. Compruébalo tras el primer despliegue (cambia el nombre por uno real
de `dist/_astro/`):

```bash
curl -sI https://hackl4bs.com/_astro/NOMBRE.css | grep -iE "cache-control|expires"
```

Si no sale nada, añade al vhost:

```nginx
location /_astro/ { expires 1y; access_log off; }
```

(Se usa `expires` y no `add_header`: un `add_header` dentro de un `location`
anula las cabeceras de seguridad que el sitio define a nivel de `server`.)

## Logo e iconos

Si cambia el logo, reemplaza `brand/hackl4bs.png` y corre `npm run brand`.
Regenera el isotipo sin fondo, los favicons, los iconos de app y `og.jpg`
(la imagen que se ve al compartir el enlace).
