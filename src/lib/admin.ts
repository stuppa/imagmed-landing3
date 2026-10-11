// Utilidades de las páginas del admin: formularios, imágenes y errores legibles.
import sharp from 'sharp';
import type { APIContext } from 'astro';
import { BUCKET, type Supabase } from './supabase';
import { invalidarSitio, type Imagen } from './sitio';

/** Error con un mensaje listo para mostrarse al admin. */
export class ErrorAdmin extends Error {}

export const texto = (f: FormData, campo: string) => String(f.get(campo) ?? '').trim();
export const casilla = (f: FormData, campo: string) => f.get(campo) === 'on';

const MENSAJES: Record<string, string> = {
  '23505': 'Ya existe otro registro con ese slug o nombre.',
  '23503': 'No se puede: hay productos u otros registros que lo usan.',
  '23P01': 'Las fechas se enciman con otra campaña.',
  '23514': 'Algún dato no tiene el formato correcto.',
  '42501': 'Tu sesión no tiene permiso para esto. Vuelve a entrar.',
};

/** Devuelve los datos de una consulta de Supabase o lanza un ErrorAdmin con el motivo en español. */
export function revisar<T>(r: { data: T; error: { code?: string; message: string } | null }): T {
  if (r.error) throw new ErrorAdmin(MENSAJES[r.error.code ?? ''] ?? `Error de la base de datos: ${r.error.message}`);
  return r.data;
}

/**
 * Patrón de cada página del admin: si es POST corre la acción, invalida la caché pública y redirige (303)
 * con «?guardado»; si falla, borra las imágenes que alcanzó a subir y devuelve el mensaje para mostrarlo
 * en la misma página. En GET devuelve ''.
 */
export async function procesarFormulario(
  ctx: Pick<APIContext, 'request' | 'url' | 'redirect' | 'cache' | 'locals'>,
  accion: (f: FormData, subidas: string[]) => Promise<string | void>,
): Promise<Response | string> {
  if (ctx.request.method !== 'POST') return '';
  const subidas: string[] = [];
  try {
    const destino = await accion(await ctx.request.formData(), subidas);
    await invalidarSitio(ctx);
    return ctx.redirect(destino ?? `${ctx.url.pathname}?guardado`, 303);
  } catch (e) {
    await borrarImagenes(ctx.locals.supabase, subidas);
    if (e instanceof ErrorAdmin) return e.message;
    console.error(e);
    return 'Algo falló al guardar. Intenta de nuevo.';
  }
}

// --- Imágenes ---

// Vercel limita el body de una petición a 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const TIPOS: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif' };

interface Reglas {
  /** Ancho / alto exigido (±2 %), p. ej. 4 / 3. */
  proporcion?: number;
  anchoMinimo?: number;
}

/**
 * Valida (formato real con sharp, peso, medidas) y sube al bucket una imagen del formulario.
 * Devuelve null si no se eligió archivo. La ruta se agrega a `subidas` (de procesarFormulario) para limpiar si algo falla después.
 */
export async function subirImagen(
  supabase: Supabase,
  archivo: FormDataEntryValue | null,
  carpeta: string,
  subidas: string[],
  reglas: Reglas = {},
): Promise<Imagen | null> {
  if (!(archivo instanceof File) || archivo.size === 0) return null;
  if (archivo.size > MAX_BYTES) throw new ErrorAdmin(`«${archivo.name}» pesa más de 4 MB; comprímela antes de subirla.`);

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const meta = await sharp(buffer)
    .metadata()
    .catch(() => null);
  const formato = meta?.format === 'heif' && meta.compression === 'av1' ? 'avif' : meta?.format;
  if (!meta?.width || !meta.height || !formato || !TIPOS[formato]) {
    throw new ErrorAdmin(`«${archivo.name}» no es una imagen válida: usa PNG, JPG, WebP o AVIF.`);
  }
  // Fotos de celular giradas por EXIF (orientación 5–8): ancho y alto van al revés.
  const [ancho, alto] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  if (reglas.anchoMinimo && ancho < reglas.anchoMinimo) {
    throw new ErrorAdmin(`«${archivo.name}» mide ${ancho} px de ancho; se necesitan al menos ${reglas.anchoMinimo}.`);
  }
  if (reglas.proporcion && Math.abs(ancho / alto / reglas.proporcion - 1) > 0.02) {
    throw new ErrorAdmin(`«${archivo.name}» mide ${ancho}×${alto}; debe ser proporción 4:3 (p. ej. 1600×1200).`);
  }

  const ruta = `${carpeta}/${crypto.randomUUID()}.${formato === 'jpeg' ? 'jpg' : formato}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, buffer, { contentType: TIPOS[formato], cacheControl: '31536000', upsert: false });
  if (error) throw new ErrorAdmin(`No se pudo subir «${archivo.name}»: ${error.message}`);
  subidas.push(ruta);
  return { ruta, ancho, alto };
}

/** Borra del bucket las imágenes que ya no se usan. Si falla solo queda un archivo huérfano: no se interrumpe. */
export async function borrarImagenes(supabase: Supabase, rutas: (string | null | undefined)[]) {
  const lista = rutas.filter((r): r is string => !!r);
  if (!lista.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(lista);
  if (error) console.error('No se pudieron borrar imágenes', lista, error);
}

/** Rutas que estaban antes y ya no están (imágenes reemplazadas o quitadas). */
export const sobrantes = (antes: (string | null | undefined)[], despues: (string | null | undefined)[]) =>
  antes.filter((r) => r && !despues.includes(r));

// --- Equipo (Edge Function «equipo», dentro de Supabase) ---

/**
 * Llama a la Edge Function del equipo con la sesión del super admin (supabase-js manda su JWT).
 * La función vuelve a comprobar en la base que sea super admin con 2FA; sus errores llegan como ErrorAdmin.
 */
export async function llamarEquipo<T = { ok: true }>(supabase: Supabase, cuerpo: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('equipo', { body: cuerpo });
  if (error) {
    const detalle = await (error as { context?: Response }).context?.json().catch(() => null);
    throw new ErrorAdmin(detalle?.error ?? 'No se pudo contactar al servicio del equipo. Intenta de nuevo.');
  }
  return data as T;
}
