// Prepara el logo de una comunidad aliada para la seccion "Comunidades aliadas".
//
//   npm run aliado -- <imagen> <nombre-archivo>
//   npm run aliado -- <imagen> <nombre-archivo> --placa=#000000
//
// Deja src/assets/allies/<nombre-archivo>.png y despues hay que anadirlo a
// src/data/allies.ts con su nombre.
//
// - Recorta el margen sobrante (fondo transparente o blanco) para que todos
//   los logos ocupen lo mismo en su recuadro. Los logos que ya vienen en una
//   placa de color (un cuadrado azul, un circulo negro) se dejan enteros.
// - --placa=COLOR: monta el logo sobre una placa redondeada de ese color. Para
//   logos blancos o con texto blanco, que sobre el recuadro claro no se verian.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const [entrada, nombre] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const placa = process.argv.find((a) => a.startsWith('--placa='))?.split('=')[1];
if (!entrada || !nombre) {
  console.error('Uso: npm run aliado -- <imagen> <nombre-archivo> [--placa=#000000]');
  process.exit(1);
}

const MAX = 480; // px del lado mayor: 2x del recuadro mas grande en pantalla

const { data, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const esquina = [...data.subarray(0, 4)];
const transparente = esquina[3] < 20;
const blanco = esquina[3] > 200 && esquina[0] > 235 && esquina[1] > 235 && esquina[2] > 235;

let img = sharp(data, { raw: info });
if (transparente || blanco) {
  // trim() toma como fondo el color de la esquina superior izquierda.
  img = sharp(await img.trim({ threshold: 12 }).png().toBuffer());
}
let logo = await img.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true }).png().toBuffer();

if (placa) {
  const m = await sharp(logo).metadata();
  const pad = Math.round(Math.max(m.width, m.height) * 0.16);
  const w = m.width + pad * 2;
  const h = m.height + pad * 2;
  const r = Math.round(Math.min(w, h) * 0.14);
  const fondo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="${placa}"/></svg>`);
  logo = await sharp(fondo).composite([{ input: logo, gravity: 'center' }]).png().toBuffer();
  logo = await sharp(logo).resize(MAX, MAX, { fit: 'inside' }).png().toBuffer();
}

await mkdir('src/assets/allies', { recursive: true });
const salida = `src/assets/allies/${nombre}.png`;
await sharp(logo).png({ compressionLevel: 9 }).toFile(salida);
const m = await sharp(salida).metadata();
console.log(`${salida}  ${m.width}x${m.height}${transparente ? '  (recortado: fondo transparente)' : blanco ? '  (recortado: fondo blanco)' : '  (placa original, sin recortar)'}${placa ? `  + placa ${placa}` : ''}`);
