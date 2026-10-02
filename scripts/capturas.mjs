// Portadas automaticas: a cada proyecto o evento sin `cover` le saca una
// captura de su pagina (el `href` del proyecto o la `url` del evento) y la
// deja como portada.
//
//   npm run capturas                -> solo lo que no tiene portada
//   npm run capturas -- --todas     -> rehace tambien las capturas ya hechas
//                                      (util para el CTF, que cambia cada semana)
//   npm run capturas -- ctf         -> solo ese archivo (rehaciendola si ya existe)
//
// Usa Chrome o Edge en modo sin ventana; no instala nada. Si el navegador no
// esta en la ruta habitual: CHROME_PATH="/ruta/al/navegador" npm run capturas
//
// Las capturas que haya puesto uno a mano (cualquier `cover` que no sea
// <id>-captura.webp) no se tocan nunca.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

// Carpeta de cada coleccion y el campo que tiene la URL a fotografiar.
const COLECCIONES = [
  { dir: 'src/content/projects', campoUrl: 'href' },
  { dir: 'src/content/events', campoUrl: 'url' },
];
const ANCHO = 1280;
const ALTO = 720; // 16:9, lo mismo que muestra la tarjeta

const args = process.argv.slice(2);
const todas = args.includes('--todas');
const solo = args.filter((a) => !a.startsWith('--'));

const candidatos = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const navegador = candidatos.find((p) => existsSync(p));
if (!navegador) {
  console.error('No encontre Chrome ni Edge. Indica la ruta con CHROME_PATH=...');
  process.exit(1);
}

const campo = (fm, k) => fm.match(new RegExp(`^${k}:\\s*(.+?)\\s*$`, 'm'))?.[1]?.replace(/^['"]|['"]$/g, '');

const archivos = [];
for (const { dir, campoUrl } of COLECCIONES) {
  if (!existsSync(dir)) continue;
  for (const f of await readdir(dir)) if (f.endsWith('.md')) archivos.push({ DIR: dir, campoUrl, archivo: f });
}
let hechas = 0;

for (const { DIR, campoUrl, archivo } of archivos) {
  const id = archivo.replace(/\.md$/, '');
  if (solo.length && !solo.includes(id)) continue;

  const ruta = join(DIR, archivo);
  const texto = await readFile(ruta, 'utf8');
  const fm = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!fm) continue;

  const href = campo(fm, campoUrl);
  const cover = campo(fm, 'cover');
  const nombreCaptura = `${id}-captura.webp`;
  const esCapturaAuto = cover === `./${nombreCaptura}`;

  if (cover && !esCapturaAuto) continue; // portada puesta a mano: no se toca
  if (cover && esCapturaAuto && !todas && !solo.includes(id)) continue;

  // Que URL fotografiar
  let url;
  if (href && /^https?:\/\//.test(href)) {
    url = href;
  } else if (href?.startsWith('/')) {
    const local = resolve('public', `.${href}`, href.endsWith('/') ? 'index.html' : '');
    if (!existsSync(local)) {
      console.log(`- ${id}: ${href} no esta en public/, me lo salto`);
      continue;
    }
    url = pathToFileURL(local).href;
  } else {
    console.log(`- ${id}: sin ${campoUrl}, no hay pagina que capturar`);
    continue;
  }

  process.stdout.write(`- ${id}: ${url} ... `);
  // Perfil temporal propio: si el navegador ya esta abierto con el perfil
  // normal, Windows le pasaria la orden a esa ventana e ignoraria --headless.
  const perfil = await mkdtemp(join(tmpdir(), 'captura-'));
  const png = join(perfil, 'captura.png');
  try {
    await promisify(execFile)(
      navegador,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${perfil}`,
        `--window-size=${ANCHO},${ALTO}`,
        '--force-device-scale-factor=1',
        // Tiempo para que las paginas hechas con JavaScript (como el CTF)
        // terminen de cargar sus datos antes de la foto.
        '--virtual-time-budget=12000',
        `--screenshot=${png}`,
        url,
      ],
      { timeout: 60_000 },
    );
    await sharp(png)
      .resize(ANCHO, ALTO, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(join(DIR, nombreCaptura));

    if (!cover) {
      // Se anade `cover:` justo antes del cierre del bloque de datos.
      const nuevo = texto.replace(/^(---\r?\n[\s\S]*?)(\r?\n---)/, `$1\ncover: ./${nombreCaptura}$2`);
      await writeFile(ruta, nuevo);
    }
    hechas++;
    console.log('ok');
  } catch (e) {
    console.log(`fallo: ${e.message.split('\n')[0]}`);
  } finally {
    await rm(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}

console.log(hechas ? `\n${hechas} captura(s) nueva(s). Revisalas antes de publicar.` : '\nNada que capturar.');
