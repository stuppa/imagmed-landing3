// pnpm test — procesado de imágenes con sharp (sin Supabase ni Astro).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { contraste } from './contenido.ts';
import { coloresDiseno, recortarLogo, tieneFondo } from './imagenes.ts';

const lienzo = (width: number, height: number, background: string | object, logo: { width: number; height: number; top: number; left: number }) =>
  sharp({ create: { width, height, channels: 4, background } }).composite([
    { input: { create: { width: logo.width, height: logo.height, channels: 4, background: '#c4161c' } }, top: logo.top, left: logo.left },
  ]);

test('recortarLogo: quita el margen transparente y reduce a 1200 px (el del cliente era un cuadrado con el logo en una franja)', async () => {
  const png = await lienzo(2400, 2400, { r: 0, g: 0, b: 0, alpha: 0 }, { width: 2400, height: 600, top: 900, left: 0 }).png().toBuffer();
  const logo = await recortarLogo(png);
  assert.deepEqual([logo.ancho, logo.alto], [1200, 300]);
  assert.equal((await sharp(logo.buffer).metadata()).format, 'png');
});

test('recortarLogo: también el fondo blanco de un JPG', async () => {
  const jpg = await lienzo(900, 900, '#ffffff', { width: 600, height: 200, top: 350, left: 150 }).jpeg().toBuffer();
  const logo = await recortarLogo(jpg);
  assert.ok(logo.ancho >= 600 && logo.ancho < 620 && logo.alto >= 200 && logo.alto < 220, `${logo.ancho}×${logo.alto}`);
});

test('tieneFondo: una foto con fondo blanco sí (la del MX3 del cliente); un recorte transparente no', async () => {
  const equipo = { width: 600, height: 500, top: 100, left: 100 };
  assert.equal(await tieneFondo(await lienzo(800, 800, '#ffffff', equipo).png().toBuffer()), true);
  assert.equal(await tieneFondo(await lienzo(800, 800, '#ffffff', equipo).jpeg().toBuffer()), true);
  assert.equal(await tieneFondo(await lienzo(800, 800, { r: 0, g: 0, b: 0, alpha: 0 }, equipo).png().toBuffer()), false);
});

test('recortarLogo: si la esquina no es fondo (logo sin márgenes) no corta nada', async () => {
  const png = await lienzo(300, 100, '#003399', { width: 100, height: 100, top: 0, left: 200 }).png().toBuffer();
  const logo = await recortarLogo(png);
  assert.deepEqual([logo.ancho, logo.alto], [300, 100]);
});

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
// Diseño de campaña de prueba: un fondo con un bloque de color al centro (la cuarta parte del área).
const diseno = (fondo: string, bloque: string) =>
  sharp({ create: { width: 640, height: 360, channels: 3, background: fondo } })
    .composite([{ input: { create: { width: 320, height: 180, channels: 3, background: bloque } }, top: 90, left: 160 }])
    .png()
    .toBuffer();

test('coloresDiseno: un Buen Fin oscuro con naranja pinta el hero de naranja, con texto blanco', async () => {
  const c = await coloresDiseno(await diseno('#160612', '#ff7a00'));
  const [r, g, b] = rgb(c.acento);
  assert.equal(c.claro, false);
  assert.ok(r > g && g > b, `acento ${c.acento}`);
  assert.ok(contraste(rgb(c.acento), rgb(c.fondo)) >= 4.5);
});

test('coloresDiseno: en un diseño claro con magenta el texto pasa a oscuro y el acento se oscurece hasta leerse', async () => {
  const c = await coloresDiseno(await diseno('#fff7e8', '#d1006f'));
  const [r, g, b] = rgb(c.acento);
  assert.equal(c.claro, true);
  assert.ok(r > b && b > g, `acento ${c.acento}`);
  assert.ok(contraste(rgb(c.acento), rgb(c.fondo)) >= 4.5);
  assert.equal(c.textoAcento, '#ffffff');
});

test('coloresDiseno: un diseño gris se queda con el azul de la marca', async () => {
  const c = await coloresDiseno(await diseno('#3a3a3a', '#9a9a9a'));
  const [r, , b] = rgb(c.acento);
  assert.ok(b > r, `acento ${c.acento}`);
});
