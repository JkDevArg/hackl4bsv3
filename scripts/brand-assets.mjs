// Genera los iconos, la imagen para redes y el isotipo con transparencia a
// partir del logo original (brand/hackl4bs.png).
//
//   npm run brand
//
// Solo hace falta correrlo si cambia el logo. Lo que produce va versionado.
//
// El logo viene sobre un fondo morado plano. Para usar el isotipo sobre otro
// fondo se le quita ese color y se convierte en transparencia: cada pixel pasa
// a ser "fondo + luz", y la luz se conserva como alfa. Asi el brillo del trazo
// se mantiene en vez de quedar un recorte con borde duro.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SRC = 'brand/hackl4bs.png';
const BG = [0x1e, 0x0f, 0x2d]; // fondo del logo original
const CUBE = { left: 89, top: 349, width: 254, height: 271 }; // isotipo
const FULL = { left: 89, top: 349, width: 834, height: 271 }; // isotipo + texto

await mkdir('src/assets/brand', { recursive: true });

async function sinFondo(region) {
  const { data, info } = await sharp(SRC).extract(region).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0; p < info.width * info.height; p++) {
    const c = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
    // Solo cuenta lo que es MAS claro que el fondo: el logo es luz sobre
    // oscuro. Lo mas oscuro es ruido de la imagen original, y como el fondo
    // tiene canales muy bajos (0x0f), 3 puntos de diferencia ya pesaban un 20%
    // y dejaban manchas grises alrededor del isotipo.
    let a = 0;
    for (let i = 0; i < 3; i++) {
      const d = c[i] - BG[i];
      if (d > 0) a = Math.max(a, d / (255 - BG[i]));
    }
    // Lo que queda de ruido no pasa de 0.014; se corta ahi con margen.
    a = Math.min(1, Math.max(0, (a - 0.02) / 0.98));
    for (let i = 0; i < 3; i++) {
      out[p * 4 + i] = a > 0 ? Math.min(255, Math.max(0, Math.round(BG[i] + (c[i] - BG[i]) / a))) : 0;
    }
    out[p * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

// Isotipo transparente (cabecera) y logo completo transparente (hero, etc.)
await (await sinFondo(CUBE)).png().toFile('src/assets/brand/mark.png');
await (await sinFondo(FULL)).png().toFile('src/assets/brand/logo.png');

// Iconos con fondo solido: en la pantalla de inicio de iOS/Android un icono
// transparente se ve sobre negro o blanco segun el sistema.
const bgHex = '#' + BG.map((v) => v.toString(16).padStart(2, '0')).join('');
async function iconoSolido(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const cube = await sharp(SRC).extract(CUBE).resize(inner, inner, { fit: 'contain', background: bgHex }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: bgHex } })
    .composite([{ input: cube, gravity: 'center' }])
    .png({ palette: true, quality: 92, compressionLevel: 9 });
}
await (await iconoSolido(180, 0.12)).toFile('public/apple-touch-icon.png');
await (await iconoSolido(192, 0.12)).toFile('public/icon-192.png');
await (await iconoSolido(512, 0.2)).toFile('public/icon-512.png'); // zona segura "maskable"

// Favicon: transparente, para que se vea bien en pestanas claras y oscuras.
const fav32 = await (await sinFondo(CUBE)).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const fav48 = await (await sinFondo(CUBE)).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await writeFile('public/favicon-48.png', fav48);
// favicon.ico con el PNG embebido (formato valido desde Windows Vista); los
// navegadores lo piden solos aunque no se enlace.
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(fav32.length, 14); ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, fav32]));

// Imagen para redes (Open Graph / X / LinkedIn / WhatsApp): 1200x630.
const W = 1200, H = 630;
const fondo = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g1" cx="22%" cy="30%" r="60%"><stop offset="0" stop-color="#7c3aed" stop-opacity=".35"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="85%" cy="80%" r="55%"><stop offset="0" stop-color="#3b82f6" stop-opacity=".28"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="100%" height="100%" fill="#0e0818"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="url(#g2)"/>
</svg>`);
const logo = await (await sinFondo(FULL)).resize({ width: 920 }).png().toBuffer();
// JPEG y no PNG: WhatsApp no muestra la vista previa si pasa de ~300 KB.
await sharp(fondo).composite([{ input: logo, gravity: 'center' }]).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og.jpg');

console.log('Listo: src/assets/brand/{mark,logo}.png y public/{favicon.ico,favicon-48.png,apple-touch-icon.png,icon-192.png,icon-512.png,og.jpg}');
