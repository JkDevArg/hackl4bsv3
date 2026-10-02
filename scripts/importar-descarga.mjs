// Trae la pagina de descarga que genera publicar-apk.sh (en el repo de la app)
// y la deja en public/projects/<proyecto>/index.html.
//
//   npm run descarga -- ../wtfuck/despliegue/descarga/index.html
//   npm run descarga -- <ruta-al-index.html> <proyecto>      (por defecto: wtfuck)
//
// Por que hace falta tocarla: la plantilla enlaza el APK con ruta RELATIVA
// (href="wtfuck-AAAAMMDD.apk"). Eso funcionaba con la pagina en la raiz; en
// /projects/wtfuck/ apuntaria a /projects/wtfuck/wtfuck-....apk, que no existe.
//
// El APK se queda en la RAIZ del dominio a proposito: es la URL que el
// servidor anuncia en WTFUCK_APK_URL y de la que las apps ya instaladas bajan
// las actualizaciones. Moverlo romperia el auto-update de todo el mundo.
// Asi que aqui solo se hace absoluto el enlace: href="/wtfuck-AAAAMMDD.apk".
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const [src, slug = 'wtfuck'] = process.argv.slice(2);
if (!src) {
  console.error('Uso: npm run descarga -- <ruta al index.html generado> [proyecto]');
  process.exit(1);
}

const html = await readFile(src, 'utf8');
let cambios = 0;
const out = html.replace(/href="(?![a-z]+:|\/|#)([^"]+\.apk)"/gi, (_, file) => {
  cambios++;
  return `href="/${file}"`;
});

const apks = [...out.matchAll(/href="\/([^"]+\.apk)"/gi)].map((m) => m[1]);
if (apks.length === 0) {
  console.error('AVISO: no encontre ningun enlace a un .apk en la pagina. Revisa que sea la correcta.');
  process.exit(1);
}

const destDir = `public/projects/${slug}`;
await mkdir(destDir, { recursive: true });
await writeFile(`${destDir}/index.html`, out);

console.log(`Listo: ${destDir}/index.html (${cambios} enlace(s) corregido(s))`);
console.log(`La pagina enlaza a: ${[...new Set(apks)].map((a) => '/' + a).join(', ')}`);
console.log('Ese APK tiene que estar subido en la RAIZ del docroot, no en /projects/.');
