// Procesado de imágenes con sharp. Va aparte de admin.ts para poder probarlo con `pnpm test` (sin Astro).
import sharp from 'sharp';
import { paletaDiseno } from './contenido.ts';

/**
 * Los logos oficiales suelen traer mucho margen (el de Mindray era un cuadrado de 1200 px con el logo en una franja de
 * 300) y en la landing salían diminutos: se guarda solo el logo, en PNG y de 1200×600 px como máximo. Solo se recorta si
 * la esquina es fondo (transparente o casi blanca); si no, el logo llega a la orilla y se cortaría parte de él.
 */
export async function recortarLogo(buffer: Buffer) {
  const esquina = await sharp(buffer)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .toColourspace('srgb')
    .ensureAlpha()
    .raw()
    .toBuffer();
  const [r = 0, g = 0, b = 0, alfa = 0] = esquina;
  const imagen = alfa < 16 || Math.min(r, g, b) > 240 ? sharp(buffer).trim() : sharp(buffer);
  const { data, info } = await imagen
    .resize({ width: 1200, height: 600, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, ancho: info.width, alto: info.height };
}

/** Colores del diseño de una campaña (paletaDiseno), sobre una miniatura de 64×64; lo transparente cuenta como negro. */
export async function coloresDiseno(buffer: Buffer) {
  const pixeles = await sharp(buffer)
    .resize(64, 64, { fit: 'fill' })
    .flatten({ background: '#000000' })
    .toColourspace('srgb')
    .raw()
    .toBuffer();
  return paletaDiseno(pixeles);
}

/** Si las cuatro esquinas son opacas, la foto trae fondo: no es el recorte transparente que piden el hero y el catálogo. */
export async function tieneFondo(buffer: Buffer) {
  // En miniatura (32×32) para no decodificar a tamaño completo una foto grande.
  const esquinas = await sharp(buffer).resize(32, 32, { fit: 'fill' }).toColourspace('srgb').ensureAlpha().raw().toBuffer();
  return [0, 31, 32 * 31, 32 * 32 - 1].every((i) => (esquinas[i * 4 + 3] ?? 0) > 240);
}
